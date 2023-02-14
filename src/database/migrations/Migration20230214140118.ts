import { Migration } from '@mikro-orm/migrations';

export class Migration20230214140118 extends Migration {

  async up(): Promise<void> {
    this.addSql('PRAGMA foreign_keys = OFF;');
    this.addSql('CREATE TABLE `_knex_temp_alter263` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `created_at` datetime, `updated_at` datetime, `url` text NOT NULL, `mimetype` varchar(128) NOT NULL DEFAULT \'unknown\', `width` integer NOT NULL, `height` integer NOT NULL, `subreddit` varchar(128) NOT NULL, `title` varchar(255) NOT NULL, `description` text NOT NULL, `upvote_ratio` integer NOT NULL, `index` text NOT NULL, `post_id` text NOT NULL, `post_hint` varchar(128) NOT NULL, `ups` integer NOT NULL, `downs` integer NOT NULL, `score` integer NOT NULL, `subreddit_id` varchar(128) NOT NULL);');
    this.addSql('INSERT INTO "_knex_temp_alter263" SELECT * FROM "media_entity";;');
    this.addSql('DROP TABLE "media_entity";');
    this.addSql('ALTER TABLE "_knex_temp_alter263" RENAME TO "media_entity";');
    this.addSql('PRAGMA foreign_keys = ON;');

    this.addSql('PRAGMA foreign_keys = OFF;');
    this.addSql('CREATE TABLE `_knex_temp_alter600` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `created_at` datetime, `updated_at` datetime, `subreddit_id` text NOT NULL, `subreddit_name` text NOT NULL, `offset` integer NOT NULL, `limit` integer NOT NULL DEFAULT 100, `iterations` integer NOT NULL DEFAULT 0, `last_iteration` datetime NOT NULL);');
    this.addSql('INSERT INTO "_knex_temp_alter600" SELECT * FROM "subreddit_scraper_entity";;');
    this.addSql('DROP TABLE "subreddit_scraper_entity";');
    this.addSql('ALTER TABLE "_knex_temp_alter600" RENAME TO "subreddit_scraper_entity";');
    this.addSql('PRAGMA foreign_keys = ON;');
  }

}
