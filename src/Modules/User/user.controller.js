import { Router } from "express";
import * as userServices from './Services/user.services.js';
import { authenticateToken } from "../../Middlewares/authentication.middlewares.js";
import { authorizationMiddleware } from "../../Middlewares/authorization.middleware.js";
import { privileges } from "../../Common/enums/user.enums.js";

const router = Router();

router.post('/signup' , userServices.signUpServices);
router.post('/confirm-email' , userServices.confirmEmailServices);
router.post('/signin' , userServices.signInServices);
router.post('/refresh-token' , userServices.RefreshTokenServices);
router.put('/update-account' , authenticateToken , userServices.UpdateAccountServices);
router.put('/update-password' , authenticateToken , userServices.UpdatePasswordService);
router.delete('/delete-account' , authenticateToken , userServices.DeleteAccountService);
router.get('/list-users' ,  authenticateToken , authorizationMiddleware(privileges.ADMINS) , userServices.ListUsersService);
router.post('/logout' , authenticateToken , userServices.LogOutServices);

export default router;