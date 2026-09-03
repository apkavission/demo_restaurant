import type { Metadata } from "next";
import Link from "next/link";
import { getFaqsForAdmin } from "@/lib/admin-content";
import { AddNew, FaqEditor } from "@/components/admin/content-editors";
import { requireAdmin } from "@/lib/auth";
import { listVariants } from "@/lib/variants";
import { BusinessPicker } from "@/components/admin/business-picker";

export const metadata: Metadata = { title: "Questions" };

type Props = { searchParams: Promise<{ variant?: string }> };

export default async function Page({ searchParams }: Props) {
  await requireAdmin();

  const { variant: wanted } = await searchParams;
  const variants = await listVariants();
  const variant = variants.find((entry) => entry.slug === wanted) ?? variants[0];

  if (!variant) {
    return (
      <div className="container-page py-10">
        <p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">
          There are no businesses yet.
        </p>
      </div>
    );
  }

  const faqs = await getFaqsForAdmin(variant.id);

  return (
    <div className="container-page py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Questions</h1>
        <p className="measure mt-2 text-muted">The things people ask before they get in touch. Answering them here is the cheapest support there is.</p>
      </header>

      <BusinessPicker
        basePath="/admin/questions"
        variants={variants.map((entry) => ({ slug: entry.slug, name: entry.name }))}
        current={variant.slug}
      />

      <p className="mt-4 text-sm text-muted">
        Editing <strong className="font-semibold text-text">{variant.businessName}</strong>.{" "}
        <Link href={`/${variant.slug}`} target="_blank" className="text-accent hover:underline">
          Open the site
        </Link>
      </p>

      <div className="mt-8 space-y-4">
        {faqs.map((faq) => (
          <FaqEditor key={faq.id} variantId={variant.id} faq={faq} />
        ))}
      </div>

      {faqs.length === 0 && (
        <p className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border p-8 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      )}

      <div className="mt-6">
        <AddNew label="Add a question">
          <FaqEditor variantId={variant.id} />
        </AddNew>
      </div>
    </div>
  );
}
