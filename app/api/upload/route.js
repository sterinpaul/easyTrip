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

    const folderName = formData.get("folderName") || "easy-trip";
    const qualityParam = formData.get("quality");
    const quality = qualityParam ? parseInt(qualityParam, 10) : JPEG_QUALITY;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // ── Compress / resize with sharp before uploading ──────────
    // If it's a PDF, we might want to skip sharp (PreviewActions uploads a pdf blob).
    // Let's check mime type.
    const isPdf = file.type === "application/pdf";
    let buffer = rawBuffer;

    if (!isPdf) {
      buffer = await sharp(rawBuffer)
        .resize({
          width: MAX_DIMENSION,
          height: MAX_DIMENSION,
          fit: "inside",          // keep aspect ratio, no crop
          withoutEnlargement: true, // don't upscale small images
        })
        .jpeg({ quality: quality, mozjpeg: true }) // compress as JPEG
        .toBuffer();
    }

    // Upload the buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: isPdf ? "raw" : "image",
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
