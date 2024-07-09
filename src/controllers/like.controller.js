import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId?.trim()) {
        throw new ApiError(400, "Video Id required.")
    }
    
    const videoExists = await Video.findOne({
        _id: videoId
    });

    if(!videoExists) {
        throw new ApiError(404, "Video not found.");
    }


    const existingLike = await Like.findOne({
        $and: [
            {
                video: videoId
            },
            {
                likedBy: req.user?._id
            }
        ]
    })

    if(existingLike) {
        await Like.deleteOne({
            _id: existingLike?._id
        })

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    liked: false
                },
                "Video Unliked"
            )
        )
    }
    else {
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })
        
        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    liked: true
                },
                "Video Liked"
            )
        )
    }
    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    
    if(!commentId?.trim()) {
        throw new ApiError(400, "Comment Id required.")
    }
    
    const commentExists = await Comment.findOne({
        _id: commentId
    });

    if(!commentExists) {
        throw new ApiError(404, "Comment not found.");
    }


    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if(existingLike) {
        await Like.deleteOne({
            _id: existingLike?._id
        })

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    liked: false
                },
                "Comment Unliked"
            )
        )
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })
        
        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    liked: true
                },
                "Comment Liked"
            )
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    
    
    if(!tweetId?.trim()) {
        throw new ApiError(400, "Tweet Id required.")
    }
    
    const tweetExists = await Tweet.findOne({
        _id: tweetId
    });

    if(!tweetExists) {
        throw new ApiError(404, "Tweet not found.");
    }


    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if(existingLike) {
        await Like.deleteOne({
            _id: existingLike?._id
        })

        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    liked: false
                },
                "Tweet Unliked"
            )
        )
    }
    else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })
        
        return res.status(201).json(
            new ApiResponse(
                201,
                {
                    liked: true
                },
                "Tweet Liked"
            )
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    try {
        const userId = req.user._id; // Assuming user ID is available in the request

        // Find all likes by the user for videos
        const likes = await Like.find({ 
            likedBy: userId,
            video: {
                $exists: true
            }
        }).populate('video');

        // console.log(likes);

        // Extract the video details
        const getAllLikedVideos = likes.map(like => like.video);




        // -------------------------------------- Throw Aggregation pipelines ###########

        // const getAllLikedVideos = await Like.aggregate([
        //     {
        //         $match: {
        //             likedBy: userId
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "videos",
        //             localField: "video",
        //             foreignField: "_id",
        //             as: "videoDetails"
        //         }
        //     },
        //     {
        //         $unwind: "$videoDetails"
        //     }
        // ])

        // const likedVideos = getAllLikedVideos.map(like => like.videoDetails);


        if(!getAllLikedVideos.length) {
            throw new ApiError(200, "User did not liked any video yet.")
        }

        return res.status(200).json(
            new ApiResponse(200, getAllLikedVideos, "Liked Videos Fetched.")
        )
    
        
    } catch (error) {
        throw new ApiError(400, "Something went wrong.")
    }

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}