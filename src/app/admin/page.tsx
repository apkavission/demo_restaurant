import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Inbox, Link2, Store } from "lucide-react";
import { EnquiryStatus, MarkRead } from "@/components/admin/inbox";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listVariants } from "@/lib/variants";

export const metadata: Metadata = { title: "Today" };

/**
 * The dashboard, and it is different depending on who is looking.
 *
 * The owner's requirement: **a dashboard by role.** Two audiences, and they open
 * this screen with different questions:
 *
 *   **An admin** is running the clinics. Their question is "what came in" — the
 *   reservations and messages that arrived, oldest first, because the oldest
 *   unanswered one is the one doing damage.
 *
 *   **A super admin** is running the demonstrations. Their question is "what is
 *   out there" — which businesses exist, which are private, and which links are
 *   live in somebody's inbox right now.
 *
 * So the top of the page differs and the bottom does not. A single dashboard
 * with everything on it would answer neither question well, and the second
 * audience would scroll past the first one's work every morning.
 */
export default async function AdminHome() {
  const session = await requireAdmin();
  const supabase = await createClient();

  const [variants, reservations, messages, links] = await Promise.all([
    listVariants(),
    supabase
      .from("reservations")
      .select(
        "*, offer:dishes(name), person:team(full_name), variant:variants(name)",
      )
      .order("created_at", { ascending: false })
      .limit(25),
    supabase
      .from("messages")
      .select("*, variant:variants(name)")
      .order("created_at", { ascending: false })
      .limit(15),
    session.isSuperAdmin
      ? supabase
          .from("share_links")
          .select("id, label, expires_at, revoked_at, view_count, variant:variants(name)")
          .is("revoked_at", null)
          .gt("expires_at", new Date().toISOString())
          .order("expires_at")
      : Promise.resolve({ data: [] }),
  ]);

  const bookings = (reservations.data ?? []) as unknown as {
    id: string;
    guest_name: string;
    phone: string;
    email: string | null;
    preferred_on: string;
    preferred_slot: string | null;
    note: string | null;
    status: string;
    created_at: string;
    offer: { name: string } | null;
    person: { full_name: string } | null;
    variant: { name: string } | null;
  }[];

  const notes = (messages.data ?? []) as unknown as {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    body: string;
    is_read: boolean;
    created_at: string;
    variant: { name: string } | null;
  }[];

  const live = (links.data ?? []) as unknown as {
    id: string;
    label: string;
    expires_at: string;
    view_count: number;
    variant: { name: string } | null;
  }[];

  const waiting = bookings.filter((row) => row.status === "requested").length;
  const unread = notes.filter((row) => !row.is_read).length;

  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {session.isSuperAdmin ? "The demonstrations" : "Today"}
          </h1>
          <p className="mt-2 text-muted">
            {session.isSuperAdmin
              ? "What exists, what is private, and which links are live."
              : "What came in from the demo sites."}
          </p>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: CalendarCheck, label: "Waiting for an answer", value: waiting },
          { icon: Inbox, label: "Unread messages", value: unread },
          { icon: Store, label: "Businesses", value: variants.length },
          ...(session.isSuperAdmin
            ? [{ icon: Link2, label: "Live share links", value: live.length }]
            : []),
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
            >
              <Icon className="size-4 text-accent" aria-hidden />
              <dt className="mt-3 text-sm text-muted">{card.label}</dt>
              <dd className="font-display mt-1 text-3xl font-semibold tabular-nums">
                {card.value}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* ------------------------------------------------------------- */}
      {session.isSuperAdmin && (
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Links that are live now</h2>
            <Link href="/admin/links" className="text-sm font-semibold text-accent hover:underline">
              Manage links
            </Link>
          </div>

          {live.length === 0 ? (
            <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-border p-8 text-sm text-muted">
              Nothing is out there. A link is created on the share links screen and
              stops working on its own date.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface">
              {live.map((link) => (
                <li key={link.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{link.label}</span>
                    <span className="block text-xs text-muted">
                      {link.variant?.name} · opened {link.view_count}{" "}
                      {link.view_count === 1 ? "time" : "times"}
                    </span>
                  </span>
                  <span className="text-xs text-muted">
                    until {new Date(link.expires_at).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------- */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Reservations</h2>

        {bookings.length === 0 ? (
          <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-border p-8 text-sm text-muted">
            Nothing booked yet. Book one on the public site and it appears here.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {booking.guest_name}
                      <span className="ml-2 text-sm font-normal text-muted">
                        {booking.phone}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {booking.variant?.name}
                      {booking.offer?.name ? ` · ${booking.offer.name}` : ""}
                      {booking.person?.full_name ? ` · ${booking.person.full_name}` : ""}
                    </p>
                    <p className="mt-1 text-sm">
                      Wants{" "}
                      <strong className="font-semibold">
                        {new Date(booking.preferred_on).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </strong>
                      {booking.preferred_slot ? `, ${booking.preferred_slot.toLowerCase()}` : ""}
                    </p>
                    {booking.note && (
                      <p className="measure mt-2 text-sm text-muted">{booking.note}</p>
                    )}
                  </div>

                  <EnquiryStatus id={booking.id} status={booking.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">Messages</h2>

        {notes.length === 0 ? (
          <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-border p-8 text-sm text-muted">
            Nothing written in yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className={cnJoin(
                  "rounded-[var(--radius-card)] border p-5",
                  note.is_read ? "border-border bg-surface opacity-70" : "border-accent/40 bg-surface",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {note.name}
                      <span className="ml-2 text-sm font-normal text-muted">
                        {note.phone ?? note.email}
                      </span>
                    </p>
                    <p className="text-xs text-muted">{note.variant?.name}</p>
                    <p className="measure mt-2 text-sm leading-relaxed">{note.body}</p>
                  </div>

                  {!note.is_read && <MarkRead id={note.id} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* A local join rather than importing `cn` — this file needs two classes joined
   once, and pulling in tailwind-merge for that is a dependency for nothing. */
function cnJoin(...values: string[]): string {
  return values.join(" ");
}
