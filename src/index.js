import 'dotenv/config';
import express from "express";
import dbConnection from "./DB/db.connection.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Messages/message.controller.js";




const app = express();
app.use(express.json());

app.use('/user' , userRouter);
app.use('/messages' , messageRouter);


// error handling middleware
app.use( async (err , req , res , next) => {
    console.log(err.message);

    if(req.session && req.session.inTransaction()){
        // abort transaction
        await req.session.abortTransaction();
        // end session
        req.session.endSession();
    }
    res.status(err.status || 500 ).json({message: "Something went wrong" , error: err.message , stack: err.stack});
});


// Not found middleware
app.use((req , res , next) => {
    res.status(404).json({message: "Route not found"});
});

dbConnection();
const PORT = +process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});