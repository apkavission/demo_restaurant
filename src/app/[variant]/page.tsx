import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, ChevronDown, Clock, FileText, MapPin, Phone, ShieldCheck, Sparkles, Star, UserRound } from "lucide-react";
import { Hero } from "@/components/site/hero";
import { Spotlight } from "@/components/site/motion";
import { Chip, Monogram, SectionHead, Stat } from "@/components/site/ui";
import { clientEnv } from "@/lib/env";
import { businessJsonLd, faqJsonLd, peopleJsonLd, structuredData } from "@/lib/seo";
import {
  getPeople,
  getFaqs,
  getOffers,
  getTestimonials,
  getVariant,
} from "@/lib/variants";

/**
 * The icons a promise may be drawn with, by the key its row stores.
 *
 * Imported by name here, which is the reason `PROMISE_ICONS` in `lib/copy.ts`
 * is a fixed list rather than a text field: a bundler cannot include a
 * component named by a database row at request time. An unknown key never
 * reaches this map, because the reader has already replaced it.
 */
const ICONS = {
  person: UserRound,
  estimate: FileText,
  shield: ShieldCheck,
  calendar: CalendarCheck,
  phone: Phone,
  clock: Clock,
  pin: MapPin,
  spark: Sparkles,
} as const;

type Props = { params: Promise<{ variant: string }> };

/**
 * The home page, which is the whole pitch in one scroll.
 *
 * ---------------------------------------------------------------------------
 * **What somebody opening a restaurant's website is trying to find out**, in
 * the order they try to find it out: what is it like inside, what is on the
 * menu, what will a meal cost, can I get a table tonight, and where is it. The
 * first screen answers all five, and everything below it is evidence.
 *
 * That order is the reason this page is not the clinic's page with different
 * words in it. A clinic is chosen on trust and a price; a restaurant is chosen
 * on appetite and a time. So the first thing under the headline is what a table
 * costs and when the room sits, and the first band is the menu itself.
 *
 * ---------------------------------------------------------------------------
 * **The menu is printed, not carded.** A dish set in a box with a button under
 * it is a product; a dish on a line with leaders running to its price is a
 * menu, and a reader knows which one they are looking at before they have read
 * a word. `.menu-row` in `globals.css` says how, and why it is a gradient
 * rather than a row of full stops.
 *
 * ---------------------------------------------------------------------------
 * **Every name, number and price comes from the variant.** Nothing here is
 * written into the code, which is what lets the same file be a tasting room, a
 * bakery and a tiffin kitchen — and what lets the owner change any of it from
 * the panel without a deployment.
 *
 * **There are no photographs, on purpose.** Food photography that is not this
 * kitchen's food is the fastest way to make a restaurant look like a template,
 * and it is the one thing a business cannot keep when the site becomes theirs.
 * What stands in for it is type, the paper the menu is printed on, and the
 * business's own colour.
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

  /* Every heading, sentence and promise below comes from here. */
  const copy = variant.copy;
  const base = `/${variant.slug}`;
  const book = variant.features.bookingLabel ?? "Book a table";

  const { phone, address, mapQuery, hours } = variant.contact;
  const dial = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  const mapHref = mapQuery
    ? `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`
    : address
      ? `https://maps.google.com/?q=${encodeURIComponent(address)}`
      : null;

  /* The dish the room is built around — the set menu, the counter, the plan. */
  const headline = offers[0];

  const longest = people.reduce(
    (most, person) => Math.max(most, person.years_experience ?? 0),
    0,
  );

  /* Numbered as the page is built, so a business with no reviews listed does
     not print "01, 02, 04". */
  let chapter = 0;
  const menuIndex = offers.length > 0 ? (chapter += 1) : 0;
  const peopleIndex = people.length > 0 ? (chapter += 1) : 0;
  const reviewsIndex = testimonials.length > 0 ? (chapter += 1) : 0;
  const questionsIndex = faqs.length > 0 ? (chapter += 1) : 0;

  /*
    What a search engine is told about this business.

    One script tag, one graph: the business, what it offers with prices, the
    questions it answers, and the people who work here — every field derived from a row, and
    two fields deliberately absent. `lib/seo.ts` says which and why. The page
    stays `noindex`, which is not a contradiction: this is what the real site
    inherits on the day one of these becomes it, and it is what a prospect's own
    SEO person is shown when they ask.
  */
  const site = clientEnv.NEXT_PUBLIC_SITE_URL ?? "";
  const business = businessJsonLd(variant, offers, site);

  const jsonLd = structuredData([
    business,
    faqJsonLd(faqs),
    peopleJsonLd(people, String(business["@id"])),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* ============================================================ hero == */}
      <Hero
        image={variant.hero.image}
        imageAlt={variant.hero.imageAlt}
        video={variant.hero.video}
        overlay={copy.hero.overlay}
        align={copy.hero.align}
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="micro enter" style={{ "--enter": 0 } as React.CSSProperties}>
              {variant.industryLabel}
            </p>

            {/* The clip is on the wrapper and the movement on the heading, so
                the letters are cut off as they rise rather than sliding in. */}
            <span className="mask-rise mt-5 block">
              <h1
                className="font-display display-hero font-semibold"
                style={{ "--enter": 1 } as React.CSSProperties}
              >
                {variant.tagline ?? variant.businessName}
              </h1>
            </span>

            {variant.description && (
              <p
                className="measure enter mt-6 text-lg leading-relaxed text-muted"
                style={{ "--enter": 2 } as React.CSSProperties}
              >
                {variant.description}
              </p>
            )}

            {/*
              Two actions, and the second is the menu.

              Nobody books a restaurant they have not read the menu of. Putting
              the menu behind the navigation and only offering "Book" here is
              asking for a decision before the evidence.
            */}
            <div
              className="enter mt-9 flex flex-wrap gap-3"
              style={{ "--enter": 3 } as React.CSSProperties}
            >
              <Link href={`${base}/book`} className="btn group">
                {book}
                <ArrowRight className="arrow size-4" aria-hidden />
              </Link>

              <Link href={`${base}/menu`} className="btn-ghost group">
                Read the menu
                <ArrowRight className="arrow size-4" aria-hidden />
              </Link>
            </div>

            <dl
              className="enter mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-border pt-7"
              style={{ "--enter": 4 } as React.CSSProperties}
            >
              {offers.length > 0 && <Stat label="On the menu" value={offers.length} />}

              {people.length > 0 && (
                <Stat
                  label="In the kitchen"
                  value={people.length}
                  suffix={people.length === 1 ? " person" : " people"}
                />
              )}

              {longest > 0 && <Stat label="Longest serving" value={longest} suffix=" years" />}
            </dl>
          </div>

          {/*
            Tonight, as a card.

            What a table costs, when the room sits, and where the door is — the
            three things somebody needs before they will ring, set as a menu
            card rather than a panel of statistics.
          */}
          <aside
            className="menu-paper enter overflow-hidden"
            style={{ "--enter": 2 } as React.CSSProperties}
          >
            {headline && (
              <div className="border-b border-border p-6 md:p-7">
                <p className="micro" style={{ "--micro-rule": "1.5rem" } as React.CSSProperties}>
                  A table costs
                </p>
                <p className="font-display price mt-3 text-5xl font-semibold">
                  {headline.price_label ?? "On the night"}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {headline.name}
                  {headline.meta_label ? ` · ${headline.meta_label}` : ""}
                </p>
                {headline.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{headline.summary}</p>
                )}
              </div>
            )}

            {(hours?.weekdays || hours?.saturday || hours?.sunday) && (
              <div className="border-b border-border p-6 md:p-7">
                <p className="micro" style={{ "--micro-rule": "1.5rem" } as React.CSSProperties}>
                  <Clock className="size-3.5 text-accent" aria-hidden />
                  When the room sits
                </p>

                <dl className="mt-3 space-y-2 text-sm">
                  {hours?.weekdays && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted">Monday to Friday</dt>
                      <dd className="font-medium tabular-nums">{hours.weekdays}</dd>
                    </div>
                  )}
                  {hours?.saturday && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted">Saturday</dt>
                      <dd className="font-medium tabular-nums">{hours.saturday}</dd>
                    </div>
                  )}
                  {hours?.sunday && (
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-muted">Sunday</dt>
                      <dd className="font-medium tabular-nums">{hours.sunday}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {address && (
              <div className="p-6 md:p-7">
                <p className="micro" style={{ "--micro-rule": "1.5rem" } as React.CSSProperties}>
                  <MapPin className="size-3.5 text-accent" aria-hidden />
                  Where to come
                </p>
                <p className="mt-3 text-sm leading-relaxed">{address}</p>
                {mapHref && (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                  >
                    Open in Maps
                    <ArrowRight className="arrow size-3.5" aria-hidden />
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </Hero>

      {/* ===================================================== reassurance == */}
      {/* Absent entirely when a business has taken every promise off, rather
          than a tinted band with nothing in it. */}
      {copy.promises.length > 0 && (
        <section className="border-b border-border bg-surface-2">
          <ul className="container-page grid gap-x-8 gap-y-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {copy.promises.map((promise, index) => {
              const Icon = ICONS[promise.icon as keyof typeof ICONS] ?? UserRound;

              return (
                <li
                  key={promise.title}
                  /*
                    Part of the load sequence rather than a scroll reveal: on a
                    tall screen this strip is already on the first screen, and a
                    band that is visible but faded because nobody has scrolled
                    reads as a page that failed to finish loading.
                  */
                  className="enter flex gap-3.5 lg:border-l lg:border-border lg:pl-5 lg:first:border-0 lg:first:pl-0"
                  style={{ "--enter": 5 + index } as React.CSSProperties}
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_22%,transparent)]">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{promise.title}</span>
                    {promise.note && (
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                        {promise.note}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}


      {/* ============================================================ menu == */}
      {offers.length > 0 && (
        <section className="band-open container-page py-18 md:py-24">
          <SectionHead
            index={menuIndex}
            label="The menu"
            heading={copy.catalogue.heading}
            intro={copy.catalogue.intro}
            action={{ href: `${base}/menu`, label: `The whole menu` }}
          />

          {/*
            Printed as a menu, in two columns, on its own paper.

            Two columns rather than a grid of cards: a menu is read down, and a
            card grid makes eight dishes look like eight products. The leaders
            are what carry the eye from a dish to its price — see `.menu-row`.
          */}
          <div className="menu-paper mt-12 p-6 md:p-10" data-reveal="lift">
            <p className="course-label">Tonight</p>

            <ul className="mt-8 grid gap-x-14 gap-y-7 md:grid-cols-2">
              {offers.slice(0, 8).map((dish) => (
                <li key={dish.id}>
                  <p className="menu-row">
                    <span className="font-display text-lg font-semibold">{dish.name}</span>
                    <span className="font-display text-lg font-semibold text-accent">
                      {dish.price_label ?? "On the night"}
                    </span>
                  </p>

                  {dish.summary && (
                    <p className="measure mt-1.5 text-sm leading-relaxed text-muted">
                      {dish.summary}
                    </p>
                  )}

                  {dish.meta_label && (
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted">
                      {dish.meta_label}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ========================================================== people == */}
      {people.length > 0 && (
        <section className="border-y border-border bg-surface">
          <div className="container-page py-18 md:py-24">
            <SectionHead
              index={peopleIndex}
              label="The kitchen"
              heading={copy.people.heading}
              intro={copy.people.intro}
              action={{ href: `${base}/people`, label: "Everyone in the room" }}
            />

            <Spotlight as="ul" className="mt-12 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((person, index) => (
                <li
                  key={person.id}
                  data-reveal="lift"
                  className="tile spot underline-grow flex flex-col p-6"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <div className="flex items-center gap-3.5">
                    <Monogram name={person.full_name} />

                    <div className="min-w-0">
                      <p className="font-display truncate text-base font-semibold">
                        {person.full_name}
                      </p>
                      {person.role_label && (
                        <p className="truncate text-sm text-accent">{person.role_label}</p>
                      )}
                    </div>
                  </div>

                  {person.bio && (
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{person.bio}</p>
                  )}

                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    {person.qualification && <Chip>{person.qualification}</Chip>}
                    {person.years_experience !== null && (
                      <span className="text-xs text-muted">
                        {person.years_experience} years in kitchens
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </Spotlight>
          </div>
        </section>
      )}

      {/* ========================================================= reviews == */}
      {testimonials.length > 0 && (
        <section className="band-open container-page py-18 md:py-24">
          <SectionHead
            index={reviewsIndex}
            label="Reviews"
            heading={copy.reviews.heading}
            /* Said plainly, because the alternative is a lie: inventing a
               guest's review and presenting it as real is the one thing a
               demonstration must not do. */
            intro={copy.reviews.intro}
          />

          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 6).map((testimonial, index) => (
              <li
                key={testimonial.id}
                data-reveal="lift"
                className="relative isolate flex flex-col rounded-[var(--radius-card)] border border-border bg-accent-soft p-6 pt-9"
                style={{ "--i": index } as React.CSSProperties}
              >
                <span className="quote-glyph font-display" aria-hidden>
                  &rdquo;
                </span>

                <blockquote className="relative flex-1 text-base leading-relaxed">
                  {testimonial.quote}
                </blockquote>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-muted">{testimonial.role_label}</p>
                  {testimonial.rating && (
                    <p className="flex gap-0.5" aria-label={`${testimonial.rating} out of 5`}>
                      {Array.from({ length: testimonial.rating }).map((_, star) => (
                        <Star key={star} className="size-3.5 fill-accent text-accent" aria-hidden />
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ======================================================= questions == */}
      {faqs.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="container-page grid gap-12 py-18 md:grid-cols-[1fr_1.4fr] md:py-24">
            <SectionHead
              index={questionsIndex}
              label="Questions"
              heading={copy.questions.heading}
              intro={copy.questions.intro}
            />

            {/* An accordion made of `<details>`, with no JavaScript: it opens
                without hydration, the browser's own find-in-page searches it,
                and a screen reader announces it correctly. */}
            <div className="divide-y divide-border" data-reveal>
              {faqs.map((faq, index) => (
                <details key={faq.id} className="group py-4 first:pt-0" open={index === 0}>
                  <summary className="flex cursor-pointer list-none items-baseline gap-4 font-medium">
                    <span className="index-num text-xs">{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{faq.question}</span>
                    <ChevronDown
                      className="size-4 shrink-0 self-center text-muted transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="measure mt-3 pl-9 text-sm leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================= cta == */}
      <section className="container-page py-18 md:py-24">
        <div
          data-reveal="lift"
          className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-border bg-accent-soft p-8 text-center md:p-14"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(28rem_18rem_at_50%_-10%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)]"
          />

          {/* The booking button's own label is the right default here, and this page
              is the only place that knows it — which is why `readCopy()` leaves this
              heading empty rather than inventing one. */}
          <h2 className="font-display display-2 font-semibold">{copy.cta.heading || book}</h2>

          <p className="measure mx-auto mt-4 text-muted">
            Pick an evening and we will confirm it by telephone. Nothing is charged to hold a
            table.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
          </div>
        </div>
      </section>

      {/* The two actions, pinned to the foot of the screen, on phones only —
          which is what a restaurant's site is opened on, by somebody deciding
          where to eat in the next hour. */}
      <div className="action-bar md:hidden">
        <div className="container-page flex gap-2 py-3">
          {dial && (
            <a href={dial} className="btn-ghost flex-1 px-4 py-3">
              <Phone className="size-4 text-accent" aria-hidden />
              Call
            </a>
          )}
          <Link href={`${base}/book`} className="btn flex-1 px-4 py-3">
            {book}
          </Link>
        </div>
      </div>
    </>
  );
}
