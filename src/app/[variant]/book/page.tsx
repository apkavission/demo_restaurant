import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import { EnquiryForm } from "@/components/site/forms";
import { PageBand } from "@/components/site/ui";
import { getOffers, getPeople, getVariant } from "@/lib/variants";

type Props = {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ offer?: string; person?: string; dish?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? (variant.features.bookingLabel ?? "Book") : "Not found" };
}

/**
 * The page the whole site exists to reach.
 *
 * ---------------------------------------------------------------------------
 * **What was clicked arrives preselected.** Somebody who came from a dish on
 * the menu has already chosen; making them choose again is the commonest way a
 * form loses the person who was ready. `?dish=` is accepted as well as
 * `?offer=`, because the menu page speaks the trade's word and the form speaks
 * the schema's.
 *
 * **What happens next is numbered.** A booking form with no account of what
 * follows it is a form somebody fills in and then wonders about — three steps
 * in the margin cost four lines of markup and remove the reason to hesitate
 * over the button.
 */
export default async function BookPage({ params, searchParams }: Props) {
  const { variant: slug } = await params;
  const preselect = await searchParams;

  const variant = await getVariant(slug);
  if (!variant) notFound();

  const [offers, people] = await Promise.all([getOffers(variant.id), getPeople(variant.id)]);

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

  /* This page's own title and opening line, from the business. */
  const page = variant.copy.pages.book;

  const cta = variant.features.bookingLabel ?? "Book a table";
  const phone = variant.contact.phone;
  const dial = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  /* What happens after the button, in the order it happens. */
  const steps = [
    "You send this. It reaches the restaurant straight away.",
    "Somebody rings to confirm the time and the number of covers.",
    "The table goes in the book, and the kitchen is told about any allergies.",
  ];

  return (
    <>
      <PageBand
        eyebrow={variant.industryLabel}
        heading={page.heading || cta}
        intro={page.intro}
        facts={[
          offers.length > 0 ? { label: "On the menu", value: String(offers.length) } : null,
          people.length > 0 ? { label: "In the kitchen", value: String(people.length) } : null,
        ].filter(Boolean) as { label: string; value: string }[]}
      >
        {dial && (
          <a href={dial} className="btn-ghost">
            <Phone className="size-4 text-accent" aria-hidden />
            Rather ring? {phone}
          </a>
        )}
      </PageBand>

      <div className="container-page py-14 md:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <div className="tile p-7 md:p-8" data-reveal="lift">
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
              preselect={{ offer: preselect.offer ?? preselect.dish, person: preselect.person }}
              cta={cta}
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="tile p-7" data-reveal="lift">
              <p className="micro" style={{ "--micro-rule": "1.25rem" } as React.CSSProperties}>
                What happens next
              </p>

              <ol className="mt-5 space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3.5">
                    <span className="step-num" aria-hidden>
                      {index + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-muted">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {[
              {
                icon: ShieldCheck,
                title: "This is a demonstration",
                body: "The form works and your request really is recorded — it appears in this business's panel straight away. Nobody will actually contact you, because this restaurant is invented.",
              },
              {
                icon: Phone,
                title: "How it would work live",
                body: "On a real site this lands with the front of house, who ring back the same day and confirm.",
              },
              variant.contact.hours?.weekdays
                ? {
                    icon: Clock,
                    title: "When the room sits",
                    body: `Weekdays ${variant.contact.hours.weekdays}${
                      variant.contact.hours.saturday
                        ? `, Saturday ${variant.contact.hours.saturday}`
                        : ""
                    }.`,
                  }
                : null,
            ]
              .filter(Boolean)
              .map((card, index) => {
                const entry = card as { icon: typeof Clock; title: string; body: string };
                const Icon = entry.icon;

                return (
                  <div
                    key={entry.title}
                    data-reveal="lift"
                    className="rounded-[var(--radius-card)] border border-border bg-surface-2 p-6"
                    style={{ "--i": index } as React.CSSProperties}
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
    </>
  );
}
