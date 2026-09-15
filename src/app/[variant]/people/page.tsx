import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Spotlight } from "@/components/site/motion";
import { Chip, Monogram, PageBand } from "@/components/site/ui";
import { getPeople, getVariant } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? "Our team" : "Not found" };
}

/**
 * The people, and what each of them actually does.
 *
 * ---------------------------------------------------------------------------
 * **A restaurant is its people, and almost no restaurant website says who they
 * are.** A page of stock aprons is worth nothing; a head chef with a name, the
 * kitchens they trained in and a line about how they write the menu is the
 * reason somebody books this room rather than the one next door.
 *
 * The card is the estate's — monogram, chips, the light under the cursor — and
 * what it carries is the trade's: the pass, the section, the years.
 */
export default async function PeoplePage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const people = await getPeople(variant.id);
  /* This page's own title and opening line, from the business. */
  const page = variant.copy.pages.people;
  const base = `/${variant.slug}`;
  const book = variant.features.bookingLabel ?? "Book a table";

  const longest = people.reduce(
    (most, person) => Math.max(most, person.years_experience ?? 0),
    0,
  );

  const facts = [
    people.length > 0 ? { label: "The team", value: String(people.length) } : null,
    longest > 0 ? { label: "Longest serving", value: `${longest} years` } : null,
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
      </PageBand>

      <div className="container-page py-14 md:py-20">
        {people.length === 0 ? (
          <p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
            Nobody listed yet.
          </p>
        ) : (
          <Spotlight as="ul" className="grid items-start gap-5 md:grid-cols-2">
            {people.map((person, index) => (
              <li
                key={person.id}
                data-reveal="lift"
                className="tile spot underline-grow flex flex-col p-7"
                style={{ "--i": index % 2 } as React.CSSProperties}
              >
                <div className="flex items-start gap-4">
                  <Monogram name={person.full_name} className="size-14 text-lg" />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl font-semibold">{person.full_name}</h2>
                    {person.role_label && (
                      <p className="mt-0.5 font-medium text-accent">{person.role_label}</p>
                    )}

                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      {person.qualification && <Chip>{person.qualification}</Chip>}
                      {person.years_experience !== null && (
                        <span className="text-xs text-muted">
                          {person.years_experience} years in kitchens
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {person.bio && (
                  <p className="measure mt-5 flex-1 leading-relaxed text-muted">{person.bio}</p>
                )}

                <div className="mt-6 border-t border-border pt-4">
                  <Link
                    href={`${base}/book?person=${person.slug}`}
                    className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                  >
                    Book a table with {person.full_name.split(" ")[0]} cooking
                    <ArrowRight className="arrow size-4" aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </Spotlight>
        )}
      </div>
    </>
  );
}
