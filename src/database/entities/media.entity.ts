import { Entity, Property } from '@mikro-orm/core';
import { ImagePreviewSource } from 'snoowrap/dist/objects/Submission';
import { BaseEntity } from './base-entity';

export type MediaSource = ImagePreviewSource & {
  mimetype: string;
};

export interface RawMedia {
  url: string;
  post_id: string;
  post_hint: string;
  mimetype: string;
  width: number;
  height: number;
  subreddit: string;
  upvote_ratio: number;
  ups: number;
  downs: number;
  score: number;
}

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
  mimetype = 'unknown';

  @Property({
    columnType: 'integer',
  })
  width!: number;

  @Property({
    columnType: 'integer',
  })
  height!: number;

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
