-- ===========================================================================
-- Who may read the restaurant demo, and who may change it.
--
-- **Nothing in this schema is a secret.** It is invented content for invented
-- businesses. The policies exist so a visitor cannot *change* what the next
-- prospect sees, and so an enquiry typed into a demo form does not appear on a
-- public page.
--
-- The link-only rule is enforced in the application, in `proxy.ts`, not here: a
-- row policy has no way to see a cookie, and pretending otherwise would mean a
-- lie in a comment. What the application enforces is discoverability.
--
-- **There is no account list in this schema.** The estate has one, in the
-- company website. This reads two columns of one row of it and fails towards
-- "not an admin".
-- ===========================================================================

create or replace function demo_resto.is_admin()
returns boolean language sql stable security definer
set search_path = company, public
as $$
  select exists (
    select 1 from company.profiles p
    join company.roles r on r.key = p.role
    where p.id = auth.uid() and p.is_active and r.is_active
      and 'resto' = any (p.app_access)
  );
$$;

create or replace function demo_resto.is_super_admin()
returns boolean language sql stable security definer
set search_path = company, public
as $$
  select exists (
    select 1 from company.profiles p
    join company.roles r on r.key = p.role
    where p.id = auth.uid() and p.is_active and r.is_active and r.is_owner
      and 'resto' = any (p.app_access)
  );
$$;

grant execute on function demo_resto.is_admin() to authenticated;
grant execute on function demo_resto.is_super_admin() to authenticated;

/* The panel's view of who is signed in — the caller's own row and nothing else.
   Runs with owner rights, so the where clause is the access control. */
create or replace view demo_resto.me
with (security_invoker = false) as
  select p.id, p.full_name, p.role as role_key, r.label as role_label,
         r.is_owner, p.app_access, p.is_active
  from company.profiles p
  left join company.roles r on r.key = p.role
  where p.id = auth.uid();

grant select on demo_resto.me to authenticated;

alter table demo_resto.media        enable row level security;
alter table demo_resto.variants     enable row level security;
alter table demo_resto.nav_items    enable row level security;
alter table demo_resto.dishes      enable row level security;
alter table demo_resto.team     enable row level security;
alter table demo_resto.testimonials enable row level security;
alter table demo_resto.faqs         enable row level security;
alter table demo_resto.reservations    enable row level security;
alter table demo_resto.messages     enable row level security;
alter table demo_resto.share_links  enable row level security;

grant select on
  demo_resto.media, demo_resto.variants, demo_resto.nav_items,
  demo_resto.dishes, demo_resto.team, demo_resto.testimonials, demo_resto.faqs
  to anon, authenticated;

grant insert on demo_resto.reservations, demo_resto.messages to anon, authenticated;

grant select, insert, update, delete on
  demo_resto.media, demo_resto.variants, demo_resto.nav_items,
  demo_resto.dishes, demo_resto.team, demo_resto.testimonials, demo_resto.faqs,
  demo_resto.reservations, demo_resto.messages, demo_resto.share_links
  to authenticated;

grant all on all tables in schema demo_resto to service_role;

/* Published content of active variants is public. Drafts are not — that is the
   point of the state: somebody half-way through writing should be able to save
   without a prospect reading it that afternoon. */
do $$
declare t text;
begin
  foreach t in array array['dishes','team','testimonials','faqs'] loop
    execute format('drop policy if exists %I_public_read on demo_resto.%I', t, t);
    execute format($p$
      create policy %I_public_read on demo_resto.%I
        for select using (
          status = 'published'
          and exists (select 1 from demo_resto.variants v
                       where v.id = variant_id and v.is_active)
        )
    $p$, t, t);

    execute format('drop policy if exists %I_admin_all on demo_resto.%I', t, t);
    execute format($p$
      create policy %I_admin_all on demo_resto.%I
        for all using (demo_resto.is_admin()) with check (demo_resto.is_admin())
    $p$, t, t);
  end loop;
end
$$;

drop policy if exists variants_public_read on demo_resto.variants;
create policy variants_public_read on demo_resto.variants for select using (is_active);

/* Only a super admin decides which businesses exist. Adding, renaming or
   retiring one changes what every visitor sees. */
drop policy if exists variants_super_admin_write on demo_resto.variants;
create policy variants_super_admin_write on demo_resto.variants
  for all using (demo_resto.is_super_admin()) with check (demo_resto.is_super_admin());

drop policy if exists nav_public_read on demo_resto.nav_items;
create policy nav_public_read on demo_resto.nav_items
  for select using (
    is_active and exists (select 1 from demo_resto.variants v
                           where v.id = variant_id and v.is_active)
  );

drop policy if exists nav_admin_all on demo_resto.nav_items;
create policy nav_admin_all on demo_resto.nav_items
  for all using (demo_resto.is_admin()) with check (demo_resto.is_admin());

drop policy if exists media_public_read on demo_resto.media;
create policy media_public_read on demo_resto.media for select using (true);

drop policy if exists media_admin_all on demo_resto.media;
create policy media_admin_all on demo_resto.media
  for all using (demo_resto.is_admin()) with check (demo_resto.is_admin());

/* Anybody may enquire; only the team may read the enquiries. The insert is open
   because that is the demonstration; the read is closed because the next visitor
   must not see the last one's phone number, invented or not. */
drop policy if exists reservations_public_insert on demo_resto.reservations;
create policy reservations_public_insert on demo_resto.reservations
  for insert with check (
    status = 'requested'
    and exists (select 1 from demo_resto.variants v where v.id = variant_id and v.is_active)
  );

drop policy if exists reservations_admin_all on demo_resto.reservations;
create policy reservations_admin_all on demo_resto.reservations
  for all using (demo_resto.is_admin()) with check (demo_resto.is_admin());

drop policy if exists messages_public_insert on demo_resto.messages;
create policy messages_public_insert on demo_resto.messages
  for insert with check (
    exists (select 1 from demo_resto.variants v where v.id = variant_id and v.is_active)
  );

drop policy if exists messages_admin_all on demo_resto.messages;
create policy messages_admin_all on demo_resto.messages
  for all using (demo_resto.is_admin()) with check (demo_resto.is_admin());

/* Share links are never readable by the public. The token is the whole secret,
   and the labels beside it are a list of who we are pitching to. */
drop policy if exists share_links_admin_all on demo_resto.share_links;
create policy share_links_admin_all on demo_resto.share_links
  for all using (demo_resto.is_super_admin()) with check (demo_resto.is_super_admin());

/**
 * May this browser see this variant?
 *
 *   ok         — go ahead.
 *   needs_link — link-only, and no live link was presented.
 *   wrong_link — a live link for a different variant. Worth distinguishing,
 *                because the answer is "here is yours" rather than "no".
 *   unknown    — no such variant.
 *
 * Every kind of failure that is not `wrong_link` looks the same from outside:
 * expired, revoked, used up and never-existed all give `needs_link`. Telling
 * them apart tells somebody probing which tokens are real.
 */
create or replace function demo_resto.can_view(p_slug text, p_token text default null)
returns table (verdict text, allowed_slug text)
language plpgsql stable security definer
set search_path = demo_resto, public
as $$
declare
  v record;
  link record;
begin
  select id, slug, visibility into v
  from demo_resto.variants where slug = p_slug and is_active;

  if p_token is not null then
    select l.id, l.variant_id, vv.slug as slug into link
    from demo_resto.share_links l
    join demo_resto.variants vv on vv.id = l.variant_id
    where l.token = p_token
      and l.revoked_at is null
      and l.expires_at > now()
      and vv.is_active
      and (l.max_views is null or l.view_count < l.max_views);
  end if;

  if v.id is null then
    verdict := case when link.id is null then 'unknown' else 'wrong_link' end;
    allowed_slug := link.slug;
    return next;
    return;
  end if;

  if v.visibility = 'public' then
    verdict := 'ok'; allowed_slug := v.slug; return next; return;
  end if;

  if link.id is null then
    verdict := 'needs_link'; allowed_slug := null; return next; return;
  end if;

  if link.variant_id = v.id then
    verdict := 'ok'; allowed_slug := v.slug;
  else
    verdict := 'wrong_link'; allowed_slug := link.slug;
  end if;

  return next;
end;
$$;

grant execute on function demo_resto.can_view(text, text) to anon, authenticated;

/* Counted when a link is first opened, not on every request — otherwise one
   prospect reading six pages reports as forty visits, and the number exists to
   answer "did they actually look at it". */
create or replace function demo_resto.note_share_visit(p_token text)
returns void language sql security definer
set search_path = demo_resto, public
as $$
  update demo_resto.share_links
  set view_count = view_count + 1, last_seen_at = now()
  where token = p_token and revoked_at is null and expires_at > now();
$$;

grant execute on function demo_resto.note_share_visit(text) to anon, authenticated;
