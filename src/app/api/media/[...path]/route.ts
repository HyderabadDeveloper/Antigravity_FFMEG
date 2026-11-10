import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const subPath = params.path.join('/');
    const filePath = path.join(process.cwd(), 'data', 'media', subPath);

    // Prevent directory traversal
    const safeBase = path.join(process.cwd(), 'data', 'media');
    if (!filePath.startsWith(safeBase) || !fs.existsSync(filePath)) {
      return new NextResponse('Media file not found', { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.get('range');

    if (range) {
      // Range request: "bytes=0-1000"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': `${chunkSize}`,
          'Content-Type': 'video/mp4',
        },
      });
    } else {
      // Full file stream
      const fileStream = fs.createReadStream(filePath);
      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk) => controller.enqueue(chunk));
          fileStream.on('end', () => controller.close());
          fileStream.on('error', (err) => controller.error(err));
        },
      });

      return new NextResponse(stream, {
        status: 200,
        headers: {
          'Content-Length': `${fileSize}`,
          'Content-Type': 'video/mp4',
        },
      });
    }
  } catch (err: any) {
    return new NextResponse(`Error reading media: ${err.message}`, { status: 500 });
  }
}
