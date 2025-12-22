import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

 cloudinary.config({ 
        cloud_name: process.env.cloud_Name , 
        api_key: process.env.api_Key , 
        api_secret: process.env.api_Secret // Click 'View API Keys' above to copy your API secret
    });

    const UploadOnCloudinary = async (Localfilepath)=>{
        try {
             if(!Localfilepath) return null;
       const response = await cloudinary.uploader.upload(Localfilepath,{
        resource_type : "auto"
       })
         // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);

        return response
            
        } catch (error) {
            fs.unlinkSync(Localfilepath)// remove the locally saved temporary file as the upload operation got failed
            return null
        }
       
    }
    
    export {UploadOnCloudinary}