/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ImagePreview,
  ImagePreviewSource,
} from 'snoowrap/dist/objects/Submission';
import { z } from 'zod';

export function isURL(value: any): value is string {
  return z.string().url().safeParse(value).success;
}

const ImageSourceSchema = z.object({
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export function isImageSource(value: any): value is ImagePreviewSource {
  return ImageSourceSchema.safeParse(value).success;
}

export function isImagePreview(value: any): value is ImagePreview {
  return z
    .object({
      id: z.string(),
      source: ImageSourceSchema,
      resolutions: z.array(ImageSourceSchema),
    })
    .safeParse(value).success;
}
