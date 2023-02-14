import { EntityRepository } from '@mikro-orm/sqlite';
import { Container } from 'inversify';
import Snoowrap from 'snoowrap';
import { initORM } from './database/driver';
import { MediaEntity } from './database/entities/media.entity';
import { SubredditScraperEntity } from './database/entities/subreddit-scraper.entity';
import TYPES from './di';
import { acquireRequester } from './scrape/requester';

const container = new Container();

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

  return container;
}

export { container };

export const getSubredditRepository = () =>
  container.get<EntityRepository<SubredditScraperEntity>>(
    TYPES.SubredditRepository,
  );

export const getMediaRepository = () =>
  container.get<EntityRepository<MediaEntity>>(TYPES.MediaRepository);

export const getRequester = () => container.get<Snoowrap>(TYPES.Requester);
