import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const Videoschema = mongoose.Schema({

videoFile : {
    type : String,
    require : true
},
thumbnail: {
    type : String,
    require : true
},
title:{
    type : String,
    require : true
},
description:{
    type : String,
    require : true
},
owner :{
     type: Schema.Types.ObjectId,
    ref: "User"

},
duration : {
    type : Number,
    require : true
},
views : {
    type : Number,
    default : 0 
},
isPublished :{
    type : Boolean,
   default : true
},



},
{
    timestamps : true
}
)

Videoschema.plugin(mongooseAggregatePaginate)

export const video = mongoose.model("video",Videoschema)