import { Migration } from '@mikro-orm/migrations';

export class Migration20230214135256 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `subreddit_scraper_entity` add column `iterations` integer not null default 0;');
    this.addSql('alter table `subreddit_scraper_entity` add column `last_iteration` datetime not null;');
  }

}
