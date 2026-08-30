import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
 * A list of names with job titles tells a visitor nothing. What they are trying
 * to work out is whether these are people who know their job — so each entry
 * says one concrete thing that person does, rather than three adjectives.
 */
export default async function PeoplePage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const people = await getPeople(variant.id);
  const base = `/${variant.slug}`;

  return (
    <div className="container-page py-14 md:py-20">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Our team
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          The people who cook it and serve it, and what each of them does.
        </p>
      </header>

      {people.length === 0 ? (
        <p className="mt-12 rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
          Nobody listed yet.
        </p>
      ) : (
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => (
            <li
              key={person.id}
              className="flex flex-col rounded-[var(--radius-card)] border border-border bg-surface p-7 shadow-[var(--shadow-1)]"
            >
              <h2 className="font-display text-xl font-semibold">{person.full_name}</h2>
              {person.role_label && (
                <p className="mt-1 font-medium text-accent">{person.role_label}</p>
              )}
              {person.qualification && (
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted">
                  {person.qualification}
                </p>
              )}

              {person.bio && (
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">{person.bio}</p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                {person.years_experience !== null && (
                  <span className="text-muted">{person.years_experience} years</span>
                )}
                <Link
                  href={`${base}/book?person=${person.slug}`}
                  className="font-semibold text-accent hover:underline"
                >
                  Book a table
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
