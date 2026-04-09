import {Router} from 'express'
import { signUp,signIn,signOut } from '../controller/auth.controller.js';
const authRouter = Router()

authRouter.post('/sign-up',signUp);
authRouter.post('/register',signUp);
authRouter.post('/sign-in',signIn);
authRouter.post('/login',signIn);
authRouter.post('/sign-out',signOut);
authRouter.post('/logout',signOut);





export default authRouter;
