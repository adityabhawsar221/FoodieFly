# cloudinary.js – Image Upload Helper

## What this file does
This file is responsible for uploading images to Cloudinary and then deleting the image from the local computer after upload.

## Step-by-step flow (very simple)
1. The image first comes from the user and is saved temporarily on the server.
2. This file connects to Cloudinary using secret keys.
3. The image is uploaded to Cloudinary.
4. After successful upload, the local image file is deleted.
5. The Cloudinary image URL is returned and saved in the database.

## Why we need this file
We do not want to store images inside our server because it makes the server slow and heavy. Cloudinary stores images safely on the internet and gives us a URL.

## Important lines explained
- `cloudinary.config(...)` connects your project to Cloudinary.
- `cloudinary.uploader.upload(file)` uploads the image.
- `fs.unlinkSync(file)` deletes the image from the local folder after upload.

## Real life example
Think of this like uploading a photo to Google Drive and then deleting it from your phone to save space.
