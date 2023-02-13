import https from 'node:https';
import imageType, { minimumBytes } from 'image-type';
import probeImage from 'probe-image-size';

export async function fastImageMimeType(url: string) {
  return new Promise<string>((resolve, reject) => {
    https.get(url, (response) => {
      if (!response)
        reject(new Error(`No response object received for ${url}`));

      if (!response.statusCode || response.statusCode >= 400)
        reject(new Error(`Invalid status code ${url}`));

      response.on('readable', () => {
        (async () => {
          try {
            const chunk = response.read(minimumBytes);
            response.destroy();

            const type = await imageType(chunk);

            if (!type || !type.mime)
              reject(new Error(`Image type could not be parsed ${url}`));
            else resolve(type.mime);
          } catch (error) {
            reject(error);
          }
        })();
      });

      response.on('error', reject);
    });
  });
}

export async function fastImageDetails(url: string) {
  const { width, height, mime } = await probeImage(url);
  return {
    width,
    height,
    mimetype: mime,
  };
}
