import { Entity, OptionalProps, Property } from '@mikro-orm/core';
import { BaseEntity } from './base-entity';

@Entity()
export class SubredditScraperEntity extends BaseEntity {
  @Property()
  subreddit_name!: string;

  @Property({ columnType: 'varchar(100)', nullable: true, default: null })
  after!: string | null;

  @Property({ columnType: 'varchar(10)', default: 'hot' })
  listing_type: 'hot' | 'new' | 'top' | 'rising' = 'hot';

  @Property({ default: 100 })
  limit = 100;

  /**
   * Once the offset reaches the limit of 1000, this will be incremented by 1
   *
   * @memberof SubredditScraperEntity
   */
  @Property({ default: 0 })
  iterations = 0;

  /**
   * When incrementing the iteration, this will be set to the current date
   *
   * @memberof SubredditScraperEntity
   */
  @Property()
  last_iteration = new Date();

  [OptionalProps]?:
    | 'limit'
    | 'iterations'
    | 'last_iteration'
    | 'listing_type'
    | 'after';
}
