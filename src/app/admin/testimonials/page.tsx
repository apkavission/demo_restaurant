import type { Metadata } from "next";
import Link from "next/link";
import { getTestimonialsForAdmin } from "@/lib/admin-content";
import { AddNew, TestimonialEditor } from "@/components/admin/content-editors";
import { requireAdmin } from "@/lib/auth";
import { listVariants } from "@/lib/variants";
import { BusinessPicker } from "@/components/admin/business-picker";

export const metadata: Metadata = { title: "Testimonials" };

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

  const testimonials = await getTestimonialsForAdmin(variant.id);

  return (
    <div className="container-page py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Testimonials</h1>
        <p className="measure mt-2 text-muted">What customers have said. A draft is kept here and shown to nobody until it is published.</p>
      </header>

      <BusinessPicker
        basePath="/admin/testimonials"
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
        {testimonials.map((testimonial) => (
          <TestimonialEditor key={testimonial.id} variantId={variant.id} testimonial={testimonial} />
        ))}
      </div>

      {testimonials.length === 0 && (
        <p className="mt-8 rounded-[var(--radius-card)] border border-dashed border-border p-8 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      )}

      <div className="mt-6">
        <AddNew label="Add a testimonial">
          <TestimonialEditor variantId={variant.id} />
        </AddNew>
      </div>
    </div>
  );
}
