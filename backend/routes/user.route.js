import {Router} from 'express'
import { getUser, getUsers } from '../controller/user.controller.js'

const userRouter = Router()

userRouter.get('/',getUsers)

userRouter.get('/:id',getUser)

userRouter.post('/',(req,res)=>{
    res.send('create user')
})

export default userRouter;
