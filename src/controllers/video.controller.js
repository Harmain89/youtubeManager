import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import mongoose from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { deleteCloudinaryImage, uploadOnCloudinary } from "../utils/cloudinary.js"



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    // Convert sortType to 1 or -1 for MongoDB
    const sort = {}
    sort[sortBy] = sortType === 'asc' ? 1 : -1


    // Pagination
    const skip = (page - 1) * limit

    // Construct the aggregation pipeline
    const pipeline = []

    // Match stage
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            }
        })
    }

    if (userId) {
        pipeline.push({
            $match: {
                owner: userId
            }
        })
    }

    // Sorting stage
    pipeline.push({
        $sort: sort
    })

    // Pagination stages
    pipeline.push({
        $skip: skip
    })

    pipeline.push({
        $limit: parseInt(limit)
    })

    // Facet stage to get total count
    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $addFields: { videoId: "$_id" } }] // Add additional fields if needed
        }
    })
    
    try {
        const results = await Video.aggregate(pipeline)
        // console.log(results[0].data);
        const videos = results[0].data
        const totalVideos = results[0].metadata[0] ? results[0].metadata[0].total : 0

        res.status(200).json(
            new ApiResponse(200, {
                videos,
                totalPages: Math.ceil(totalVideos / limit),
                currentPage: page
            }, "Videos Fetched.")
        )
    } catch (error) {
        throw new ApiError(500, "Internal Server Error", error)
    }
})


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    // TODO: get video, upload to cloudinary, create video

    
    if( Object.keys(req.body).length === 0 || [title, description].some((field) => !field || field.trim() === "") ) {
        throw new ApiError(200, "All fields are required")
    }
    
    
    // const videoLocalPath = '';
    const videoLocalPath = req.files?.video_to_publish[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail_to_publish[0]?.path;

    // console.log(req.files?.thumbnail_to_publish[0]?.path);
    
    if(!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "video file is required")
    }
    
    const video_to_publish = await uploadOnCloudinary(videoLocalPath)
    const thumbnail_to_publish = await uploadOnCloudinary(thumbnailLocalPath)

    const uploadedVideo = await Video.create({
        title: title,
        description: description,
        videoFile: video_to_publish?.url || "",
        duration: video_to_publish?.duration || 0,
        thumbnail: thumbnail_to_publish?.url || "",
        owner: req.user?._id
    })
    
    // console.log(thumbnail_to_publish);

    return res.status(201).json(
        new ApiResponse(
            201,
            uploadedVideo,
            "true"
        )
    )
})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const videoExists = await Video.find({
        $and: [
            {
                _id: videoId,
            },
            {
                isPublished: true
            }
        ]
    })

    if(!videoExists) {
        throw new ApiError(404, "Video Not Found.")
    }

    return res.status(200).json(
        new ApiResponse(200, videoExists, videoExists == '' ? "Maybe Unavailable" : "Video Fetched Successfully.")
    )
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    //TODO: update video details like title, description, thumbnail



    // if( Object.keys(req.body).length < 1 ) {
    //     throw new ApiError(200, "There\'s no field to update.")
    // }

    const video = await Video.findOne({
        _id: new mongoose.Types.ObjectId(videoId)
    })

    if(!video) {
        throw new ApiError(404, "Video Not Found")
    }

    const thumbnailPublicId = await video.extractPublicId();


    if(title) {
        video.title = title;
    }
    if(description) {
        video.description = description;
    }
    
    if(req.file?.path) {

        const thumbnailLocalPath = req.file?.path;
        
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        video.thumbnail = thumbnail?.url;
        
        // console.log(thumbnail);


        if(thumbnail) {
    
            const deleted = await deleteCloudinaryImage(thumbnailPublicId)
        
            if(deleted == null) {
                throw new ApiError(400, "Something went wrong with cloudinary delete.")
            }
        }
    }

    const updatedVideo = await video.save();
    


    return res.status(201).json(new ApiResponse(201, updatedVideo, "Video Updated"))
})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video


    const video = await Video.findOneAndDelete({
        _id: videoId
    }).select("-isPublished")

    if(!video) {
        throw new ApiError(404, "Video not found.")
    }

    res.status(201).json(new ApiResponse(201, video, "Video deleted."))
})


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findOne({
        _id: videoId
    })

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const changePublishStatus = await video.changePublishStatus();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                isPublished: changePublishStatus
            },
            "Video publish status changed."
        )
    )
})


export { getAllVideos, getVideoById, publishAVideo, updateVideo, deleteVideo, togglePublishStatus }