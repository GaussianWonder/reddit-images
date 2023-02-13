import { Migration } from '@mikro-orm/migrations';

export class Migration20230213194553 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `media_entity` (`id` integer not null primary key autoincrement, `created_at` datetime not null, `updated_at` datetime not null, `url` text not null, `mimetype` varchar(128) not null default \'unknown\', `width` integer not null, `height` integer not null, `subreddit` varchar(128) not null, `title` varchar(255) not null, `description` text not null, `nsfw` integer not null, `index` text not null);');
  }

}
