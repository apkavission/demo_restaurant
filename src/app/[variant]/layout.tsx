import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteNav, ThemeToggle, VariantSwitcher } from "@/components/site/chrome";
import { themeCss } from "@/lib/theme";
import { getNav, getVariant, listVariants } from "@/lib/variants";
import { SiteLogo } from "@/components/site/site-logo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ variant: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { variant: slug } = await params;
  const variant = await getVariant(slug);

  if (!variant) return { title: "Not found" };

  /*
    Every one of these falls back rather than being required.

    A business set up this afternoon has a business name and usually a tagline,
    and nothing else. It must still produce a full, sensible `<title>` and a
    real share card — a demo that renders a blank title because nobody reached
    the SEO screen is worse than one with no SEO screen at all.
  */
  const title = variant.metaTitle?.trim() || `${variant.businessName} — ${variant.tagline ?? variant.industryLabel}`;

  const description =
    variant.metaDescription?.trim() || variant.description || variant.tagline || undefined;

  return {
    title: {
      default: title,
      /* The template keeps the name on every inner page, whatever the owner
         wrote for the front one. */
      template: `%s — ${variant.businessName}`,
    },
    description,

    openGraph: {
      title,
      description,
      siteName: variant.businessName,
      type: "website",
      images: variant.ogImage ? [{ url: variant.ogImage, width: 1200, height: 630 }] : undefined,
    },

    twitter: {
      card: variant.ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: variant.ogImage ? [variant.ogImage] : undefined,
    },

    /*
      Never indexed, whatever the visibility says.

      `link_only` and `public` decide who may open a page that is handed to
      them. Neither is an invitation to a crawler: these are demonstrations
      carrying a prospect's name, and a demo that outranks the business it was
      built for is a problem that takes months to undo. The fields above are
      not wasted by this — they are the browser tab, the WhatsApp card, the
      LinkedIn preview, and they are the exact fields the real site inherits
      on the day one of these becomes it.
    */
    robots: { index: false, follow: false, nocache: true },
  };
}

/**
 * One business, wrapped around every page of it.
 *
 * ---------------------------------------------------------------------------
 * **The palette arrives as a stylesheet, not as inline styles.**
 *
 * A `<style>` block scoped to `:root` reaches everything, including anything
 * rendered at the end of `<body>` — a dialog, a dropdown, a toast. Inline
 * variables on a wrapper `<div>` would not, and the first symptom is a menu
 * opening in the previous variant's colours, which is the kind of bug that gets
 * noticed in front of a client.
 *
 * **The demo banner is always there and says what this is.** A prospect looking
 * at Smile Care Dental Studio should never be in any doubt that they are
 * looking at a demonstration built by Apka Vission — with invented doctors and
 * invented prices. Removing that line to make the demo more convincing would be
 * the wrong kind of convincing.
 */
export default async function VariantLayout({ children, params }: Props) {
  const { variant: slug } = await params;

  const [variant, variants] = await Promise.all([getVariant(slug), listVariants()]);
  if (!variant) notFound();

  const nav = await getNav(variant.id);
  const base = `/${variant.slug}`;
  const contact = variant.contact;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss(variant.theme) }} />

      <div className="flex min-h-dvh flex-col">
        {/* ------------------------------------------------------------- */}
        <div className="border-b border-border bg-accent-soft">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2 text-xs">
            <p className="text-muted">
              <span className="font-semibold text-text">Demonstration site.</span>{" "}
              Built by Apka Vission. Every name, price and person here is invented.
            </p>

            <VariantSwitcher
              current={variant}
              variants={variants.map((entry) => ({
                slug: entry.slug,
                name: entry.name,
                industryLabel: entry.industryLabel,
              }))}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        <header className="relative border-b border-border bg-surface">
          <div className="container-page flex h-16 items-center gap-4">
            <Link href={base} className="tracking-tight">
              <SiteLogo variant={variant} />
            </Link>

            <div className="ml-auto flex items-center gap-2">
              <SiteNav
                base={base}
                items={nav.map((item) => ({ label: item.label, href: item.href }))}
                cta={{ label: variant.features.bookingLabel ?? "Book now", href: "/book" }}
              />
              <ThemeToggle allowed={variant.allowModeToggle} />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        {/* ------------------------------------------------------------- */}
        <footer className="mt-20 border-t border-border bg-surface">
          <div className="container-page grid gap-10 py-14 md:grid-cols-3">
            <div>
              <p className="font-display text-lg font-semibold">{variant.businessName}</p>
              {variant.tagline && <p className="measure mt-2 text-sm text-muted">{variant.tagline}</p>}
            </div>

            <div className="space-y-3 text-sm">
              {contact.phone && (
                <p className="flex items-center gap-2.5">
                  <Phone className="size-4 shrink-0 text-accent" aria-hidden />
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:underline">
                    {contact.phone}
                  </a>
                </p>
              )}
              {contact.email && (
                <p className="flex items-center gap-2.5">
                  <Mail className="size-4 shrink-0 text-accent" aria-hidden />
                  <a href={`mailto:${contact.email}`} className="hover:underline">
                    {contact.email}
                  </a>
                </p>
              )}
              {contact.address && (
                <p className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  {contact.address}
                </p>
              )}
            </div>

            {contact.hours && (
              <div className="text-sm">
                <p className="font-medium">Opening hours</p>
                <dl className="mt-3 space-y-1.5 text-muted">
                  {contact.hours.weekdays && (
                    <div className="flex justify-between gap-4">
                      <dt>Monday to Friday</dt>
                      <dd className="text-text">{contact.hours.weekdays}</dd>
                    </div>
                  )}
                  {contact.hours.saturday && (
                    <div className="flex justify-between gap-4">
                      <dt>Saturday</dt>
                      <dd className="text-text">{contact.hours.saturday}</dd>
                    </div>
                  )}
                  {contact.hours.sunday && (
                    <div className="flex justify-between gap-4">
                      <dt>Sunday</dt>
                      <dd className="text-text">{contact.hours.sunday}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          <div className="border-t border-border">
            <p className="container-page py-5 text-xs text-muted">
              A demonstration built by Apka Saathi Private Limited. Not a real
              business, and nothing here is medical advice.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
