import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js"
import mongoose from "mongoose";


const createPlaylist = asyncHandler(async (req, res) => {

    const { name, description, videoId } = req.body;
    const owner = req.user?._id;

    if([name, videoId].some((field) => !field || field === '')) {
        throw new ApiError(400, "All fields are required.")
    }

    const playlist = await Playlist.create({
        name,
        description: description ?? null,
        videos: videoId,
        owner
    })

    return res.status(200).json(new ApiResponse(200, playlist, `Playlist - ${name} Created`))
})

const getUserPlaylists = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if(!userId) {
        throw new ApiError(400, "User Id is required.")
    }

    const playlist = await Playlist.find({
        owner: userId
    })

    if(Object.keys(playlist).length > 0) {
        return res.status(200).json(new ApiResponse(200, playlist, "Playlist Fetched"))
    }

    return res.status(200).json(new ApiResponse(200, [], "Playlist not found."))
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if(!playlistId) {
        throw new ApiError(400, "Playlist Id is required.")
    }

    const playlist = await Playlist.find({
        _id: playlistId
    })

    if(Object.keys(playlist).length > 0) {
        return res.status(200).json(new ApiResponse(200, playlist, "Playlist Fetched"))
    }

    return res.status(200).json(new ApiResponse(200, [], "Playlist not found."))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Playlist or Video Id.");
    }

    if([playlistId, videoId].some((field) => !field || field === '')) {
        throw new ApiError(400, "Playlist & Video Id is required.")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist) {
        return res.status(404).json(new ApiResponse(404, [], "Playlist not found."))
    }
    
    const videoExists = await Playlist.findOne({
        _id: playlistId,
        videos: {
            $elemMatch: {
                $eq: videoId
            }
        }
    })

    // console.log();

    if(!videoExists) {
        playlist.videos.push(new mongoose.Types.ObjectId(videoId))
        await playlist.save()
    }
    else {

        return res.status(200).json(new ApiResponse(200, playlist, "Video already exists in Playlist."))
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Video added to playlist."))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { videoId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playlistId) || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Playlist or Video Id.");
    }

    if([playlistId, videoId].some((field) => !field || field === '')) {
        throw new ApiError(400, "Playlist & Video Id is required.")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist) {
        return res.status(404).json(new ApiResponse(404, [], "Playlist does not exist."))
    }
    
    const videoExists = await Playlist.findOne({
        _id: playlistId,
        videos: {
            $elemMatch: {
                $eq: videoId
            }
        }
    })

    // console.log();

    if(videoExists) {
        playlist.videos.pull(new mongoose.Types.ObjectId(videoId))
        await playlist.save()
    }
    else {

        return res.status(200).json(new ApiResponse(200, playlist, "Video does not exist in Playlist."))
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Video removed from playlist."))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if(!playlistId) {
        throw new ApiError(400, "Playlist Id is required.")
    }

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id.")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist) {
        throw new ApiError(400, "Playlist does not exist.")
    }

    if(name) {
        playlist.name = name
    }

    if(description) {
        playlist.description = description
    }
    
    playlist.save()

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist updated."))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if(!playlistId) {
        throw new ApiError(400, "Playlist's Id is required.");
    }

    if(!mongoose.Types.ObjectId.isValid(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id.")
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId
    })

    if(!playlist) {
        throw new ApiError(404, "Playlist not found.")
    }

    res.status(201).json(new ApiResponse(201, playlist, "Playlist deleted."))
})

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, updatePlaylist, deletePlaylist }