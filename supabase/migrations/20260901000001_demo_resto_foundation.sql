-- ===========================================================================
-- The restaurant demo: one codebase, several complete businesses.
--
-- The owner’s instruction, 2026-08-31: one demo project holds several businesses,
-- the super admin decides which exist, and the link we send a prospect opens one
-- of them for a limited time.
--
-- ---------------------------------------------------------------------------
-- **Every content table carries `variant_id`, and is unique on
-- `(variant_id, slug)`** rather than on `slug` alone.
--
-- That single decision is what lets three businesses in this schema each have a
-- dish with the same name. A global unique on `slug` means the second one
-- cannot — which is absurd, and is exactly what happens when a variant column is
-- added to an existing schema afterwards.
--
-- ---------------------------------------------------------------------------
-- **Both themes are stored, and neither is derived from the other.** A colour
-- that works on white almost never works on near-black. The palettes are chosen
-- per mode in the content migration, not computed.
-- ===========================================================================

create schema if not exists demo_resto;

grant usage on schema demo_resto to anon, authenticated, service_role;

do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                  where t.typname = 'publish_state' and n.nspname = 'demo_resto') then
    create type demo_resto.publish_state as enum ('draft', 'published');
  end if;

  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                  where t.typname = 'enquiry_state' and n.nspname = 'demo_resto') then
    -- `seated` and `no_show` are recorded afterwards, and they are the pair a
    -- restaurant actually needs: covers walked versus covers booked is the number
    -- that decides whether it starts taking card details.
    create type demo_resto.enquiry_state as enum ('requested', 'confirmed', 'seated', 'no_show', 'cancelled');
  end if;
end
$$;

create table if not exists demo_resto.media (
  id          uuid primary key default gen_random_uuid(),
  storage_key text not null unique,
  filename    text not null,
  alt         text not null default '',
  width       integer,
  height      integer,
  mime_type   text,
  created_at  timestamptz not null default now()
);

comment on column demo_resto.media.alt is
  'What the picture shows, for somebody who cannot see it. Empty means decorative — a claim, not a default to be left unread.';

create table if not exists demo_resto.variants (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique check (slug ~ '^[a-z][a-z0-9-]*$'),

  name            text not null,
  industry_label  text not null,
  business_name   text not null,
  tagline         text,
  description     text,

  logo_light_id   uuid references demo_resto.media(id) on delete set null,
  logo_dark_id    uuid references demo_resto.media(id) on delete set null,
  og_image_id     uuid references demo_resto.media(id) on delete set null,

  /* Both palettes, plus type and shape:
       { "light": {...}, "dark": {...}, "headingFont", "bodyFont", "radius" } */
  theme           jsonb not null default '{}'::jsonb,
  contact         jsonb not null default '{}'::jsonb,
  features        jsonb not null default '{}'::jsonb,

  default_mode      text not null default 'light' check (default_mode in ('light','dark')),
  allow_mode_toggle boolean not null default true,

  /* public — anybody with the address, and the company site may link to it.
     link_only — only somebody holding a live share link. */
  visibility        text not null default 'public'
                      check (visibility in ('public', 'link_only')),

  is_default      boolean not null default false,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table demo_resto.variants is
  'One complete business each. Everything a visitor sees belongs to a variant; the code belongs to all of them.';

/* The bare `/` has to land somewhere, and "whichever row came back first" is a
   home page that changes when somebody edits an unrelated field. */
create unique index if not exists variants_one_default
  on demo_resto.variants (is_default) where is_default;

create table if not exists demo_resto.nav_items (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references demo_resto.variants(id) on delete cascade,
  label       text not null,
  href        text not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  unique (variant_id, label)
);

-- What this business offers.
create table if not exists demo_resto.dishes (
  id             uuid primary key default gen_random_uuid(),
  variant_id     uuid not null references demo_resto.variants(id) on delete cascade,

  slug           text not null check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  name           text not null,
  summary        text,
  description    text,
  icon           text,
  image_id       uuid references demo_resto.media(id) on delete set null,

  /* Text, not a number. "From ₹800", "On request" and "Included" are all real
     answers a business gives, and a numeric column forces one of them to become
     a lie or a zero. */
  price_label    text,
  meta_label     text,

  status         demo_resto.publish_state not null default 'published',
  sort_order     integer not null default 0,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (variant_id, slug)
);

-- Who is behind it.
create table if not exists demo_resto.team (
  id             uuid primary key default gen_random_uuid(),
  variant_id     uuid not null references demo_resto.variants(id) on delete cascade,

  slug           text not null check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  full_name      text not null,
  role_label     text,
  qualification  text,
  bio            text,
  photo_id       uuid references demo_resto.media(id) on delete set null,
  years_experience integer check (years_experience is null or years_experience between 0 and 70),

  availability   jsonb not null default '{}'::jsonb,

  status         demo_resto.publish_state not null default 'published',
  sort_order     integer not null default 0,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (variant_id, slug)
);

create table if not exists demo_resto.testimonials (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references demo_resto.variants(id) on delete cascade,
  author      text not null,
  role_label  text,
  quote       text not null,
  rating      integer check (rating is null or rating between 1 and 5),
  photo_id    uuid references demo_resto.media(id) on delete set null,
  status      demo_resto.publish_state not null default 'published',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists demo_resto.faqs (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references demo_resto.variants(id) on delete cascade,
  question    text not null,
  answer      text not null,
  status      demo_resto.publish_state not null default 'published',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

/*
  The working part.

  A demo that cannot be used is a picture. The form writes a real row, the panel
  shows it, and the state can be moved — which is what a prospect actually wants
  to watch happen.
*/
create table if not exists demo_resto.reservations (
  id            uuid primary key default gen_random_uuid(),
  variant_id    uuid not null references demo_resto.variants(id) on delete cascade,

  guest_name  text not null check (length(btrim(guest_name)) > 0),
  phone         text not null check (length(btrim(phone)) > 0),
  email         text,

  offer_id      uuid references demo_resto.dishes(id) on delete set null,
  person_id     uuid references demo_resto.team(id) on delete set null,

  preferred_on  date not null,
  preferred_slot text,
  party_size    integer not null check (party_size between 1 and 40),
  note          text,

  status        demo_resto.enquiry_state not null default 'requested',
  staff_note    text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists reservations_variant_idx
  on demo_resto.reservations (variant_id, preferred_on desc);

create table if not exists demo_resto.messages (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references demo_resto.variants(id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  body        text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

/*
  The link we send a prospect.

  Four properties, each for a specific way a demo link goes wrong: it opens one
  business, it cannot reach the panel, it stops on a date, and it can be revoked
  now — which a signed URL with the expiry baked into it cannot be, and that is
  the case that actually matters.
*/
create table if not exists demo_resto.share_links (
  id            uuid primary key default gen_random_uuid(),
  variant_id    uuid not null references demo_resto.variants(id) on delete cascade,

  token         text not null unique check (length(token) >= 24),
  label         text not null default '',
  note          text,

  expires_at    timestamptz not null,
  revoked_at    timestamptz,

  view_count    integer not null default 0,
  last_seen_at  timestamptz,
  max_views     integer check (max_views is null or max_views > 0),

  created_by    uuid,
  created_at    timestamptz not null default now(),

  constraint share_link_expires_after_it_starts check (expires_at > created_at)
);

create index if not exists share_links_live_idx
  on demo_resto.share_links (token) where revoked_at is null;

create or replace function demo_resto.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array['variants','dishes','team','reservations'] loop
    execute format('drop trigger if exists %I_set_updated_at on demo_resto.%I', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on demo_resto.%I
         for each row execute function demo_resto.set_updated_at()', t, t);
  end loop;
end
$$;
