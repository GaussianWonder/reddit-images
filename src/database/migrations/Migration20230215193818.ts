import { Migration } from '@mikro-orm/migrations';

export class Migration20230215193818 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `media_entity` add column `is_cached` integer not null default false;');
    this.addSql('alter table `media_entity` add column `size` integer null default null;');
  }

}
