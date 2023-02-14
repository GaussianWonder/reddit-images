import { SubredditScraperEntity } from './../database/entities/subreddit-scraper.entity';
import { MediaEntity } from './../database/entities/media.entity';
import Snoowrap from 'snoowrap';
import { scheduleJob, Job } from 'node-schedule';
import { EntityRepository } from '@mikro-orm/sqlite';
import { inject } from 'inversify';
import TYPES from '../di';
import { getSubredditRepository } from '../inversify.config';

class SubredditScraper {
  @inject(TYPES.Requester)
  private requester!: Snoowrap;

  @inject(TYPES.SubredditRepository)
  private subredditRepository!: EntityRepository<SubredditScraperEntity>;

  @inject(TYPES.MediaRepository)
  private mediaRepository!: EntityRepository<MediaEntity>;

  constructor(
    public readonly subreddit: SubredditScraperEntity,
    private readonly scraper: Snoowrap.Subreddit,
  ) {}
}

export class Scraper {
  @inject(TYPES.Requester)
  private requester!: Snoowrap;

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
    // TODO maybe there is something to clean up
  }

  private async scrapeNewSubmission() {
    const randomSubreddit =
      this.subredditScrapers[
        Math.floor(Math.random() * this.subredditScrapers.length)
      ];

    // TODO
    // randomSubreddit.next()
    // randomSubreddit.selfSave()
  }
}

export async function initScraper(subredditNames: string[]): Promise<Scraper> {
  const subredditRepo = getSubredditRepository();
  const subreddits = await subredditRepo.find({
    subreddit_name: {
      $in: subredditNames,
    },
  });

  const newSubreddits = subredditNames
    .filter(
      (name) =>
        !subreddits.some(({ subreddit_name }) => subreddit_name === name),
    )
    .map((name) => subredditRepo.create({ subreddit_name: name, offset: 0 }));

  await subredditRepo.persistAndFlush(newSubreddits);

  return new Scraper(subreddits.concat(newSubreddits));
}
