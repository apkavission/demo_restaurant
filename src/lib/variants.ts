import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { readTheme } from "@/lib/theme";
import type {
  PersonRow,
  FaqRow,
  NavItemRow,
  OfferRow,
  TestimonialRow,
  VariantContact,
  VariantFeatures,
  VariantRow,
  VariantTheme,
} from "@/types/database";

/**
 * Loading a variant, which is loading a whole business.
 *
 * Every public page starts here: the variant decides the name in the header, the
 * colours, the navigation, the phone number in the footer and every row of
 * content on the page. Get the variant and everything else follows; fail to get
 * it and there is no page to draw.
 *
 * **Wrapped in `cache()`** so the layout and the page inside it share one query
 * per request. Without it every segment of a route asks the database for the
 * same row, which is three round trips to render one screen — and it is
 * invisible in development, where the database is fast and nobody is watching.
 */

export interface Variant {
  id: string;
  slug: string;
  name: string;
  industryLabel: string;
  businessName: string;
  tagline: string | null;
  description: string | null;
  theme: VariantTheme;
  contact: VariantContact;
  features: VariantFeatures;
  defaultMode: "light" | "dark";
  allowModeToggle: boolean;
  visibility: "public" | "link_only";
}

function shape(row: VariantRow): Variant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    industryLabel: row.industry_label,
    businessName: row.business_name,
    tagline: row.tagline,
    description: row.description,
    theme: readTheme(row.theme),
    contact: (row.contact ?? {}) as VariantContact,
    features: (row.features ?? {}) as VariantFeatures,
    defaultMode: row.default_mode === "dark" ? "dark" : "light",
    allowModeToggle: row.allow_mode_toggle,
    visibility: row.visibility === "link_only" ? "link_only" : "public",
  };
}

/** Every variant that is switched on, in the order the switcher shows them. */
export const listVariants = cache(async (): Promise<Variant[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("variants")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("[variants] list failed:", error.message);
    return [];
  }

  return (data ?? []).map(shape);
});

/** One variant by its slug, or nothing. */
export const getVariant = cache(async (slug: string): Promise<Variant | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("variants")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) console.error("[variants] load failed:", error.message);

  return data ? shape(data) : null;
});

/**
 * Where the bare `/` goes.
 *
 * The row marked default, and a unique index guarantees there is at most one —
 * so this cannot become "whichever came back first", which is a home page that
 * changes when somebody edits an unrelated field.
 */
export const getDefaultVariant = cache(async (): Promise<Variant | null> => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("variants")
    .select("*")
    .eq("is_active", true)
    .eq("is_default", true)
    .maybeSingle();

  if (data) return shape(data);

  // No default set. The first active one is better than a broken address, and
  // the admin says so where it can be fixed.
  const [first] = await listVariants();
  return first ?? null;
});

/* -------------------------------------------------------------------------- */
/* The content of one variant                                                  */
/* -------------------------------------------------------------------------- */

export const getNav = cache(async (variantId: string): Promise<NavItemRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("nav_items")
    .select("*")
    .eq("variant_id", variantId)
    .eq("is_active", true)
    .order("sort_order");

  if (error) console.error("[variants] nav failed:", error.message);
  return data ?? [];
});

export const getOffers = cache(async (variantId: string): Promise<OfferRow[]> => {
  const supabase = await createClient();

  /*
    No `status` filter here, and that is deliberate rather than an omission: the
    policy on this table returns published rows to the public and everything to
    an admin. A filter in this function would be a second answer to the same
    question — and the one that gets forgotten when a new screen is written.
  */
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] offers failed:", error.message);
  return data ?? [];
});

export const getPeople = cache(async (variantId: string): Promise<PersonRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team")
    .select("*")
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] people failed:", error.message);
  return data ?? [];
});

export const getTestimonials = cache(async (variantId: string): Promise<TestimonialRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] testimonials failed:", error.message);
  return data ?? [];
});

export const getFaqs = cache(async (variantId: string): Promise<FaqRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faqs")
    .select("*")
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] faqs failed:", error.message);
  return data ?? [];
});
