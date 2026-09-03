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

  /**
   * The mark, as the header needs it.
   *
   * Two files rather than one: a logo drawn for a white page disappears on a
   * dark one, and these sites have a theme toggle. Null on either falls back to
   * setting the name as type, which is always available and never broken.
   */
  logo: { light: string | null; dark: string | null };

  /**
   * Whether the mark already contains the name.
   *
   * A lockup with the name printed beside it again is the commonest way a site
   * with a perfectly good logo looks amateur.
   */
  logoShowsName: boolean;

  /**
   * The picture a messaging app shows when the link is pasted.
   *
   * A link with no card is a grey rectangle in a WhatsApp thread, and a demo
   * sent to a prospect is almost always pasted into one before it is opened.
   */
  ogImage: string | null;

  metaTitle: string | null;
  metaDescription: string | null;
}

/**
 * Where a stored file is served from.
 *
 * Composed rather than stored, so moving the bucket is one change in one place.
 */
const BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/demo-media`;

function fileUrl(key: string | null | undefined): string | null {
  return key ? `${BUCKET_URL}/${key}` : null;
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

    logo: {
      light: fileUrl((row as { light?: { storage_key: string } | null }).light?.storage_key),
      dark: fileUrl((row as { dark?: { storage_key: string } | null }).dark?.storage_key),
    },
    ogImage: fileUrl((row as { og?: { storage_key: string } | null }).og?.storage_key),
    logoShowsName: Boolean(row.logo_shows_name),
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
  };
}

/** Every variant that is switched on, in the order the switcher shows them. */
export const listVariants = cache(async (): Promise<Variant[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("variants")
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
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
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
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
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
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
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
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
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] offers failed:", error.message);
  return data ?? [];
});

export const getPeople = cache(async (variantId: string): Promise<PersonRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team")
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] people failed:", error.message);
  return data ?? [];
});

export const getTestimonials = cache(async (variantId: string): Promise<TestimonialRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] testimonials failed:", error.message);
  return data ?? [];
});

export const getFaqs = cache(async (variantId: string): Promise<FaqRow[]> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("faqs")
    .select(`*, light:media!variants_logo_light_id_fkey(storage_key), dark:media!variants_logo_dark_id_fkey(storage_key), og:media!variants_og_image_id_fkey(storage_key)`)
    .eq("variant_id", variantId)
    .order("sort_order");

  if (error) console.error("[variants] faqs failed:", error.message);
  return data ?? [];
});
