import { Migration } from "@mikro-orm/migrations"

export class Migration20250423210500 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "banner" (
        "id" text NOT NULL,
        "title" text NOT NULL,
        "subtitle" text NULL,
        "handle" text NULL,
        "description" text NULL,
        "image_url" text NOT NULL,
        "position" text NOT NULL DEFAULT 'home_top',
        "link_url" text NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamptz NULL,
        CONSTRAINT "banner_pkey" PRIMARY KEY ("id")
      );
    `)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "banner" CASCADE;')
  }
} 