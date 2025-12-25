import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { user } from "../models/user.modal.js";



export const verifyJwt = asyncHandler(async(req,_,next)=>{

   try {
      
       const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
       if(!Token){
        throw new ApiError(401,"unaurtorized access")
       }
    
       const decodedToken = jwt.verify(Token,process.env.ACCESS_TOKEN_SECRET)
    
    
       const User = await user.findById(decodedToken?._id).select("-password -refreshToken")
    
       if(!User){
        throw new ApiError(401,"invalid access token")
       }
    
       req.User = User;
       next()
      }
   
   
   catch (error) {
      throw new ApiError(401,error?.message || "invalid access token")
      
  }




})