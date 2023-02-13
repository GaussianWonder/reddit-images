import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './base-entity';

@Entity()
export class SubredditScraperEntity extends BaseEntity {
  @Property()
  subreddit_id!: string;

  @Property()
  subreddit_name!: string;

  @Property()
  offset!: number;

  @Property()
  limit = 100;
}
