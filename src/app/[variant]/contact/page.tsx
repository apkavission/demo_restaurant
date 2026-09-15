import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { MessageForm } from "@/components/site/forms";
import { PageBand } from "@/components/site/ui";
import { getVariant } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? "Contact" : "Not found" };
}

/**
 * How to reach them, and a way to write in.
 *
 * ---------------------------------------------------------------------------
 * **The telephone is first and it is a link.** A restaurant is booked by
 * somebody standing on a street deciding where to eat in the next hour, on a
 * phone, and a number they have to select and copy is a number they do not
 * ring. The form is for the ones writing at midnight about a birthday.
 *
 * The map is an embed with no API key: an `<iframe>` pointed at a search query.
 * A keyed maps integration on a demonstration site is a bill and an account for
 * something nobody clicks.
 */
export default async function ContactPage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  /* This page's own title and opening line, from the business. */
  const page = variant.copy.pages.contact;

  const contact = variant.contact;
  const dial = contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : null;

  /*
    Every way of reaching them, as rows this page can lay out on its own. Built
    as data rather than five hand-written blocks: what a business has filled in
    decides how many rows there are, and one with nothing behind it is left out
    rather than printed empty.
  */
  const ways = [
    contact.phone && {
      key: "phone",
      icon: Phone,
      label: "Telephone",
      value: contact.phone,
      href: dial ?? undefined,
      note: "The fastest way, and the only one for tonight.",
    },
    contact.whatsapp && {
      key: "whatsapp",
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Send a message",
      href: `https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`,
      note: "Answered between services.",
    },
    contact.email && {
      key: "email",
      icon: Mail,
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
      note: "For a party, a private room or an invoice.",
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof Phone;
    label: string;
    value: string;
    href?: string;
    note: string;
  }[];

  return (
    <>
      <PageBand
        eyebrow={variant.industryLabel}
        heading={page.heading}
        intro={page.intro}
      >
        {dial && (
          <a href={dial} className="btn">
            <Phone className="size-4" aria-hidden />
            {contact.phone}
          </a>
        )}

        {contact.whatsapp && (
          <a
            href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost group"
          >
            WhatsApp
            <ArrowRight className="arrow size-4" aria-hidden />
          </a>
        )}
      </PageBand>

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div>
            {/* One card per row rather than a two-column grid: an email address
                in a narrow card wraps in the middle of the domain, which reads
                as a typographic fault rather than as an address. */}
            {ways.length > 0 && (
              <ul className="grid gap-4">
                {ways.map((way, index) => {
                  const Icon = way.icon;

                  return (
                    <li
                      key={way.key}
                      data-reveal="lift"
                      className="tile spot flex items-start gap-4 p-6"
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_22%,transparent)]">
                        <Icon className="size-4" aria-hidden />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className="micro"
                          style={{ "--micro-rule": "1.25rem" } as React.CSSProperties}
                        >
                          {way.label}
                        </span>

                        {way.href ? (
                          <a
                            href={way.href}
                            className="font-display mt-1.5 block text-lg font-semibold [overflow-wrap:anywhere] hover:text-accent"
                          >
                            {way.value}
                          </a>
                        ) : (
                          <span className="font-display mt-1.5 block text-lg font-semibold">
                            {way.value}
                          </span>
                        )}

                        <span className="mt-1 block text-sm text-muted">{way.note}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {(contact.address || contact.hours) && (
              <div className="tile mt-4 grid gap-6 p-6 sm:grid-cols-2" data-reveal="lift">
                {contact.address && (
                  <div>
                    <p className="micro" style={{ "--micro-rule": "1.25rem" } as React.CSSProperties}>
                      <MapPin className="size-3.5 text-accent" aria-hidden />
                      Where we are
                    </p>
                    <p className="mt-3 leading-relaxed">{contact.address}</p>
                  </div>
                )}

                {contact.hours && (
                  <div>
                    <p className="micro" style={{ "--micro-rule": "1.25rem" } as React.CSSProperties}>
                      <Clock className="size-3.5 text-accent" aria-hidden />
                      When the room sits
                    </p>

                    <dl className="mt-3 space-y-2 text-sm">
                      {contact.hours.weekdays && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">Monday to Friday</dt>
                          <dd className="tabular-nums">{contact.hours.weekdays}</dd>
                        </div>
                      )}
                      {contact.hours.saturday && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">Saturday</dt>
                          <dd className="tabular-nums">{contact.hours.saturday}</dd>
                        </div>
                      )}
                      {contact.hours.sunday && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">Sunday</dt>
                          <dd className="tabular-nums">{contact.hours.sunday}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            )}

            {contact.mapQuery && (
              <div
                className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-border"
                data-reveal="lift"
              >
                <iframe
                  title={`Map showing ${variant.businessName}`}
                  loading="lazy"
                  className="h-72 w-full"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
                />
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" data-reveal="lift">
            <div className="tile p-7">
              <h2 className="font-display text-2xl font-semibold">Write to us</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                This is a demonstration — the message really is recorded and appears in this
                restaurant&rsquo;s panel, but nobody will reply.
              </p>

              <div className="mt-6">
                <MessageForm variant={variant.slug} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
