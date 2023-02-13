import config from '../env/config';
import snoowrap from 'snoowrap';
import { scheduleJob, Job } from 'node-schedule';
import { SubredditScraperEntity } from '../database/entities/subreddit-scraper.entity';
import { EntityRepository } from '@mikro-orm/sqlite';
import { initORM } from '../database/driver';

export const acquireRequester = () =>
  new snoowrap({
    userAgent: config.realUserAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    accessToken: config.oauth.accessToken,
  });

export class Scraper {
  public readonly job: Job;

  constructor(
    private readonly requester: snoowrap,
    private readonly subredditScrapers: SubredditScraperEntity[],
    private readonly subredditRepository: EntityRepository<SubredditScraperEntity>,
    private readonly mediaRepository: EntityRepository<SubredditScraperEntity>,
  ) {
    this.job = scheduleJob(
      'Global scraper job',
      {
        second: 1,
        // 1 per second, 60 per minute, 3600 per hour, 86400 per day
        // the last scrape from a minute is ignored for safety reasons
      },
      () => {
        this.scrapeNewSubmission();
      },
    );
  }

  public cleanup() {
    this.job.cancel();
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

export async function initScraper(
  subredditIdentifiers: string[],
): Promise<Scraper> {
  const [r, orm] = await Promise.all([acquireRequester(), initORM()]);

  const subreddits = await orm.em.find(SubredditScraperEntity, {
    subreddit_name: { $in: subredditIdentifiers },
  });

  return new Scraper(
    r,
    subreddits,
    orm.em.getRepository(SubredditScraperEntity),
    orm.em.getRepository(SubredditScraperEntity),
  );
}
