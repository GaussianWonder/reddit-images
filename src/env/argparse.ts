import { exit } from 'node:process';
import { parseArgs } from 'node:util';

export const DEFAULT_DB_NAME = 'reddit_media';
export const DEFAULT_DB_PATH = `./${DEFAULT_DB_NAME}.db`;

const parsedArgs = parseArgs({
  options: {
    help: {
      type: 'boolean',
      short: 'h',
      default: false,
    },
    debug: {
      type: 'boolean',
      short: 'd',
      default: false,
    },
  },
  allowPositionals: true,
});

export default parsedArgs;

export const selectedSubreddits = parsedArgs.positionals;
export const args = parsedArgs.values;

if (parsedArgs.values.help) {
  console.log(
    'Positional arguments are regarded as subreddits to scrape images from.',
  );
  exit(0);
}

if (selectedSubreddits.length < 1) {
  console.error('No subreddits specified, nothing to do!');
  exit(1);
}
