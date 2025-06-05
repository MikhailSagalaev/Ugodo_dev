import { Migration } from '@mikro-orm/migrations';

export class Migration20250605172737 extends Migration {

  override async up(): Promise<void> {
    // First drop the table if it exists to ensure clean state
    this.addSql(`drop table if exists "product_video" cascade;`);
    
    // Create the table with all required columns including deleted_at
    this.addSql(`create table "product_video" ("id" text not null, "product_id" text not null, "type" text check ("type" in ('main', 'preview', 'demo', 'tutorial')) not null, "fileId" text not null, "filename" text not null, "mimeType" text not null, "size" integer not null, "title" text null, "description" text null, "url" text not null, "thumbnail_url" text null, "duration" integer null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_video_pkey" primary key ("id"));`);
    
    // Create the index on deleted_at
    this.addSql(`CREATE INDEX "IDX_product_video_deleted_at" ON "product_video" (deleted_at) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_video" cascade;`);
  }

}
