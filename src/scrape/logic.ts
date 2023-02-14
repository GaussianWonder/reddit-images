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

export function abortablePromise<T>(
  signal: AbortSignal,
  promise: Promise<T>,
): Promise<T> {
  if (signal.aborted) return Promise.reject(new Error('Aborted'));

  return new Promise((resolve, reject) => {
    promise.then(resolve).catch(reject);

    const abortHandler = () => {
      signal.removeEventListener('abort', abortHandler);
      reject(new Error('Aborted'));
    };

    signal.addEventListener('abort', abortHandler);
  });
}

export function makeAbortable<T>(
  fun: Promise<T>,
): [Promise<T>, AbortController] {
  const abortController = new AbortController();
  const abortable = abortablePromise(abortController.signal, fun);
  return [abortable, abortController];
}
