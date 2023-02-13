import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './base-entity';

@Entity()
export class MediaEntity extends BaseEntity {
  @Property({
    columnType: 'text',
  })
  url!: string;

  @Property({
    columnType: 'varchar(128)',
  })
  mimetype = 'unknown';

  @Property({
    columnType: 'integer',
  })
  width!: number;

  @Property({
    columnType: 'integer',
  })
  height!: number;

  @Property({
    columnType: 'varchar(128)',
  })
  subreddit!: string;

  @Property({
    columnType: 'varchar(255)',
  })
  title!: string;

  @Property({
    columnType: 'text',
  })
  description!: string;

  @Property()
  nsfw!: boolean;

  @Property({
    columnType: 'text',
  })
  index!: string;
}
