import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Quote, Star } from "lucide-react";
import {
  getPeople,
  getFaqs,
  getOffers,
  getTestimonials,
  getVariant,
} from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

/**
 * The home page, which is the whole pitch in one scroll.
 *
 * Ordered the way somebody actually decides: what this place does, who does it,
 * what it costs, what other people said, and the questions they were going to
 * ask anyway. A hero that says nothing but the business name, followed by three
 * cards of stock photography, is the demo every agency sends and the reason
 * nobody reads past the first screen.
 *
 * **Every number and name comes from the variant.** Nothing on this page is
 * written into the code, which is what lets the same file be a dental studio, a
 * cardiac centre and an eye hospital.
 */
export default async function VariantHome({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const [offers, people, testimonials, faqs] = await Promise.all([
    getOffers(variant.id),
    getPeople(variant.id),
    getTestimonials(variant.id),
    getFaqs(variant.id),
  ]);

  const base = `/${variant.slug}`;
  const book = variant.features.bookingLabel ?? "Book a table";

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      <section className="hero-wash">
        <div className="container-page grid gap-12 py-16 md:grid-cols-[1.15fr_1fr] md:items-center md:py-24">
          <div>
            <p className="eyebrow">
              {variant.industryLabel}
            </p>

            <h1 className="font-display display-1 mt-4 font-semibold">
              {variant.tagline ?? variant.businessName}
            </h1>

            {variant.description && (
              <p className="measure mt-5 text-lg leading-relaxed text-muted">
                {variant.description}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`${base}/book`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
              >
                {book}
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <Link
                href={`${base}/menu`}
                className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm font-semibold transition-colors hover:bg-surface-2"
              >
                The menu
              </Link>
            </div>

            {variant.contact.hours?.weekdays && (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                <Clock className="size-4 text-accent" aria-hidden />
                Open {variant.contact.hours.weekdays} on weekdays
              </p>
            )}
          </div>

          {/*
            A panel of facts rather than a stock photograph.

            Every demo site in the world puts a smiling stranger here. Three real
            answers — what it costs to walk in, how long it takes, who you see —
            is what a person is actually trying to find out, and it is the part a
            prospect recognises as their own business.
          */}
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-border bg-border">
            {[
              offers[0] && {
                term: "A table costs",
                value: offers[0].price_label ?? "On assessment",
                note: offers[0].name,
              },
              people.length > 0 && {
                term: "In the kitchen",
                value: `${people.length} person${people.length === 1 ? "" : "s"}`,
                note: people.map((d) => d.role_label).filter(Boolean).slice(0, 2).join(" · "),
              },
              variant.contact.hours?.saturday && {
                term: "Saturdays",
                value: variant.contact.hours.saturday,
                note: "The kitchen takes its last order half an hour before closing",
              },
            ]
              .filter(Boolean)
              .map((fact) => {
                const entry = fact as { term: string; value: string; note: string };
                return (
                  <div key={entry.term} className="bg-surface p-6">
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted">
                      {entry.term}
                    </dt>
                    <dd className="font-display mt-1.5 text-2xl font-semibold">{entry.value}</dd>
                    {entry.note && <p className="mt-1 text-sm text-muted">{entry.note}</p>}
                  </div>
                );
              })}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {offers.length > 0 && (
        <section className="container-page py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display display-2 rule-accent font-semibold">The menu</h2>
              <p className="measure mt-2 text-muted">
                Prices are what you would actually pay, and where a case needs
                assessing first 
              </p>
            </div>

            <Link
              href={`${base}/menu`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
            >
              The whole menu
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.slice(0, 6).map((offer) => (
              <li
                key={offer.id}
                className="card flex flex-col p-6"
              >
                <h3 className="font-display text-lg font-semibold">{offer.name}</h3>
                {offer.summary && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {offer.summary}
                  </p>
                )}

                <p className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
                  <span className="font-semibold text-accent">
                    {offer.price_label ?? "On assessment"}
                  </span>
                  {offer.meta_label && (
                    <span className="text-muted">{offer.meta_label}</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {people.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="container-page py-16 md:py-20">
            <h2 className="font-display display-2 rule-accent font-semibold">
              Our team
            </h2>
            <p className="measure mt-2 text-muted">
              The same people, every offer. That is what makes a kitchen consistent and it is the part most places cannot promise.
            </p>

            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person) => (
                <li key={person.id} className="rounded-[var(--radius-card)] border border-border p-6">
                  <p className="font-display text-lg font-semibold">{person.full_name}</p>
                  <p className="mt-0.5 text-sm text-accent">{person.role_label}</p>
                  {person.qualification && (
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                      {person.qualification}
                    </p>
                  )}
                  {person.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">{person.bio}</p>
                  )}
                  {person.years_experience !== null && (
                    <p className="mt-4 text-xs text-muted">
                      {person.years_experience} years in practice
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {testimonials.length > 0 && (
        <section className="container-page py-16 md:py-20">
          <h2 className="font-display display-2 rule-accent font-semibold">
            What people said
          </h2>
          {/*
            Said plainly, because the alternative is a lie.

            Inventing a guest's review and presenting it as real is the one
            thing a demonstration must not do. Labelling them costs nothing and
            is the difference between a sample and a fake.
          */}
          <p className="measure mt-2 text-muted">
            Examples, written for this demonstration. A real site would carry
            reviews collected from actual guests.
          </p>

          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <li
                key={testimonial.id}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-6"
              >
                <Quote className="size-5 text-accent" aria-hidden />
                <blockquote className="mt-3 text-sm leading-relaxed">
                  {testimonial.quote}
                </blockquote>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-xs text-muted">{testimonial.role_label}</p>
                  {testimonial.rating && (
                    <p className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5`}>
                      {Array.from({ length: testimonial.rating }).map((_, index) => (
                        <Star key={index} className="size-3.5 fill-accent text-accent" aria-hidden />
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {faqs.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="container-page grid gap-10 py-16 md:grid-cols-[1fr_1.4fr] md:py-20">
            <div>
              <h2 className="font-display display-2 rule-accent font-semibold">
                Questions people ask
              </h2>
              <p className="measure mt-2 text-muted">
                The ones that come up on the phone, answered here so nobody has
                to ring to find out.
              </p>
            </div>

            <dl className="divide-y divide-border">
              {faqs.map((faq) => (
                <div key={faq.id} className="py-5 first:pt-0">
                  <dt className="font-medium">{faq.question}</dt>
                  <dd className="measure mt-2 text-sm leading-relaxed text-muted">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      <section className="container-page py-16 md:py-24">
        <div className="rounded-[var(--radius-card)] border border-border bg-accent-soft p-10 text-center">
          <h2 className="font-display display-2 rule-accent font-semibold">
            {book}
          </h2>
          <p className="measure mx-auto mt-3 text-muted">
            Pick a day that suits you. We confirm by phone, and there is nothing
            to pay to hold the slot.
          </p>

          <Link
            href={`${base}/book`}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90"
          >
            {book}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
