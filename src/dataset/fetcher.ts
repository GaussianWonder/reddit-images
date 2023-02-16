import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import config from '../env/config';
import { isURL } from '../scrape/validation';

export const http = rateLimit(
  axios.create({
    headers: {
      'X-User-Agent': config.userAgent,
    },
  }),
  {
    maxRequests: 60,
    perMilliseconds: config.requestDelay,
  },
);

export const fetchImageBuffer = async (url: string) => {
  if (isURL(url)) {
    const response = await http.get(url, {
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data, 'utf-8');
  }

  throw new Error('Invalid URL');
};
