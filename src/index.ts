import 'reflect-metadata';
import { args, selectedSubreddits } from './env/argparse';
import config from './env/config';
import { initDI } from './inversify.config';
import { initScraper, Scraper } from './scrape/scraper';

if (args.debug) {
  console.log('Selected subreddits: ', selectedSubreddits);
  console.log('Config: ', config);
}

let scraper: Scraper | null = null;

async function bootstrap() {
  await initDI();
  scraper = await initScraper(selectedSubreddits);
  await scraper.start();
}

process.on('SIGINT', () => {
  scraper?.cleanup();
});

bootstrap();
