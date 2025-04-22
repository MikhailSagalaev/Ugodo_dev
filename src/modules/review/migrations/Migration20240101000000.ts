import { Migration } from "@mikro-orm/migrations"

export class Migration20240101000000 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "review" ("id" text not null, "title" text null, "content" text not null, "rating" decimal not null, "first_name" text not null, "last_name" text not null, "status" text not null default \'pending\', "product_id" text not null, "customer_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));');
    this.addSql('create index "IDX_REVIEW_PRODUCT_ID" on "review" ("product_id");');
    this.addSql('alter table "review" add constraint "rating_range" check ("rating" >= 1 AND "rating" <= 5);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "review" cascade;');
  }
} 