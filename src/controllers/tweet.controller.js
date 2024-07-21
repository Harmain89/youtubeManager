import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const owner = req.user?._id;

    if(!content) {
        throw new ApiError(200, "Content field is required.");
    }
    
    const tweet = await Tweet({
        owner,
        content
    })
    
    const tweetCreated = await tweet.save();
    
    if(tweetCreated) {
        res.status(201).json(new ApiResponse(201, tweetCreated, "Tweet Added."))
    }

    throw new ApiError(400, "Tweet did not create.");
})


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if(!userId) {
        new ApiError(200, "User Id is required.")
    }

    const tweets = await Tweet.find({
        owner: userId
    })

    if(Object.keys(tweets).length < 1) {
        throw new ApiError(404, "Tweets not found.")
    }

    res.status(200).json(new ApiResponse(200, tweets, "Tweets Fetched."))
})


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if(!tweetId) {
        throw new ApiError(400, "Tweet Id is required.")
    }

    const tweet = await Tweet.findById(tweetId)

    // console.log(tweet);

    if(!tweet) {
        throw new ApiError(404, "Tweet not found.")
    }

    if(content) {
        tweet.content = content;
        await tweet.save();
    }

    res.status(200).json(new ApiResponse(200, tweet, "Tweet Updated."))
})


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if(!tweetId) {
        throw new ApiError(400, "Tweet Id is required.")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId
    })

    if(!tweet) {
        throw new ApiError(404, "Tweet not found.")
    }

    res.status(201).json(new ApiResponse(201, tweet, "Tweet deleted."))
})


export { createTweet, getUserTweets, updateTweet, deleteTweet }