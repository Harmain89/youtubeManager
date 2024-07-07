import { Router } from "express";
import { getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT, logoutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/get-current-user').get(verifyJWT, getCurrentUser)

router.route('/get-user-channel-profile/:username').get(verifyJWT, getUserChannelProfile)


export default router