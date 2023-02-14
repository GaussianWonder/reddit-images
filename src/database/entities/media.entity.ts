import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './base-entity';

export interface RawMedia {
  url: string;
  post_id: string;
  post_hint: string;
  mimetype: string | null;
  width: number | null;
  height: number | null;
  subreddit: string;
  upvote_ratio: number;
  ups: number;
  downs: number;
  score: number;
}

export type MediaSource = Pick<
  RawMedia,
  'url' | 'mimetype' | 'width' | 'height'
>;

@Entity()
export class MediaEntity extends BaseEntity implements RawMedia {
  /**
   * URL to the media
   *
   * @type {string}
   * @memberof MediaEntity
   */
  @Property({
    columnType: 'text',
  })
  url!: string;

  /**
   * Reddit Submission (Post) identifier
   *
   * @type {string}
   * @memberof MediaEntity
   */
  @Property({
    columnType: 'text',
  })
  post_id!: string;

  /**
   * Reddit post hint (Image, Link, Text+Media, etc.)
   *
   * @type {string}
   * @memberof MediaEntity
   */
  @Property({
    columnType: 'varchar(128)',
  })
  post_hint!: string;

  @Property({
    columnType: 'varchar(128)',
    default: 'unknown',
  })
  mimetype: string | null = 'unknown';

  @Property({
    columnType: 'integer',
    nullable: true,
  })
  width!: number | null;

  @Property({
    columnType: 'integer',
    nullable: true,
  })
  height!: number | null;

  /**
   * Subreddit name (e.g. 'pics')
   *
   * @type {string}
   * @memberof MediaEntity
   */
  @Property({
    columnType: 'varchar(128)',
  })
  subreddit!: string;

  @Property()
  upvote_ratio!: number;

  @Property()
  ups!: number;

  @Property()
  downs!: number;

  @Property()
  score!: number;
}
