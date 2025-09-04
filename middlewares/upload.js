
// import multer from "multer";
// import multerS3 from "multer-s3";
// import { S3Client } from "@aws-sdk/client-s3";
// import dotenv from "dotenv";

// dotenv.config();

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // File type filter (only images & videos)
// const fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//     "video/mp4",
//     "video/mpeg",
//     "video/quicktime" // for .mov files
//   ];
  
//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only images and videos are allowed."), false);
//   }
// };

// // Multer-S3 setup
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: process.env.AWS_BUCKET_NAME,
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       const fileName = `${Date.now()}-${file.originalname}`;
//       cb(null, fileName);
//     },
//   }),
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024 // 50MB max file size
//   }
// });

// export default upload;


import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// File type filter (only images & videos)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/mpeg",
    "video/quicktime", // .mov
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and videos are allowed."), false);
  }
};



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, "-"); // replace spaces with dashes
    const uniqueName = `${Date.now()}-${sanitized}`;
    cb(null, uniqueName);
  },
});


const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

export default upload;


