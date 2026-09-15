import { describe, expect, it } from "vitest";
import { businessJsonLd, faqJsonLd, peopleJsonLd, priceRange, structuredData } from "@/lib/seo";
import type { FaqRow, OfferRow } from "@/types/database";
import type { Variant } from "@/lib/variants";

/** Only the fields these functions read, which is the honest thing to fake. */
const variant = {
  slug: "dental",
  businessName: "Smile Care Dental Studio",
  tagline: "Dentistry that does not rush you",
  description: "A four-chair practice in Patna.",
  logo: { light: "https://example.test/logo.png", dark: null },
  hero: { image: "https://example.test/hero.jpg", imageAlt: "", video: null },
  contact: {
    phone: "+91 90000 11001",
    email: "hello@smilecare.example",
    address: "S.P. Verma Road, Patna 800001",
    hours: { weekdays: "9:30 am – 8:00 pm", sunday: "Emergencies only" },
  },
} as unknown as Variant;

const service = (over: Partial<OfferRow>) =>
  ({ status: "published", name: "A treatment", summary: null, price_label: null, ...over }) as OfferRow;

const SITE = "https://smilecare.example";

describe("priceRange", () => {
  it("is read off the prices rather than typed", () => {
    const range = priceRange([
      service({ price_label: "₹300" }),
      service({ price_label: "From ₹35,000" }),
      service({ price_label: "From ₹4,500" }),
    ]);

    expect(range).toBe("₹300 – ₹35,000");
  });

  it("collapses to one number when everything costs the same", () => {
    expect(priceRange([service({ price_label: "₹300" }), service({ price_label: "₹300" })])).toBe("₹300");
  });

  it("is absent rather than zero when nothing has a number", () => {
    /* A `priceRange` of "₹0" is a claim; none is the truth. */
    expect(priceRange([service({ price_label: "On assessment" }), service({})])).toBeNull();
  });
});

describe("businessJsonLd", () => {
  const json = businessJsonLd(
    variant,
    [service({ name: "Consultation", price_label: "₹300" }), service({ name: "Root canal", price_label: "From ₹4,500" })],
    SITE,
  );

  it("says what kind of thing this is, and identifies it by its own URL", () => {
    expect(json["@type"]).toBe("Restaurant");
    expect(json["@id"]).toBe("https://smilecare.example/dental");
    expect(json.url).toBe("https://smilecare.example/dental");
  });

  it("carries the details a local search result needs", () => {
    expect(json.name).toBe("Smile Care Dental Studio");
    expect(json.telephone).toBe("+91 90000 11001");
    expect(json.address).toBe("S.P. Verma Road, Patna 800001");
    expect(json.priceRange).toBe("₹300 – ₹4,500");
  });

  /*
    The two refusals, which are the point of the file.

    A fabricated rating is the commonest piece of structured-data fraud and
    carries a manual penalty; a guessed closing time sends somebody to a locked
    door. Both are asserted rather than trusted to a comment.
  */
  it("never invents a rating, because the reviews are labelled as examples", () => {
    expect(json).not.toHaveProperty("aggregateRating");
    expect(json).not.toHaveProperty("review");
    expect(JSON.stringify(json)).not.toMatch(/rating/i);
  });

  it("never turns free-text hours into machine times", () => {
    expect(json).not.toHaveProperty("openingHoursSpecification");
    expect(json).not.toHaveProperty("openingHours");
  });

  it("says that a 'from' price is a floor rather than a price", () => {
    const catalogue = json.hasOfferCatalog as { itemListElement: Record<string, unknown>[] };
    const rootCanal = catalogue.itemListElement.find(
      (offer) => (offer.itemOffered as { name: string }).name === "Root canal",
    );

    expect(rootCanal?.price).toBe(4500);
    expect(rootCanal?.priceSpecification).toEqual({
      "@type": "PriceSpecification",
      minPrice: 4500,
      priceCurrency: "INR",
    });
  });

  it("leaves a fixed price without a minimum, because it is not a floor", () => {
    const catalogue = json.hasOfferCatalog as { itemListElement: Record<string, unknown>[] };
    const consultation = catalogue.itemListElement.find(
      (offer) => (offer.itemOffered as { name: string }).name === "Consultation",
    );

    expect(consultation?.price).toBe(300);
    expect(consultation).not.toHaveProperty("priceSpecification");
  });

  it("leaves out what the business has not filled in", () => {
    const bare = businessJsonLd(
      { ...variant, contact: {}, tagline: null, description: null } as unknown as Variant,
      [],
      SITE,
    );

    expect(bare).not.toHaveProperty("telephone");
    expect(bare).not.toHaveProperty("address");
    expect(bare).not.toHaveProperty("priceRange");
    expect(bare).not.toHaveProperty("hasOfferCatalog");
    expect(bare.name).toBe("Smile Care Dental Studio");
  });

  it("offers only what is published", () => {
    const json = businessJsonLd(
      variant,
      [service({ name: "Draft", status: "draft", price_label: "₹99" }), service({ name: "Live", price_label: "₹100" })],
      SITE,
    );

    const catalogue = json.hasOfferCatalog as { itemListElement: Record<string, unknown>[] };
    expect(catalogue.itemListElement).toHaveLength(1);
    expect((catalogue.itemListElement[0].itemOffered as { name: string }).name).toBe("Live");
  });
});

describe("faqJsonLd", () => {
  const faq = (over: Partial<FaqRow>) =>
    ({ status: "published", question: "Will it hurt?", answer: "Not much.", ...over }) as FaqRow;

  it("quotes both sides verbatim", () => {
    const json = faqJsonLd([faq({})]) as { mainEntity: Record<string, unknown>[] };

    expect(json.mainEntity[0].name).toBe("Will it hurt?");
    expect((json.mainEntity[0].acceptedAnswer as { text: string }).text).toBe("Not much.");
  });

  it("leaves out a draft, so a search result cannot quote an unpublished answer", () => {
    const json = faqJsonLd([faq({ status: "draft" }), faq({ question: "Live?" })]) as {
      mainEntity: Record<string, unknown>[];
    };

    expect(json.mainEntity).toHaveLength(1);
    expect(json.mainEntity[0].name).toBe("Live?");
  });

  it("is absent rather than empty when there are no questions", () => {
    expect(faqJsonLd([])).toBeNull();
    expect(faqJsonLd([faq({ status: "draft" })])).toBeNull();
  });
});

describe("peopleJsonLd", () => {
  it("attaches every person to the one business", () => {
    const json = peopleJsonLd(
      [{ full_name: "Anita Rao", role_label: "Root canals", qualification: "BDS, MDS" }],
      "https://smilecare.example/dental",
    ) as { itemListElement: Record<string, unknown>[] };

    const person = json.itemListElement[0].item as Record<string, unknown>;
    expect(person.name).toBe("Anita Rao");
    expect(person.worksFor).toEqual({ "@id": "https://smilecare.example/dental" });
  });

  it("is absent when nobody is listed", () => {
    expect(peopleJsonLd([], "x")).toBeNull();
  });
});

describe("structuredData", () => {
  it("puts the blocks in one graph with one context", () => {
    /* Three separate script tags is how a crawler ends up with three ideas of
       what one page is. */
    const json = JSON.parse(
      structuredData([
        { "@context": "https://schema.org", "@type": "Restaurant", name: "A" },
        null,
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [] },
      ]),
    );

    expect(json["@context"]).toBe("https://schema.org");
    expect(json["@graph"]).toHaveLength(2);
    expect(json["@graph"][0]).not.toHaveProperty("@context");
    expect(json["@graph"][1]["@type"]).toBe("FAQPage");
  });

  it("is valid JSON even when every block is absent", () => {
    expect(JSON.parse(structuredData([null, null]))["@graph"]).toEqual([]);
  });
});
