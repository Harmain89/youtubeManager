import mongoose, { model, Schema } from "mongoose";

const subscriptionSchema = Schema({
    
    subscriber: {
        type: Schema.Types.ObjectId,  // Te one who is subscribing.
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,  // Te one to whom subscriber is subscribing.
        ref: "User"
    },
    
}, {timestamps: true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)