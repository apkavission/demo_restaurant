import type { Database as Generated } from "./database.generated";

/**
 * The schema, as TypeScript.
 *
 * **Derived from the generated file, not written by hand.** The company website
 * and the internal panel both keep a hand-written copy, because their tables
 * carry years of reasoning that a generator cannot know and the comments are the
 * most useful thing in those files. This schema was written this week, alongside
 * this code, and the reasoning lives in the migration — so a second hand-written
 * copy here would be duplication with nothing to show for it.
 *
 * The consequence worth knowing: after any migration, run
 *
 *     npm run gen:types
 *
 * and the names below change with the database rather than drifting from it.
 */
/**
 * The generated schema, plus the two functions the generator does not cover.
 *
 * `scripts/gen-types.mjs` reads tables, views and enums out of
 * `information_schema`. It does not read functions — their argument and return
 * types live in `pg_proc` in a form that needs real parsing, and a generator
 * that guesses at those would be worse than one that admits it does not do them.
 *
 * So these two are written by hand, and they are the two the proxy depends on.
 * If either signature changes in a migration and this is not updated, the RPC
 * fails loudly at the first request rather than silently returning nothing —
 * which is the right way for this particular mistake to show up, because the
 * proxy decides who gets in.
 */
export type Database = {
  demo_resto: {
    Tables: Generated["demo_resto"]["Tables"];
    Views: Generated["demo_resto"]["Views"];
    Enums: Generated["demo_resto"]["Enums"];
    CompositeTypes: Generated["demo_resto"]["CompositeTypes"];

    Functions: {
      /** Copy a business and all its content. Returns the new id. */
      clone_variant: {
        Args: { p_source: string; p_slug: string; p_name: string };
        Returns: string;
      };
      /** May this browser see this variant? See 20260831000004. */
      can_view: {
        Args: { p_slug: string; p_token?: string | null };
        Returns: { verdict: string; allowed_slug: string | null }[];
      };
      /** Count one visit, when a share link is first opened. */
      note_share_visit: {
        Args: { p_token: string };
        Returns: undefined;
      };
    };
  };
};

type Tables = Generated["demo_resto"]["Tables"];

export type VariantRow = Tables["variants"]["Row"];
export type NavItemRow = Tables["nav_items"]["Row"];
export type OfferRow = Tables["dishes"]["Row"];
export type PersonRow = Tables["team"]["Row"];
export type TestimonialRow = Tables["testimonials"]["Row"];
export type FaqRow = Tables["faqs"]["Row"];
export type EnquiryRow = Tables["reservations"]["Row"];
export type MessageRow = Tables["messages"]["Row"];
export type ShareLinkRow = Tables["share_links"]["Row"];
export type MediaRow = Tables["media"]["Row"];

export type EnquiryState = Generated["demo_resto"]["Enums"]["enquiry_state"];
export type PublishState = Generated["demo_resto"]["Enums"]["publish_state"];

/**
 * The shape of `variants.theme`.
 *
 * `jsonb` in the database and therefore `Json` in the generated types, which is
 * honest — Postgres does not check the shape. This is what the application
 * expects to find, and `readTheme()` in `lib/theme.ts` is where an unexpected
 * shape is turned into a working page rather than a crash.
 */
export interface VariantPalette {
  accent: string;
  accentFg: string;
  accentSoft: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
}

export interface VariantTheme {
  light: VariantPalette;
  dark: VariantPalette;
  headingFont?: string;
  bodyFont?: string;
  radius?: "sm" | "md" | "lg" | "xl";
}

/** The shape of `variants.contact`. Every field optional — a demo may omit any. */
export interface VariantContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  mapQuery?: string;
  hours?: { weekdays?: string; saturday?: string; sunday?: string };
}

/** The shape of `variants.features`. Toggles, never forks. */
export interface VariantFeatures {
  bookingLabel?: string;
  showEmergency?: boolean;
}
