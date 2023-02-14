import { Migration } from '@mikro-orm/migrations';

export class Migration20230214201512 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `media_entity` add column `content_categories` varchar(128) not null;');
  }

}
