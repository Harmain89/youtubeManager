import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    // controller to return channel list to which user has subscribed

    const result = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $facet: {
                data: [
                    {
                        $project: {
                            _id: 1,
                            subscriber: 1,
                            channel: 1
                        }
                    }
                ],
                subscribedChannelsCount: [
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            count: 1
                        }
                    }
                ]
            }
        }
    ]);


    const channels = result[0]?.data;
    const subscribedChannelsCount = result[0].subscribedChannelsCount[0] ? result[0].subscribedChannelsCount[0].count : 0;

    channels.push({ subscribedChannelsCount })

    res.status(200).json(
        new ApiResponse(200, channels, "Channels fetched")
    )
})

const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription

    const { channelId } = req.params;
    const userId = req.user?._id;

    if(!channelId) {
        throw new ApiError(400, "ChannelId required")
    }

    const subscriptionExists = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if(subscriptionExists) {
        const deleted = await Subscription.deleteOne({
            _id: subscriptionExists?._id
        })

        if(deleted) {
            res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        subscription: false
                    },
                    "Channel Un-Subscriberd"
                )
            )
        }

        throw new ApiError(400, "Something went wrong with un-subscribing the channel.")
    }
    else {
        const inserted = await Subscription.create({
            subscriber: userId,
            channel: channelId
        })

        if(inserted) {
            res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        subscription: true
                    },
                    "Channel Subscriberd"
                )
            )
        }

        throw new ApiError(400, "Something went wrong with subscribing the channel.")
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // controller to return subscriber list of a channel

    const { channelId } = req.params;

    if(!channelId) {
        throw new ApiError(400, "channelId required")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    })

    if(Array.isArray(subscribers) && subscribers.length > 0) {
        
        res.status(200).json(new ApiResponse(200, subscribers, "Subscribers of channel fetched successully"))
    }
    
    res.status(200).json(new ApiResponse(200, subscribers, "No subscribers found of this channel"))
})


export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers }