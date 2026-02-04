
# multer.js – File Upload Middleware (VERY IMPORTANT)

## What is Multer?
Multer is a tool that helps Express understand files like images, videos, and PDFs sent from the frontend.

Normally, Express can only read:
- JSON data
- Text data

But Express CANNOT read files by default.

That is why Multer is required.

## What problem Multer solves
When a user uploads an image:
- The browser sends the image as `multipart/form-data`
- Express cannot read this format
- Multer reads this format and extracts the file

## How Multer works internally (easy language)
1. User selects an image and clicks submit.
2. Browser sends the image in a special format.
3. Multer catches the request BEFORE it reaches the controller.
4. Multer saves the image in a folder.
5. Multer adds file information inside `req.file`.
6. Controller can now access the image.

## Code explanation
- `multer.diskStorage()` tells Multer where and how to save files.
- `destination` means folder path where files will be stored.
- `filename` decides the name of the saved file.

## Why `upload.single("image")` is used
- `"image"` must match the name used in frontend form.
- `single` means only one image is expected.
- After this, the file becomes available as `req.file`.

## Folder flow
Frontend → Multer → public folder → Cloudinary → Database

## Most common confusion (VERY IMPORTANT)
- Multer ONLY saves the file locally.
- Multer DOES NOT upload to Cloudinary.
- Cloudinary upload happens AFTER Multer inside controller.

## Simple example
Multer is like a school security guard who checks bags before allowing students inside.
Cloudinary is the locker where bags are finally store