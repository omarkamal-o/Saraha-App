    import { verifyToken } from "../Utils/token.utils.js";
    import BlackListedToken from "../DB/Models/black-listed-token.models.js";
    import User from "../DB/Models/user.model.js";


    export const authenticateToken = async (req , res , next) => {
        let headerToken = req.headers.authorization || req.headers.accesstoken || req.headers['x-access-token'];
        if(!headerToken){
            return res.status(401).json({message: "Unauthorized"});
        }

        let token = headerToken;
        if(typeof token === 'string' && token.startsWith("Bearer ")){
            token = token.split(" ")[1];
        }
        if(!token){
            return res.status(401).json({message: "Unauthorized"});
        }

        // verify the token
        let decodedData;
        try {
            decodedData = verifyToken(token , process.env.JWT_ACCESS_SECRET);
        } catch (error) {
            return res.status(401).json({message: "invalid token"});
        }
        if(!decodedData?.jti){
            return res.status(401).json({message: "invalid token"});
        }
        // check if the token is blacklisted
        const isTokenBlackListed = await BlackListedToken.findOne({tokenId: decodedData.jti});
        if(isTokenBlackListed){
            return res.status(401).json({message: "Token is blacklisted"});
        }


        // get user data from the database
        const user = await User.findById(decodedData?._id, '-password').lean();
        if(!user){
            return res.status(401).json({message: "User not found"});
        }

        req.loggedInUser = {...user , tokenId: decodedData.jti , expirationDate: decodedData.exp}
        next();
    }