import { Migration } from '@mikro-orm/migrations';

export class Migration20230213204123 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `media_entity` add column `post_id` text not null;');
    this.addSql('alter table `media_entity` add column `post_hint` varchar(128) not null;');
    this.addSql('alter table `media_entity` add column `ups` integer not null;');
    this.addSql('alter table `media_entity` add column `downs` integer not null;');
    this.addSql('alter table `media_entity` add column `score` integer not null;');
    this.addSql('alter table `media_entity` rename column `nsfw` to `upvote_ratio`;');
  }

}
