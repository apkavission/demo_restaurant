import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircleQuestion, Phone } from "lucide-react";
import { PageBand } from "@/components/site/ui";
import { getFaqs, getVariant } from "@/lib/variants";

type Props = { params: Promise<{ variant: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  return { title: variant ? "Questions" : "Not found" };
}

/**
 * The questions people ring to ask.
 *
 * ---------------------------------------------------------------------------
 * **Written as answers, not as marketing.** "Do you take walk-ins?" answered
 * with "we always try to accommodate our guests" is not an answer; "rarely —
 * twelve tables, one sitting, so almost everything is booked. Ring after six
 * and we will tell you honestly" is. The second one is also the one that gets
 * somebody to ring.
 *
 * Plain `<details>` rather than a JavaScript accordion: it opens without
 * hydration, the browser's own find-in-page searches it, and a screen reader
 * announces it correctly with no work.
 *
 * ---------------------------------------------------------------------------
 * **The panel beside it is the point of the page.** Somebody reading a
 * questions page has not found their question yet, and the commonest ending to
 * that is a closed tab. It stays with them as they scroll and offers the two
 * things that answer an unlisted question: the telephone and a message.
 */
export default async function QuestionsPage({ params }: Props) {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);
  if (!variant) notFound();

  const faqs = await getFaqs(variant.id);
  /* This page's own title and opening line, from the business. */
  const page = variant.copy.pages.questions;
  const base = `/${variant.slug}`;
  const phone = variant.contact.phone;
  const dial = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  return (
    <>
      <PageBand
        eyebrow={variant.industryLabel}
        heading={page.heading}
        intro={page.intro}
        facts={faqs.length > 0 ? [{ label: "Answered here", value: String(faqs.length) }] : undefined}
      />

      <div className="container-page py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          {faqs.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
              Nothing here yet.
            </p>
          ) : (
            <div className="divide-y divide-border border-y border-border" data-reveal>
              {faqs.map((faq, index) => (
                <details key={faq.id} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-baseline gap-4 font-medium">
                    <span className="index-num text-xs">{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{faq.question}</span>
                    <span
                      aria-hidden
                      className="shrink-0 self-center text-2xl leading-none text-muted transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>

                  <p className="measure mt-3 pl-9 leading-relaxed text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}

          <aside className="lg:sticky lg:top-24 lg:self-start" data-reveal="lift">
            <div className="tile p-7">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_22%,transparent)]">
                <MessageCircleQuestion className="size-5" aria-hidden />
              </span>

              <h2 className="font-display mt-4 text-xl font-semibold">
                Not the question you had?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Ring and ask — allergies, a table for fourteen, a birthday. It is answered by
                whoever is on the pass.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                {dial && (
                  <a href={dial} className="btn">
                    <Phone className="size-4" aria-hidden />
                    {phone}
                  </a>
                )}

                <Link href={`${base}/contact`} className="btn-ghost group">
                  Send a message
                  <ArrowRight className="arrow size-4" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
