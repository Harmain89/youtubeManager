import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route('/').post(upload.none(), createPlaylist)

router.route('/:playlistId')
    .get(getPlaylistById)
    .patch(upload.none(), updatePlaylist)
    .delete(deletePlaylist)

router.route("/add/:playlistId").patch(upload.none(), addVideoToPlaylist);

router.route("/remove/:playlistId").patch(upload.none(), removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;