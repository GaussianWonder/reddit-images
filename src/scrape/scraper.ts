import { SubredditScraperEntity } from './../database/entities/subreddit-scraper.entity';
import { MediaEntity } from './../database/entities/media.entity';
import Snoowrap from 'snoowrap';
import { EntityRepository } from '@mikro-orm/sqlite';
import { inject } from 'inversify';
import TYPES from '../di';
import { getSubredditRepository } from '../inversify.config';
import { makeAbortable } from './logic';
import { args } from '../env/argparse';
import { ListingOptions } from 'snoowrap/dist/objects';
import { extractPostMedia } from './post';

class SubredditScraper {
  @inject(TYPES.SubredditRepository)
  private subredditRepository!: EntityRepository<SubredditScraperEntity>;

  @inject(TYPES.MediaRepository)
  private mediaRepository!: EntityRepository<MediaEntity>;

  constructor(
    public readonly subreddit: SubredditScraperEntity,
    private readonly scraper: Snoowrap.Subreddit,
  ) {}

  public scrape() {
    return makeAbortable(this.handleNextSubmissions());
  }

  private async resolveSubmissionFetch() {
    const listingOpts: ListingOptions = {
      limit: this.subreddit.limit,
      after: this.subreddit.after ?? undefined,
    };

    switch (this.subreddit.listing_type) {
      case 'hot':
        return this.scraper.getHot(listingOpts);
      case 'new':
        return this.scraper.getNew(listingOpts);
      case 'top':
        return this.scraper.getTop(listingOpts);
      case 'rising':
        return this.scraper.getRising(listingOpts);
      default:
        return Promise.reject([]);
    }
  }

  private async handleNextSubmissions() {
    // Get next submissions from the given listing type
    const submissions = await this.resolveSubmissionFetch();
    const lastId =
      submissions.length - 1 > 0
        ? submissions[submissions.length - 1].id
        : null;

    // Fetch all raw media entries from the submission structures
    const rawMedia = (
      await Promise.all(submissions.map(extractPostMedia))
    ).flat();

    // Dedupe the raw media entries
    const mediaEntries = [
      ...new Map(rawMedia.map((entry) => [entry.url, entry] as const)).values(),
    ];

    // Query the database for existing entries by url
    const foundEntries = await this.mediaRepository.find({
      url: { $in: mediaEntries.map(({ url }) => url) },
    });

    // Save the new entries
    const newMedia = mediaEntries
      .filter((entry) => !foundEntries.some(({ url }) => url === entry.url))
      .map((entry) => this.mediaRepository.create(entry));
    await this.mediaRepository.persistAndFlush(newMedia);

    if (args.debug)
      console.log(
        `Saved ${newMedia.length} new media entries from ${this.subreddit.subreddit_name}`,
      );

    // Update the subreddit entity
    this.subreddit.after = lastId;
    const currentBatchIndex = this.subreddit.iterations % 1000;
    this.subreddit.iterations += submissions.length;
    const nextBatchIndex = this.subreddit.iterations % 1000;
    if (nextBatchIndex >= currentBatchIndex)
      this.subreddit.last_iteration = new Date();

    if (args.debug)
      console.log(
        `Offset of ${this.subreddit.subreddit_name} is after submission ${this.subreddit.after} (${this.subreddit.iterations} entries processed from ${this.subreddit.listing_type})`,
      );

    await this.subredditRepository.flush();
  }
}

export class Scraper {
  @inject(TYPES.Requester)
  private requester!: Snoowrap;

  public abortController = new AbortController();

  private readonly subredditScrapers: SubredditScraper[];

  constructor(srsToScrape: SubredditScraperEntity[]) {
    this.subredditScrapers = srsToScrape.map(
      (subreddit) =>
        new SubredditScraper(
          subreddit,
          this.requester.getSubreddit(subreddit.subreddit_name),
        ),
    );
  }

  public cleanup() {
    this.abortController.abort();
  }

  public async start() {
    for (;;) {
      const scraper = this.chooseScraper();
      const [job, abort] = scraper.scrape();
      this.abortController = abort;
      await job;
    }
  }

  private chooseScraper() {
    return this.subredditScrapers[
      Math.floor(Math.random() * this.subredditScrapers.length)
    ];
  }
}

export async function initScraper(subredditNames: string[]): Promise<Scraper> {
  const subredditRepo = getSubredditRepository();
  const subreddits = await subredditRepo.find({
    subreddit_name: {
      $in: subredditNames,
    },
    listing_type: args.listing_type,
    iterations: { $lte: 1000 },
  });

  const newSubreddits = subredditNames
    .filter(
      (name) =>
        !subreddits.some(({ subreddit_name }) => subreddit_name === name),
    )
    .map((name) =>
      subredditRepo.create({
        subreddit_name: name,
        listing_type: args.listing_type,
      }),
    );

  await subredditRepo.persistAndFlush(newSubreddits);

  return new Scraper(subreddits.concat(newSubreddits));
}
