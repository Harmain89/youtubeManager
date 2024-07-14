import mongoose, { Schema } from "mongoose";

const subscriptionSchema = Schema({
    
    subscriber: {
        type: Schema.Types.ObjectId,  // Te one who is subscribing.
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,  // Te one to whom subscriber is subscribing.
        ref: "User",
        required: true
    },
    
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)