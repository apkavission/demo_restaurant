import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import { EnquiryForm } from "@/components/site/forms";
import { getOffers, getPeople, getVariant } from "@/lib/variants";

type Props = {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ offer?: string; person?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? (variant.features.bookingLabel ?? "Book a table") : "Not found" };
}

/**
 * The page the whole site exists to reach.
 *
 * **What was clicked arrives preselected.** Somebody who came from a card has
 * already chosen; making them choose again is the commonest way a form loses the
 * person who was ready.
 *
 * The three notes beside it answer the three things people wonder at this exact
 * moment: is this real, will somebody come back to me, and does it cost anything
 * to ask.
 */
export default async function BookPage({ params, searchParams }: Props) {
  const { variant: slug } = await params;
  const preselect = await searchParams;

  const variant = await getVariant(slug);
  if (!variant) notFound();

  const [offers, people] = await Promise.all([
    getOffers(variant.id),
    getPeople(variant.id),
  ]);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );

  const cta = variant.features.bookingLabel ?? "Book a table";

  return (
    <div className="container-page py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{cta}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Tell us when and how many, and we will confirm by phone. Nothing is charged to hold a table.
          </p>

          <div className="mt-10 rounded-[var(--radius-card)] border border-border bg-surface p-7 shadow-[var(--shadow-1)]">
            <EnquiryForm
              variant={variant.slug}
              offers={offers.map((offer) => ({
                slug: offer.slug,
                name: offer.name,
                price_label: offer.price_label,
              }))}
              people={people.map((person) => ({
                slug: person.slug,
                full_name: person.full_name,
                role_label: person.role_label,
              }))}
              today={today}
              preselect={{ offer: preselect.offer, person: preselect.person }}
              cta={cta}
            />
          </div>
        </div>

        <aside className="space-y-4">
          {[
            {
              icon: ShieldCheck,
              title: "This is a demonstration",
              body: "The form works and your request really is recorded — it appears in this business's panel straight away. Nobody will actually contact you, because this business is invented.",
            },
            {
              icon: Phone,
              title: "How it would work live",
              body: "On a real site this lands with the team, who come back to you the same day and confirm.",
            },
            variant.contact.hours?.weekdays
              ? {
                  icon: Clock,
                  title: "Opening hours",
                  body: `Weekdays ${variant.contact.hours.weekdays}${
                    variant.contact.hours.saturday
                      ? `, Saturday ${variant.contact.hours.saturday}`
                      : ""
                  }.`,
                }
              : null,
          ]
            .filter(Boolean)
            .map((card) => {
              const entry = card as { icon: typeof Clock; title: string; body: string };
              const Icon = entry.icon;

              return (
                <div
                  key={entry.title}
                  className="rounded-[var(--radius-card)] border border-border bg-surface-2 p-6"
                >
                  <Icon className="size-5 text-accent" aria-hidden />
                  <p className="mt-3 font-medium">{entry.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{entry.body}</p>
                </div>
              );
            })}
        </aside>
      </div>
    </div>
  );
}
