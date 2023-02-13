import { Migration } from '@mikro-orm/migrations';

export class Migration20230213222512 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `subreddit_scraper_entity` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `subreddit_id` text not null, `subreddit_name` text not null, `offset` integer not null, `limit` integer not null default 100);');

    this.addSql('alter table `media_entity` add column `subreddit_id` varchar(128) not null;');
  }

}
