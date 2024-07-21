import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors"
import { ApiErrorProduction } from "./utils/ApiErrorProduction.js";

const app = express();

app.use(ApiErrorProduction)

app.use(cors({
    origin: process.env.CROSS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))

app.use(express.urlencoded({extended: true, limit: "16kb"}))

app.use(express.static("public"))

app.use(cookieParser())


// routes import
import userRouter from "./routes/user.routes.js"
import likeRouter from "./routes/like.routes.js"
import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import playlistRouter from "./routes/playlist.routes.js"


// routes declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/tweets', tweetRouter)
app.use('/api/v1/playlists', playlistRouter)


export {app}