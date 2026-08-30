import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { MessageForm } from "@/components/site/forms";
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
 * **The phone number is a link and it is first.** Most people arriving on a
 * clinic's contact page want to ring, on a phone, now — and a number they have
 * to select and copy is a number they do not ring. The form is for the ones who
 * are looking outside opening hours.
 *
 * The map is an embed with no API key: an `<iframe>` pointed at a search query.
 * A keyed maps integration on a demonstration site is a bill and an account for
 * something nobody clicks.
 */
export default async function ContactPage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const contact = variant.contact;

  return (
    <div className="container-page py-14 md:py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Contact</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Ring during opening hours and somebody who can answer picks up. Outside
            them, write and we will come back to you.
          </p>

          <ul className="mt-10 space-y-5">
            {contact.phone && (
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Phone className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm text-muted">Phone</span>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {contact.phone}
                  </a>
                </span>
              </li>
            )}

            {contact.whatsapp && (
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <MessageCircle className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm text-muted">WhatsApp</span>
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-medium hover:underline"
                  >
                    Send a message
                  </a>
                </span>
              </li>
            )}

            {contact.email && (
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Mail className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm text-muted">Email</span>
                  <a href={`mailto:${contact.email}`} className="text-lg font-medium hover:underline">
                    {contact.email}
                  </a>
                </span>
              </li>
            )}

            {contact.address && (
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <MapPin className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm text-muted">Where we are</span>
                  <span className="text-lg font-medium">{contact.address}</span>
                </span>
              </li>
            )}

            {contact.hours && (
              <li className="flex items-start gap-4">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Clock className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm text-muted">Opening hours</span>
                  <span className="text-lg font-medium">
                    {contact.hours.weekdays}
                    {contact.hours.saturday && `, Saturday ${contact.hours.saturday}`}
                  </span>
                  {contact.hours.sunday && (
                    <span className="block text-sm text-muted">
                      Sunday: {contact.hours.sunday}
                    </span>
                  )}
                </span>
              </li>
            )}
          </ul>

          {contact.mapQuery && (
            <div className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-border">
              <iframe
                title={`Map showing ${variant.businessName}`}
                loading="lazy"
                className="h-64 w-full"
                src={`https://www.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
              />
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-7 shadow-[var(--shadow-1)]">
          <h2 className="font-display text-2xl font-semibold">Write to us</h2>
          <p className="mt-2 text-sm text-muted">
            This is a demonstration — the message really is recorded and appears in
            the clinic&rsquo;s panel, but nobody will reply.
          </p>

          <div className="mt-6">
            <MessageForm variant={variant.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
