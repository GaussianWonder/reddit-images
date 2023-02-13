import { args, selectedSubreddits } from './env/argparse';
import config from './env/config';
import { initScraper, Scraper } from './scrape/requester';

if (args.debug) {
  console.log('Selected subreddits: ', selectedSubreddits);
  console.log('Config: ', config);
}

let scraper: Scraper | null = null;

async function promiseLand() {
  scraper = await initScraper(selectedSubreddits);
}

promiseLand();

process.on('SIGINT', () => {
  scraper?.cleanup();
});
