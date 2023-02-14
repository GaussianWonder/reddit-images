import { getScraper, getSubredditScraper } from './../inversify.config';
import { SubredditScraperEntity } from './../database/entities/subreddit-scraper.entity';
import { MediaEntity } from './../database/entities/media.entity';
import Snoowrap from 'snoowrap';
import { EntityRepository } from '@mikro-orm/sqlite';
import { inject, injectable } from 'inversify';
import TYPES from '../di';
import { getSubredditRepository } from '../inversify.config';
import { makeAbortable } from './logic';
import { args } from '../env/argparse';
import { ListingOptions } from 'snoowrap/dist/objects';
import { extractPostMedia } from './post';

@injectable()
export class SubredditScraper {
  @inject(TYPES.Requester)
  private scraper!: Snoowrap;

  @inject(TYPES.SubredditRepository)
  private subredditRepository!: EntityRepository<SubredditScraperEntity>;

  @inject(TYPES.MediaRepository)
  private mediaRepository!: EntityRepository<MediaEntity>;

  public subreddit!: SubredditScraperEntity;

  private get srScraper() {
    return this.scraper.getSubreddit(this.subreddit.subreddit_name);
  }

  public init(subreddit: SubredditScraperEntity) {
    this.subreddit = subreddit;
  }

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
        return await this.srScraper.getHot(listingOpts);
      case 'new':
        return await this.srScraper.getNew(listingOpts);
      case 'top':
        return await this.srScraper.getTop(listingOpts);
      case 'rising':
        return await this.srScraper.getRising(listingOpts);
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
    // TODO fix t3_null and signal that this scraper can no longer be scraped from
    this.subreddit.after = `t3_${lastId}`;
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

@injectable()
export class Scraper {
  public abortController = new AbortController();

  private subredditScrapers: SubredditScraper[] = [];

  public init(srsToScrape: SubredditScraperEntity[]) {
    this.subredditScrapers = srsToScrape.map((subreddit) =>
      getSubredditScraper(subreddit),
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

  const queryParams = {
    subreddit_name: {
      $in: subredditNames,
    },
    listing_type: args.listing_type,
  };
  const subreddits = await subredditRepo.find({
    ...queryParams,
    iterations: { $lte: 1000 },
  });
  const constrainedSubreddits = await subredditRepo.find({
    ...queryParams,
    iterations: { $gt: 1000 },
  });

  const newSubreddits = subredditNames
    .filter(
      (name) =>
        !constrainedSubreddits.some(
          ({ subreddit_name }) => subreddit_name === name,
        ) && !subreddits.some(({ subreddit_name }) => subreddit_name === name),
    )
    .map((name) =>
      subredditRepo.create({
        subreddit_name: name,
        listing_type: args.listing_type,
      }),
    );

  await subredditRepo.persistAndFlush(newSubreddits);

  return getScraper(subreddits.concat(newSubreddits));
}
