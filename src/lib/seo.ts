/**
 * What a search engine is told about a business, in its own language.
 *
 * ---------------------------------------------------------------------------
 * **The owner asked for it.** *"seo and marketing like site hona chaiye … ye
 * bahut zarriru h."* The meta title, the description and the share card were
 * already here and already editable. What was missing is the part an SEO
 * person actually looks for: structured data — the block that tells Google
 * this is a clinic, where it is, what it costs and what it answers.
 *
 * ---------------------------------------------------------------------------
 * **Every field is derived from something, and nothing is invented.** That is
 * the whole discipline of this file, because structured data is the one place
 * where a guess is not a cosmetic error — it is a claim made to a search
 * engine, in machine-readable form, by the business.
 *
 * So there are two things this deliberately does **not** emit:
 *
 *   **No `aggregateRating`.** These demos carry reviews that are labelled, on
 *   the page, as examples written for a demonstration. Turning three invented
 *   quotes into "4.7 from 3 reviews" would put a fabricated trust signal into
 *   a search result. It is also the single most common piece of structured-data
 *   fraud, and Google has manual penalties for it.
 *
 *   **No `openingHoursSpecification`.** The hours are free text, written by
 *   whoever filled the panel in — "9:30 am – 8:00 pm", "Emergencies only",
 *   "Closed". Parsing that into machine times means guessing, and a wrong
 *   closing time in structured data sends somebody to a locked door. The hours
 *   are on the page, in words, where they are true.
 *
 * ---------------------------------------------------------------------------
 * **It stays `noindex` regardless**, and that is not a contradiction. A demo
 * that outranked the business it was built for would take months to undo. What
 * this is for is the day one of these becomes a real site: the same panel, the
 * same fields, the same block — with the one line in `layout.tsx` removed. And
 * it is what a prospect's own SEO person is shown when they ask what we do
 * about search.
 */
import type { FaqRow, OfferRow } from "@/types/database";
import type { Variant } from "@/lib/variants";

/**
 * What kind of thing this demo is, in schema.org's vocabulary.
 *
 * `Restaurant` covers all three: a tasting room, a bakery and a delivery
 * kitchen are all restaurants to schema.org, and `FoodEstablishment` is the
 * abstract parent rather than a thing to publish.
 *
 * Each demo in the estate sets its own, and the rule is the same one: the type
 * has to be true of every business inside that demo, not only the first.
 */
const BUSINESS_TYPE = "Restaurant";

/** Digits out of a price label, so "From ₹4,500" gives 4500. */
function amount(label: string | null): number | null {
  if (!label) return null;

  const digits = label.replace(/[^\d]/g, "");
  if (!digits) return null;

  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * The cheapest and dearest thing on the list, as a range.
 *
 * Read off the prices rather than typed, so it cannot disagree with the page.
 * Absent when nothing has a number on it — a `priceRange` of "₹0" is worse
 * than none.
 */
export function priceRange(services: OfferRow[]): string | null {
  const amounts = services
    .map((service) => amount(service.price_label))
    .filter((value): value is number => value !== null)
    .sort((first, second) => first - second);

  if (amounts.length === 0) return null;

  const low = amounts[0];
  const high = amounts[amounts.length - 1];
  const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  return low === high ? money(low) : `${money(low)} – ${money(high)}`;
}

/**
 * The business itself.
 *
 * `@id` is the page's own URL, which is what lets the other blocks on the page
 * point at this one rather than describing a second, unrelated business.
 */
export function businessJsonLd(
  variant: Variant,
  services: OfferRow[],
  siteUrl: string,
): Record<string, unknown> {
  const url = `${siteUrl}/${variant.slug}`;
  const { phone, email, address } = variant.contact;
  const range = priceRange(services);

  const offers = services
    .filter((service) => service.status === "published")
    .map((service) => {
      const price = amount(service.price_label);

      return {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
          ...(service.summary ? { description: service.summary } : {}),
        },
        ...(price
          ? {
              price,
              priceCurrency: "INR",
              /*
                Said out loud, because it is the truth of the label: "From
                ₹4,500" is a floor, not a price. `PriceSpecification` with
                `minPrice` is how that is expressed without pretending the
                number is final.
              */
              ...(/from|starting/i.test(service.price_label ?? "")
                ? {
                    priceSpecification: {
                      "@type": "PriceSpecification",
                      minPrice: price,
                      priceCurrency: "INR",
                    },
                  }
                : {}),
            }
          : {}),
      };
    });

  return {
    "@context": "https://schema.org",
    "@type": BUSINESS_TYPE,
    "@id": url,
    name: variant.businessName,
    url,
    ...(variant.tagline ? { slogan: variant.tagline } : {}),
    ...(variant.description ? { description: variant.description } : {}),
    ...(variant.logo.light ? { logo: variant.logo.light } : {}),
    ...(variant.hero.image ? { image: variant.hero.image } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    /* Text rather than a `PostalAddress` split into parts: the panel holds one
       free-text address, and inventing a postcode field out of it is the kind
       of guess this file exists to avoid. */
    ...(address ? { address } : {}),
    ...(range ? { priceRange: range } : {}),
    ...(offers.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Treatments",
            itemListElement: offers,
          },
        }
      : {}),
  };
}

/**
 * The questions, as a `FAQPage`.
 *
 * Verbatim, both sides. This is the one block on the page that is quoted back
 * into a search result almost word for word, so anything editorialised here
 * would be a different answer from the one on the page.
 */
export function faqJsonLd(faqs: FaqRow[]): Record<string, unknown> | null {
  const published = faqs.filter((faq) => faq.status === "published");
  if (published.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: published.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * The people, as a list.
 *
 * `worksFor` points back at the business's `@id`, so a crawler reads three
 * people at one practice rather than three unattached names.
 */
export function peopleJsonLd(
  people: { full_name: string; role_label: string | null; qualification: string | null }[],
  businessId: string,
): Record<string, unknown> | null {
  if (people.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: people.map((person, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: person.full_name,
        ...(person.role_label ? { jobTitle: person.role_label } : {}),
        ...(person.qualification ? { hasCredential: person.qualification } : {}),
        worksFor: { "@id": businessId },
      },
    })),
  };
}

/**
 * The blocks, as one script tag's worth of JSON.
 *
 * One `@graph` rather than three separate tags: it is the same page describing
 * one business, and three disconnected blocks is how a crawler ends up with
 * three ideas of what this page is.
 */
export function structuredData(blocks: (Record<string, unknown> | null)[]): string {
  const kept = blocks.filter((block): block is Record<string, unknown> => block !== null);

  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": kept.map(({ "@context": _context, ...rest }) => rest),
  });
}
