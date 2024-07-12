import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route('/')
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: 'video_to_publish',
                maxCount: 1
            },
            {
                name: 'thumbnail_to_publish',
                maxCount: 1
            }
        ]),
        publishAVideo
    )


router.route('/:videoId')
    .get(getVideoById)
    .patch(upload.single("thumbnail_to_publish"), updateVideo)
    .delete(deleteVideo)

router.route('/toggle/publish/:videoId').patch(togglePublishStatus)


export default router;