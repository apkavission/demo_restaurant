import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";
import { PageBand } from "@/components/site/ui";
import { getTestimonials, getVariant } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? "Reviews" : "Not found" };
}

/**
 * What people said — labelled as examples, every time.
 *
 * ---------------------------------------------------------------------------
 * Inventing a guest's review and presenting it as genuine is the one thing a
 * demonstration must not do, and it is the easiest thing in the world to do by
 * accident: a card with a name, a photograph and five stars reads as real
 * whatever the surrounding page says.
 *
 * So the label is on the page rather than in the small print, and the seeded
 * author is literally "Sample review".
 *
 * **And no average.** A figure over five across the top would look like every
 * other reviews page, which is exactly why it is not there: an average of
 * invented reviews is an invented average. What is counted is how many examples
 * this page carries, which is a fact about this page.
 */
export default async function ReviewsPage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const testimonials = await getTestimonials(variant.id);
  /* This page's own title and opening line, from the business. */
  const page = variant.copy.pages.reviews;
  const base = `/${variant.slug}`;
  const book = variant.features.bookingLabel ?? "Book a table";

  return (
    <>
      <PageBand
        eyebrow={variant.industryLabel}
        heading={page.heading}
        intro={page.intro}
        facts={
          testimonials.length > 0
            ? [{ label: "Examples here", value: String(testimonials.length) }]
            : undefined
        }
      >
        <Link href={`${base}/book`} className="btn group">
          {book}
          <ArrowRight className="arrow size-4" aria-hidden />
        </Link>
      </PageBand>

      <div className="container-page py-14 md:py-20">
        {testimonials.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
            Nothing here yet.
          </p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <li
                key={testimonial.id}
                data-reveal="lift"
                className="relative isolate flex flex-col rounded-[var(--radius-card)] border border-border bg-accent-soft p-7 pt-9"
                style={{ "--i": index % 3 } as React.CSSProperties}
              >
                <span className="quote-glyph font-display" aria-hidden>
                  &rdquo;
                </span>

                <blockquote className="relative flex-1 leading-relaxed">
                  {testimonial.quote}
                </blockquote>

                <div className="mt-6 flex items-end justify-between gap-3 border-t border-border pt-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{testimonial.author}</p>
                    {testimonial.role_label && (
                      <p className="truncate text-xs text-muted">{testimonial.role_label}</p>
                    )}
                  </div>

                  {testimonial.rating && (
                    <p
                      className="flex shrink-0 gap-0.5"
                      aria-label={`${testimonial.rating} out of 5`}
                    >
                      {Array.from({ length: testimonial.rating }).map((_, star) => (
                        <Star key={star} className="size-3.5 fill-accent text-accent" aria-hidden />
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
