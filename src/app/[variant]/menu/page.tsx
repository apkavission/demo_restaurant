import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getOffers, getVariant } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? "The menu" : "Not found" };
}

/**
 * Everything on offer, with what it costs.
 *
 * **The price is on every card, and where there is no price we say why.** A page
 * that makes somebody ring to find out what something costs loses the people who
 * were only ever going to ring once — and "from" with no number is the same
 * thing wearing a suit.
 */
export default async function OfferPage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const offers = await getOffers(variant.id);
  const base = `/${variant.slug}`;

  return (
    <div className="container-page py-14 md:py-20">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {variant.industryLabel}
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight">
          The menu
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Prices are what you actually pay at the table. Where a dish depends on what the market had that morning, it says so instead of showing a number that changes.
        </p>
      </header>

      {offers.length === 0 ? (
        <p className="mt-12 rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
          Nothing listed yet.
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-7 shadow-[var(--shadow-1)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold">{offer.name}</h2>
                <p className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                  {offer.price_label ?? "On request"}
                </p>
              </div>

              {offer.summary && (
                <p className="mt-2 text-sm font-medium text-muted">{offer.summary}</p>
              )}

              {offer.description && (
                <p className="measure mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {offer.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                {offer.meta_label && <span className="text-muted">{offer.meta_label}</span>}

                <Link
                  href={`${base}/book?offer=${offer.slug}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                >
                  Book a table
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
