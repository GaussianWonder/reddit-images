import { EntityRepository } from '@mikro-orm/sqlite';
import { Container } from 'inversify';
import Snoowrap from 'snoowrap';
import { initORM } from './database/driver';
import { MediaEntity } from './database/entities/media.entity';
import { SubredditScraperEntity } from './database/entities/subreddit-scraper.entity';
import { DatasetFetcher } from './dataset/dataset';
import TYPES from './di';
import { acquireRequester } from './scrape/requester';
import { Scraper, SubredditScraper } from './scrape/scraper';

const container = new Container({
  autoBindInjectable: true,
  defaultScope: 'Singleton',
});

export { container };

export async function initDI() {
  const [r, orm] = await Promise.all([acquireRequester(), initORM()]);

  container.bind<Snoowrap>(TYPES.Requester).toConstantValue(r);
  container.bind<typeof orm>(TYPES.ORM).toConstantValue(orm);
  container
    .bind<EntityRepository<SubredditScraperEntity>>(TYPES.SubredditRepository)
    .toConstantValue(orm.em.getRepository(SubredditScraperEntity));
  container
    .bind<EntityRepository<MediaEntity>>(TYPES.MediaRepository)
    .toConstantValue(orm.em.getRepository(MediaEntity));
  container.bind<Scraper>(Scraper).toSelf();
  container.bind<SubredditScraper>(SubredditScraper).toSelf();
  container.bind<DatasetFetcher>(DatasetFetcher).toSelf();

  return container;
}

export const getSubredditRepository = () =>
  container.get<EntityRepository<SubredditScraperEntity>>(
    TYPES.SubredditRepository,
  );

export const getMediaRepository = () =>
  container.get<EntityRepository<MediaEntity>>(TYPES.MediaRepository);

export const getRequester = () => container.get<Snoowrap>(TYPES.Requester);

export const getScraper = (subredditEntities: SubredditScraperEntity[]) => {
  const scraper = container.get<Scraper>(Scraper);
  scraper.init(subredditEntities);
  return scraper;
};

export const getSubredditScraper = (subreddit: SubredditScraperEntity) => {
  const subredditScraper = container.get<SubredditScraper>(SubredditScraper);
  subredditScraper.init(subreddit);
  return subredditScraper;
};

export const getDatasetFetcher = () => container.resolve(DatasetFetcher);
