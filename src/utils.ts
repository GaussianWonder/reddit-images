import probeImage from 'probe-image-size';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export async function fastImageDetails(url: string) {
  const { width, height, mime } = await probeImage(url);
  return {
    width,
    height,
    mimetype: mime,
  };
}

export function imageDetails(buffer: Buffer) {
  const result = probeImage.sync(buffer);
  if (!result) throw new Error('Invalid image');
  return {
    width: result.width,
    height: result.height,
    mimetype: result.mime,
  };
}

export function assureDirectoryExists(directory: string) {
  if (!directory) throw new Error('Invalid directory');
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
  if (!fs.lstatSync(directory).isDirectory())
    throw new Error('Not a directory');
  return directory;
}

export async function saveJPEG(
  image: Buffer,
  rawName: string,
  directory: string,
) {
  const imagePath = path.join(
    assureDirectoryExists(directory),
    `${rawName}.jpeg`,
  );
  return sharp(image).jpeg({ quality: 100 }).toFile(imagePath);
}
