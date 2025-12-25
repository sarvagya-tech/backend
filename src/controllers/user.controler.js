import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { user } from "../models/user.modal.js"
import {UploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"



const generateAccessandRefereshToken = async (UserId)=>{
  try {
    const User = await  user.findById(UserId)
    const accessToken = User.generateAccessToken()
    const refreshToken = User.generateRefreshToken()
    User.refreshToken = refreshToken
    await User.save({validateBeforeSave :false })

    return{accessToken,refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"something went wrong while generating refresh and access token ")
    
  }
}
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

const loginUser = asyncHandler(async (req,res)=>{

   // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {username,email,password} = req.body

    if (!username && !email) {
      throw new ApiError(400,"username and email is reqired")
      
    }
    const User = await user.findOne({
      $or:[{username},{email}]
    })
    if (!User) {
      throw new ApiError(400,"user not exists")
    }
   const isPasswordValid = User.isPasswordCorrect(password)
   if(!isPasswordValid){
    throw new ApiError(401,"invalid valid credential")
   }

   const { accessToken,refreshToken } = await generateAccessandRefereshToken(User._id)


   const loggedInUser = await  user.findById(User._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {
          User :loggedInUser,refreshToken,accessToken
        },
        "user loggedIn Succesfully"
        
      )
      
    )
})

const logoutUser = asyncHandler(async (req,res)=>{


 await  user.findByIdAndUpdate(
    req.User._id,
    {
      
       $unset:{
        refreshToken : 1

              }
     },
    {
      new : true
    }

  )

  const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out succesfully"))



})

const refreshAccessToken = asyncHandler(async(req,res)=>{



 try {
  const inComingrefreshToken =  req.cookie.refreshToken || req.body.refreshToken
 
  if(!inComingrefreshToken){
   throw new ApiError(401,"unaurthorized access token")
  }
 
  const decodedToken = jwt.verify(inComingrefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
  const User = await user.findById(decodedToken.id)
 
  if(!user){
   throw new ApiError(401,"invalid refresh token")
  }
 
  if(inComingrefreshToken != User.refreshToken){
   throw new ApiError(401,"refresh token is expired or used")
  }
  const options = {
   httpOnly : true,
   secure : true
  }
 
  const {accessToken,newrefreshToken} = await generateAccessandRefereshToken(User._id)
 
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",newrefreshToken,options)
  .json(
   new ApiResponse(
     200,
     {
       accessToken , refreshToken : newrefreshToken
     },
     "access token refreshed"
   )
  )
 } catch (error) {
  throw new ApiError(401,error?.message || "invalid refresh token ")
  
 }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{

  const {oldPassword,newPassword} = req.body
  

 const User = await  user.findById(req.User._id)
 
  const isPasswordCorrect = await User.isPasswordCorrect(oldPassword)

  if (!isPasswordCorrect) {
    throw new ApiError(400,"invalid old password ")
  }

  User.password = newPassword

  await  User.save({validateBeforeSave : false })// why doing this 

})

const getCurrentUser = asyncHandler(async(req,res)=>{
   

})// to understant this in deep 

const updateAccountDetail = asyncHandler(async(req,res)=>{

  const {fullName,email} =  req.body

   if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }



  const User = await user.findByIdAndUpdate(req.User?._id,
    {
      $set : {
        fullName : fullName,
      email : email
    }
      
    },
    {
      new : true 
    }
  ).select("-password") // why doing this select thing 

  return res
  .status(200)
  .json(new ApiResponse(200,User,"updated successfully"))// why i am not passing fullname and user on the place of user

})

   


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetail,
  
}