import { Migration } from '@mikro-orm/migrations';

export class Migration20230214152744 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `subreddit_scraper_entity` add column `after` varchar(100) null default null;');
  }

}
