import { Migration } from '@mikro-orm/migrations';

export class Migration20250605130326 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "product_media" add column if not exists "description" text null, add column if not exists "alt_text" text null, add column if not exists "sort_order" integer not null default 0, add column if not exists "is_thumbnail" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_media" drop column if exists "description", drop column if exists "alt_text", drop column if exists "sort_order", drop column if exists "is_thumbnail";`);
  }

}
