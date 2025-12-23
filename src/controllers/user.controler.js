import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import { user } from "../models/user.modal.js"
import {UploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async(req,res)=>{

      // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
   
    const {fullName,email,password ,username} = req.body

    console.log("email ",email);

    /* if (fullName === "") {
       throw new ApiError(400,"fullname is required")
        
     } we can use it alsobut there will be more code we haveto write so another method is given below*/
        if([fullName,email,password,username].some((fields)=>fields?.trim()=== "")){
            throw new ApiError(400,"all fields are requiered")
        }

       const existeduser = await user.findOne({
            $or:[{username},{email}]
        })

        if (existeduser) {
            throw new ApiError(409,"user alredy existed")
        }
        const avatarLocalPath = req.files?.avatar[0]?.path
      const coverImagelocalPath =   req.files?.coverImage[0]?.path

      if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
      }

      const avatar = await UploadOnCloudinary(avatarLocalPath)
      const coverImage = await UploadOnCloudinary(coverImagelocalPath)

      if(!avatar){
        throw new ApiError(400,"avatar is required")
      }

     const User = await user.create({
        fullName,
        avatar : avatar.url,
        coverImage: coverImage.url,
        email,
        password,
        username : username.toLowerCase()
      })

     const createduser = await user.findById(User._id).select(
        "-password  -refreshToken"
      )
       if (!createduser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createduser, "User registered Successfully")
    )

})

export {registerUser}