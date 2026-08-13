-- Printly LB — database schema (PostgreSQL / Neon).
-- Run once against DATABASE_URL before using the admin dashboard:
--   psql "$DATABASE_URL" -f db/schema.sql
-- Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS projects (
  id              serial PRIMARY KEY,
  title           text        NOT NULL,
  slug            text        NOT NULL UNIQUE,
  category        text        NOT NULL,
  description     text        NOT NULL,
  image_url       text        NOT NULL,
  image_key       text,
  sort_order      integer     NOT NULL DEFAULT 0,
  featured        boolean     NOT NULL DEFAULT false,
  visible         boolean     NOT NULL DEFAULT true,
  draft           boolean     NOT NULL DEFAULT false,
  filter_category text        NOT NULL DEFAULT '',
  customer_goal   text        NOT NULL DEFAULT '',
  solution        text        NOT NULL DEFAULT '',
  materials       text        NOT NULL DEFAULT '',
  finishing       text        NOT NULL DEFAULT '',
  final_result    text        NOT NULL DEFAULT '',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_visible_order_idx
  ON projects (visible, draft, featured DESC, sort_order, id);

CREATE TABLE IF NOT EXISTS project_images (
  id         serial PRIMARY KEY,
  project_id integer     NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  image_url  text        NOT NULL,
  image_key  text,
  caption    text        NOT NULL DEFAULT '',
  sort_order integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_images_project_idx
  ON project_images (project_id, sort_order, id);

CREATE TABLE IF NOT EXISTS testimonials (
  id          serial PRIMARY KEY,
  client_name text        NOT NULL,
  client_role text        NOT NULL DEFAULT '',
  quote       text        NOT NULL,
  logo_url    text,
  visible     boolean     NOT NULL DEFAULT false,
  sort_order  integer     NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_visible_order_idx
  ON testimonials (visible, sort_order, id);

-- Single-row table (id is always 1). Populated when the admin changes their
-- credentials in the dashboard; until then ADMIN_USERNAME / ADMIN_PASSWORD are
-- used as the fallback.
CREATE TABLE IF NOT EXISTS admin_credentials (
  id            integer PRIMARY KEY,
  username      text        NOT NULL,
  password_hash text        NOT NULL,
  salt          text        NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);
