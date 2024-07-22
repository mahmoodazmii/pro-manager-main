import {Router} from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { getUser, loginUser, registerUser, updateAccountInfo } from "../controllers/user.controller.js";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/user', verifyJWT, getUser);
router.patch('/account', verifyJWT, updateAccountInfo)

export default router;