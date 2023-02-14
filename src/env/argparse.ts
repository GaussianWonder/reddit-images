import { exit } from 'node:process';
import { parseArgs } from 'node:util';

export const DEFAULT_DB_NAME = 'reddit_media';
export const DEFAULT_DB_PATH = `./${DEFAULT_DB_NAME}.db`;

const parsedArgs = parseArgs({
  options: {
    help: {
      type: 'boolean',
      default: false,
    },
    debug: {
      type: 'boolean',
      short: 'd',
      default: false,
    },
    listing_type: {
      type: 'string',
      short: 'l',
      default: 'hot',
    },
  },
  allowPositionals: true,
});

const availableListings: Array<'hot' | 'new' | 'top' | 'rising'> = [
  'hot',
  'new',
  'top',
  'rising',
];
const listingArg = parsedArgs.values.listing_type ?? 'hot';
if (!['hot', 'new', 'top', 'rising'].includes(listingArg))
  console.error(
    `Unknown listing type ${listingArg}, choose one of ${availableListings.join(
      ', ',
    )}`,
  );

export default parsedArgs;

export const selectedSubreddits = parsedArgs.positionals;
export const args = {
  ...parsedArgs.values,
  listing_type: listingArg as 'hot' | 'new' | 'top' | 'rising',
};

if (parsedArgs.values.help) {
  console.log(
    'Positional arguments are regarded as subreddits to scrape images from.\n',
    'Options:\n',
    '  --help:             Show this help message\n',
    '  --debug, -d:        Enable debug mode\n',
    '  --listing_type, -l: Specify the listing type to use\n',
    '                      (hot, new, top, rising), default: hot\n',
  );
  exit(0);
}

if (selectedSubreddits.length < 1) {
  console.error('No subreddits specified, nothing to do!');
  exit(1);
}
