import { getSession } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import sharp from "sharp";
import { NextResponse } from "next/server";

const MAX_DIMENSION = 2000;  // px
const JPEG_QUALITY = 80;     // 0-100

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 });
    }

    if (!ALLOWED_FORMATS.includes(file.type)) {
      return NextResponse.json({ error: "File format not allowed. Only JPEG, PNG, WEBP, and AVIF are supported." }, { status: 400 });
    }

    const folderName = formData.get("folderName") || "easy-trip";
    const qualityParam = formData.get("quality");
    const quality = qualityParam ? parseInt(qualityParam, 10) : JPEG_QUALITY;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // ── Compress / resize with sharp before uploading ──────────
    const buffer = await sharp(rawBuffer)
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",          // keep aspect ratio, no crop
        withoutEnlargement: true, // don't upscale small images
      })
      .jpeg({ quality: quality, mozjpeg: true }) // compress as JPEG
      .toBuffer();

    // Upload the buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: "image",
          allowed_formats: ['jpeg', 'jpg', 'png', 'webp', 'avif'],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
