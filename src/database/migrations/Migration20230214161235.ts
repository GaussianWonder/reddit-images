import { Migration } from '@mikro-orm/migrations';

export class Migration20230214161235 extends Migration {

  async up(): Promise<void> {
    this.addSql('PRAGMA foreign_keys = OFF;');
    this.addSql('CREATE TABLE `_knex_temp_alter885` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `created_at` datetime, `updated_at` datetime, `url` text NOT NULL, `mimetype` varchar(128), `width` integer, `height` integer, `subreddit` varchar(128) NOT NULL, `title` varchar(255) NOT NULL, `description` text NOT NULL, `upvote_ratio` integer NOT NULL, `index` text NOT NULL, `post_id` text NOT NULL, `post_hint` varchar(128) NOT NULL, `ups` integer NOT NULL, `downs` integer NOT NULL, `score` integer NOT NULL, `subreddit_id` varchar(128) NOT NULL);');
    this.addSql('INSERT INTO "_knex_temp_alter885" SELECT * FROM "media_entity";;');
    this.addSql('DROP TABLE "media_entity";');
    this.addSql('ALTER TABLE "_knex_temp_alter885" RENAME TO "media_entity";');
    this.addSql('PRAGMA foreign_keys = ON;');

    this.addSql('alter table `subreddit_scraper_entity` add column `listing_type` varchar(10) not null default \'hot\';');
  }

}
