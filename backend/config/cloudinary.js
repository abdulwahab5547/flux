import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (fileBuffer) => {
    try {
        if (!fileBuffer) return null;

        // Uploading file
        const response = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });

            // Stream the file buffer
            uploadStream.end(fileBuffer);
        });

        // File has been uploaded
        console.log("File is uploaded", response.url);
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
}

export { uploadOnCloudinary };
export default cloudinary;





// import { v2 as cloudinary } from 'cloudinary';
// import { unlinkSync, existsSync } from 'fs';
// import dotenv from 'dotenv';
// dotenv.config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_SECRET_KEY,
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null;

//         // Uploading file
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         });

//         // File has been uploaded
//         console.log("File is uploaded", response.url);
//         return response;
//     } catch (error) {
//         console.error("Error uploading to Cloudinary:", error);
//         if (existsSync(localFilePath)) {
//             unlinkSync(localFilePath); // Remove the locally saved file
//         }
//         return null;
//     }
// }

// export { uploadOnCloudinary };
// export default cloudinary;

