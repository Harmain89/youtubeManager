import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({

    videoFile: {
        type: String,    // Cloudinary url
        required: true
    },
    thumbnail: {
        type: String,    // Cloudinary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps: true})


videoSchema.plugin(mongooseAggregatePaginate)

videoSchema.methods.extractPublicId = function () {

    const url = this?.thumbnail

    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    return publicId;
}

videoSchema.methods.changePublishStatus = function () {
    const isPublished = this.isPublished
    const changedStatus = !isPublished

    this.isPublished = changedStatus
    this.save();

    return changedStatus;
}

export const Video = mongoose.model("Video", videoSchema)