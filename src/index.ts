import { exit } from 'node:process';
import 'reflect-metadata';
import { args, selectedSubreddits } from './env/argparse';
import config from './env/config';
import { getDatasetFetcher, initDI } from './inversify.config';
import { initScraper, Scraper } from './scrape/scraper';
import sharp from 'sharp';
import { DatasetFetcher } from './dataset/dataset';

if (args.debug) {
  console.log('Selected subreddits: ', selectedSubreddits);
  console.log('Config: ', config);
}

let scraper: Scraper | null = null;
let datasetFetcher: DatasetFetcher | null = null;

async function bootstrap() {
  await initDI();

  if (args.download) {
    if (args.debug) console.log(sharp.versions);
    datasetFetcher = getDatasetFetcher();
    await datasetFetcher.start();
  } else {
    scraper = await initScraper(selectedSubreddits);
    await scraper.start();
  }

  exit(0);
}

process.on('SIGINT', () => {
  scraper?.cleanup();
  datasetFetcher?.cleanup();
  exit(0);
});

bootstrap();
