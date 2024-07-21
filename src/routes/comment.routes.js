import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route('/:videoId')
    .get(getVideoComments)
    .post(upload.none(), addComment)

router.route('/c/:commentId')
    .patch(upload.none(), updateComment)
    .delete(deleteComment)


export default router