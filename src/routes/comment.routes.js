import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, getVideoComments } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route('/:videoId')
    .get(getVideoComments)
    .post(upload.none(), addComment)


export default router