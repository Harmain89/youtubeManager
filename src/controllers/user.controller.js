import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


let isloggedIn = false;

const generateAccessAndRefreshTokens = async (userId) => {
    try {

        const user = await User.findOne(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })


        return { accessToken, refreshToken }
        
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access & Refresh Tokens.");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend.
    // Validation - not empty.
    // check if user already exists: username, email.
    // check for images, check for avatar.
    // upload them to cloudinary.
    // create user object - create entry in db.
    // remove password & refresh token field from response.
    // check for user creation.
    //  return res.

    const { fullName, email, username, password } = req.body;

    // console.log("email: ", email);

    if ( [fullName, email, username, password].some((field) => field?.trim() === "") ) {

        throw new ApiError(200, "All fields are required.")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required.")
    }
    

    let coverImageLocalPath;
    
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage;
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required2.")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user.")
    }

    
    return res.status(201).json(

        new ApiResponse(201, createdUser, "User registered successully.")
    )

})


const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user.
    // password check.
    // Access & Refresh Token.
    // send cookie.

    const {email, username, password} = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(!user) {
        throw new ApiError(404, "User does not exist.")
    }


    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials.")
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");


    const options = {
        httpOnly: true,
        secure: true
    }

    isloggedIn = true;

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "Logged In Successfully."
            )
        )
})



const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    req.user = {}

    isloggedIn = false


    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out."))
})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incommingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if(!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }


    try {
    
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET) // It will check that , does it relate to our JWT.
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
        
        if(incommingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token has been used or expired.")
        }
    
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken,
                    },
                    "Access Token Refreshed."
                )
            )
        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Old password did not match.")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})


    return res.status(200)
        .json(new ApiResponse(201, {}, "Password changed successfully."))

})


const getcurrentUser = asyncHandler(async (req, res) => {

    if(!isloggedIn) {
        throw new ApiError(400, "Unauthorized User.")
    }

    const user = await User.findById(req.user?._id).select("-password -refreshToken")
    // console.log(req.user);

    if(!user) {
        throw new ApiError(400, "Unauthorized User.")
    }

    return res.status(200).json(new ApiResponse(200, user, "User fetched successfully."))
})


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if(!fullName || !email) {
        throw new ApiError(400, "All fields are required.")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")


    return res.status(201).json(new ApiResponse(201, user, "Account updated successfully."))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing.")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url) {
        throw new ApiError(400, "Error while uploading on Avatar.")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")


    res.status(201).json(new ApiResponse(201, updatedUser, "Avatar has been updated successfuly."))
})


const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image is missing.")
    }

    const coverImage = uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cover Image.")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")


    res.status(201).json(new ApiResponse(201, updatedUser, "Cover Image has been updated successfuly."))
})



export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getcurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}