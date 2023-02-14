import { Migration } from '@mikro-orm/migrations';

export class Migration20230214181308 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `media_entity` (`id` integer not null primary key autoincrement, `created_at` datetime null, `updated_at` datetime null, `url` text not null, `post_id` text not null, `post_hint` varchar(128) not null, `mimetype` varchar(128) null default \'unknown\', `width` integer null, `height` integer null, `subreddit` varchar(128) not null, `upvote_ratio` integer not null, `ups` integer not null, `downs` integer not null, `score` integer not null);');

    this.addSql('create table `subreddit_scraper_entity` (`id` integer not null primary key autoincrement, `created_at` datetime null, `updated_at` datetime null, `subreddit_name` text not null, `after` varchar(100) null default null, `listing_type` varchar(10) not null default \'hot\', `limit` integer not null default 100, `iterations` integer not null default 0, `last_iteration` datetime not null);');
  }

}
