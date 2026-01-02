import mongoose,{Schema} from "mongoose";


const subscriptionSchema = mongoose.Schema({

    subscriber :{
        type : Schema.Types.ObjectId,
        ref :"user"
    },
    channel :{
        type : Schema.Types.ObjectId,
        ref :"user checking the commit nothing more"
    }

})

export const subscription = mongoose.model("subscription",subscriptionSchema)