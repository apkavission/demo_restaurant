import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { PageBand } from "@/components/site/ui";
import { getOffers, getVariant } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? "The menu" : "Not found" };
}

/**
 * The menu, set the way a menu is set.
 *
 * ---------------------------------------------------------------------------
 * **Every price is on the page, and where there is no price it says why.** A
 * restaurant that makes somebody ring to find out what dinner costs is a
 * restaurant they do not ring — and "from" with no number is the same thing
 * wearing a jacket.
 *
 * ---------------------------------------------------------------------------
 * **Printed, not carded.** A dish in a bordered box with a button under it is a
 * product; a dish on a line with leaders running to its price is a menu. The
 * page is one sheet of paper with the dishes down it, the long description
 * under each for the person who has stopped scanning and started choosing.
 *
 * It is also the reason this page looks nothing like the clinic's services
 * page, which is built from the same estate and the same components: the
 * furniture is shared, the form is the trade's own.
 */
export default async function MenuPage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const offers = await getOffers(variant.id);
  /* This page's own title and opening line, from the business. */
  const page = variant.copy.pages.catalogue;
  const base = `/${variant.slug}`;
  const book = variant.features.bookingLabel ?? "Book a table";
  const phone = variant.contact.phone;
  const dial = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  const facts = [
    offers.length > 0 ? { label: "Dishes", value: String(offers.length) } : null,
    offers[0]?.price_label ? { label: "A table costs", value: offers[0].price_label } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <PageBand
        eyebrow={variant.industryLabel}
        heading={page.heading}
        intro={page.intro}
        facts={facts}
      >
        <Link href={`${base}/book`} className="btn group">
          {book}
          <ArrowRight className="arrow size-4" aria-hidden />
        </Link>

        {dial && (
          <a href={dial} className="btn-ghost">
            <Phone className="size-4 text-accent" aria-hidden />
            {phone}
          </a>
        )}
      </PageBand>

      <div className="container-page py-14 md:py-20">
        {offers.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
            Nothing listed yet.
          </p>
        ) : (
          <div className="menu-paper p-6 md:p-12" data-reveal="lift">
            <p className="course-label">The card</p>

            <ul className="mt-10 space-y-10">
              {offers.map((dish) => (
                <li key={dish.id}>
                  <h2 className="menu-row">
                    <span className="font-display text-xl font-semibold">{dish.name}</span>
                    <span className="font-display text-xl font-semibold text-accent">
                      {dish.price_label ?? "On the night"}
                    </span>
                  </h2>

                  {dish.summary && (
                    <p className="mt-2 text-sm font-medium text-muted">{dish.summary}</p>
                  )}

                  {dish.description && (
                    <p className="measure mt-3 text-sm leading-relaxed text-muted">
                      {dish.description}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                    {dish.meta_label ? (
                      <span className="text-xs uppercase tracking-[0.14em] text-muted">
                        {dish.meta_label}
                      </span>
                    ) : (
                      <span />
                    )}

                    <Link
                      href={`${base}/book?dish=${dish.slug}`}
                      className="group inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
                    >
                      Book this
                      <ArrowRight className="arrow size-4" aria-hidden />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {/* The line every menu ends with, and the one a demonstration must
                not leave off: these prices are invented. */}
            <p className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
              A demonstration menu. Every dish and every price here is invented.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
