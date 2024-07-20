import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10, sortBy = "CreatedAt", sortType = "desc" } = req.query;

    if(!videoId) {
        throw new ApiError(400, "videoId is required");
    }

    const sort = {};
    sort[sortBy] = sortType === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;


    // Construct the aggregation pipelines
    const pipeline = [];

    pipeline.push({
        $match: {
            video: new mongoose.Types.ObjectId(videoId)
        }
    })

    pipeline.push({
        $skip: skip
    })

    pipeline.push({
        $sort: sort
    })

    pipeline.push({
        $limit: parseInt(limit)
    })


    
    try {
        const $result = await Comment.aggregate(pipeline);
    
        res.status(200).json(
            new ApiResponse(200, $result, "Video Comments Fetched.")
        )
        
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error)
    }
    
    // console.log(videoId);
})

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const owner = req.user?._id;

    if([videoId, content, owner].some((field) => !field || field?.trim === '')) {
        throw new ApiError(200, "All fields are required")
    }

    const commented = await Comment.create({
        content,
        video: videoId,
        owner
    })

    if(commented) {
        return res.status(201).json(new ApiResponse(201, commented, "Commented"))
    }

    throw new ApiError(400, "Something Went Wrong")
})


export { getVideoComments, addComment }