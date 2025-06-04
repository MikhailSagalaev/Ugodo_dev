import { Migration } from '@mikro-orm/migrations';

export class Migration20240613_product_media extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_media" (
      "id" text not null,
      "type" text check ("type" in ('image', 'video')) not null,
      "url" text not null,
      "product_id" text not null,
      "title" text null,
      "metadata" jsonb null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "product_media_pkey" primary key ("id")
    );`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PRODUCT_MEDIA_PRODUCT_ID" ON "product_media" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_media_deleted_at" ON "product_media" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_media" cascade;`);
  }
} 