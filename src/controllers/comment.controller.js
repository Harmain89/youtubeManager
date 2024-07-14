import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


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


export { addComment }