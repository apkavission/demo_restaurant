import type { Metadata } from "next";
import Link from "next/link";
import { PersonEditor, OfferEditor } from "@/components/admin/editors";
import { requireAdmin } from "@/lib/auth";
import { getPeople, getOffers, listVariants } from "@/lib/variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Content" };

type Props = { searchParams: Promise<{ variant?: string }> };

/**
 * Editing one business at a time.
 *
 * **The variant is picked once, at the top, and everything below belongs to it.**
 * Every query carries its id, so editing across two businesses at once is not
 * something to be careful about — it is not expressible.
 *
 * That is the mistake this screen is shaped to prevent: three clinics with a
 * service called "consultation" each, and an editor that lets somebody change
 * the wrong one because the rows look identical in a list.
 */
export default async function ContentPage({ searchParams }: Props) {
  await requireAdmin();

  const { variant: wanted } = await searchParams;
  const variants = await listVariants();

  const variant = variants.find((entry) => entry.slug === wanted) ?? variants[0];

  if (!variant) {
    return (
      <div className="container-page py-10">
        <p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
          There are no businesses yet.
        </p>
      </div>
    );
  }

  const [offers, people] = await Promise.all([
    getOffers(variant.id),
    getPeople(variant.id),
  ]);

  return (
    <div className="container-page py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Content</h1>
        <p className="mt-2 text-muted">
          What the public site shows. Saved changes appear on it straight away.
        </p>
      </header>

      {/* --------------------------------------------------------------- */}
      <nav aria-label="Business" className="mt-8 flex flex-wrap gap-2">
        {variants.map((entry) => (
          <Link
            key={entry.slug}
            href={`/admin/content?variant=${entry.slug}`}
            aria-current={entry.slug === variant.slug ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              entry.slug === variant.slug
                ? "border-accent bg-accent-soft font-semibold text-accent"
                : "border-border text-muted hover:bg-surface-2 hover:text-text",
            )}
          >
            {entry.name}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-sm text-muted">
        Editing <strong className="font-semibold text-text">{variant.businessName}</strong>.{" "}
        <Link href={`/${variant.slug}`} target="_blank" className="text-accent hover:underline">
          Open the site
        </Link>
      </p>

      {/* --------------------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold">
          The menu
          <span className="ml-2 text-sm font-normal text-muted">{offers.length}</span>
        </h2>

        <div className="mt-4 space-y-3">
          {offers.map((offer) => (
            <OfferEditor
              key={offer.id}
              offer={{
                id: offer.id,
                name: offer.name,
                summary: offer.summary,
                price_label: offer.price_label,
                meta_label: offer.meta_label,
                status: offer.status,
              }}
            />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold">
          Our team
          <span className="ml-2 text-sm font-normal text-muted">{people.length}</span>
        </h2>

        <div className="mt-4 space-y-3">
          {people.map((person) => (
            <PersonEditor
              key={person.id}
              person={{
                id: person.id,
                full_name: person.full_name,
                role_label: person.role_label,
                qualification: person.qualification,
                bio: person.bio,
                status: person.status,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
