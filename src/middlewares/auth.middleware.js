import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { user } from "../models/user.modal";



export const verifyJwt = asyncHandler(async(req,res,next)=>{

   try {
    const Token = req.cookies?.accessToken || req.header("Aurthorization")?.replace("Bearer ","")
 
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
   } catch (error) {
    throw new ApiError(401,error.message || "invalid access token")
    
   }





})