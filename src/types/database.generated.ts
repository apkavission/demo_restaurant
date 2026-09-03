/**
 * Generated from the live database. Do not edit.
 *
 *     npm run gen:types
 *
 * The hand-written `database.ts` is the one the application imports — it
 * carries the reasoning a generator cannot know. This file exists so that one
 * can be checked against reality: `conformance.ts` compares them at compile
 * time, and `tsc` fails if they have drifted apart.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  demo_resto: {
    Tables: {
      /** A table. */
      dishes: {
        Row: {
          id: string;
          variant_id: string;
          slug: string;
          name: string;
          summary: string | null;
          description: string | null;
          icon: string | null;
          image_id: string | null;
          price_label: string | null;
          meta_label: string | null;
          status: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          slug: string;
          name: string;
          summary?: string | null;
          description?: string | null;
          icon?: string | null;
          image_id?: string | null;
          price_label?: string | null;
          meta_label?: string | null;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          slug?: string;
          name?: string;
          summary?: string | null;
          description?: string | null;
          icon?: string | null;
          image_id?: string | null;
          price_label?: string | null;
          meta_label?: string | null;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      faqs: {
        Row: {
          id: string;
          variant_id: string;
          question: string;
          answer: string;
          status: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          question: string;
          answer: string;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          question?: string;
          answer?: string;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      /** A view. */
      me: {
        Row: {
          id: string | null;
          full_name: string | null;
          role_key: string | null;
          role_label: string | null;
          is_owner: boolean | null;
          app_access: string[] | null;
          is_active: boolean | null;
        };
        Insert: {
          id?: string | null;
          full_name?: string | null;
          role_key?: string | null;
          role_label?: string | null;
          is_owner?: boolean | null;
          app_access?: string[] | null;
          is_active?: boolean | null;
        };
        Update: {
          id?: string | null;
          full_name?: string | null;
          role_key?: string | null;
          role_label?: string | null;
          is_owner?: boolean | null;
          app_access?: string[] | null;
          is_active?: boolean | null;
        };
        Relationships: [];
      };
      /** A table. */
      media: {
        Row: {
          id: string;
          storage_key: string;
          filename: string;
          alt: string;
          width: number | null;
          height: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_key: string;
          filename: string;
          alt?: string;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          storage_key?: string;
          filename?: string;
          alt?: string;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      /** A view. */
      media_public: {
        Row: {
          id: string | null;
          storage_key: string | null;
          filename: string | null;
          alt: string | null;
          width: number | null;
          height: number | null;
          mime_type: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          storage_key?: string | null;
          filename?: string | null;
          alt?: string | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          storage_key?: string | null;
          filename?: string | null;
          alt?: string | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      /** A table. */
      messages: {
        Row: {
          id: string;
          variant_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          body?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      nav_items: {
        Row: {
          id: string;
          variant_id: string;
          label: string;
          href: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          variant_id: string;
          label: string;
          href: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          variant_id?: string;
          label?: string;
          href?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      /** A table. */
      page_sections: {
        Row: {
          id: string;
          page_id: string;
          heading: string | null;
          body: string | null;
          image_id: string | null;
          layout: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          page_id: string;
          heading?: string | null;
          body?: string | null;
          image_id?: string | null;
          layout?: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          page_id?: string;
          heading?: string | null;
          body?: string | null;
          image_id?: string | null;
          layout?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      /** A table. */
      pages: {
        Row: {
          id: string;
          variant_id: string;
          slug: string;
          title: string;
          summary: string | null;
          status: Database["demo_resto"]["Enums"]["publish_state"];
          meta_title: string | null;
          meta_description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          slug: string;
          title: string;
          summary?: string | null;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          meta_title?: string | null;
          meta_description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          slug?: string;
          title?: string;
          summary?: string | null;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          meta_title?: string | null;
          meta_description?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      reservations: {
        Row: {
          id: string;
          variant_id: string;
          guest_name: string;
          phone: string;
          email: string | null;
          offer_id: string | null;
          person_id: string | null;
          preferred_on: string;
          preferred_slot: string | null;
          party_size: number;
          note: string | null;
          status: Database["demo_resto"]["Enums"]["enquiry_state"];
          staff_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          guest_name: string;
          phone: string;
          email?: string | null;
          offer_id?: string | null;
          person_id?: string | null;
          preferred_on: string;
          preferred_slot?: string | null;
          party_size: number;
          note?: string | null;
          status?: Database["demo_resto"]["Enums"]["enquiry_state"];
          staff_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          guest_name?: string;
          phone?: string;
          email?: string | null;
          offer_id?: string | null;
          person_id?: string | null;
          preferred_on?: string;
          preferred_slot?: string | null;
          party_size?: number;
          note?: string | null;
          status?: Database["demo_resto"]["Enums"]["enquiry_state"];
          staff_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      share_link_opens: {
        Row: {
          id: string;
          link_id: string;
          opened_at: string;
          user_agent: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          link_id: string;
          opened_at?: string;
          user_agent?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          opened_at?: string;
          user_agent?: string | null;
          referrer?: string | null;
        };
        Relationships: [];
      };
      /** A table. */
      share_links: {
        Row: {
          id: string;
          variant_id: string;
          token: string;
          label: string;
          note: string | null;
          expires_at: string;
          revoked_at: string | null;
          view_count: number;
          last_seen_at: string | null;
          max_views: number | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          token: string;
          label?: string;
          note?: string | null;
          expires_at: string;
          revoked_at?: string | null;
          view_count?: number;
          last_seen_at?: string | null;
          max_views?: number | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          token?: string;
          label?: string;
          note?: string | null;
          expires_at?: string;
          revoked_at?: string | null;
          view_count?: number;
          last_seen_at?: string | null;
          max_views?: number | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      team: {
        Row: {
          id: string;
          variant_id: string;
          slug: string;
          full_name: string;
          role_label: string | null;
          qualification: string | null;
          bio: string | null;
          photo_id: string | null;
          years_experience: number | null;
          availability: Json;
          status: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          slug: string;
          full_name: string;
          role_label?: string | null;
          qualification?: string | null;
          bio?: string | null;
          photo_id?: string | null;
          years_experience?: number | null;
          availability?: Json;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          slug?: string;
          full_name?: string;
          role_label?: string | null;
          qualification?: string | null;
          bio?: string | null;
          photo_id?: string | null;
          years_experience?: number | null;
          availability?: Json;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      testimonials: {
        Row: {
          id: string;
          variant_id: string;
          author: string;
          role_label: string | null;
          quote: string;
          rating: number | null;
          photo_id: string | null;
          status: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          author: string;
          role_label?: string | null;
          quote: string;
          rating?: number | null;
          photo_id?: string | null;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          author?: string;
          role_label?: string | null;
          quote?: string;
          rating?: number | null;
          photo_id?: string | null;
          status?: Database["demo_resto"]["Enums"]["publish_state"];
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      /** A table. */
      variants: {
        Row: {
          id: string;
          slug: string;
          name: string;
          industry_label: string;
          business_name: string;
          tagline: string | null;
          description: string | null;
          logo_light_id: string | null;
          logo_dark_id: string | null;
          og_image_id: string | null;
          theme: Json;
          contact: Json;
          features: Json;
          default_mode: string;
          allow_mode_toggle: boolean;
          visibility: string;
          is_default: boolean;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
          logo_shows_name: boolean;
          meta_title: string | null;
          meta_description: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          industry_label: string;
          business_name: string;
          tagline?: string | null;
          description?: string | null;
          logo_light_id?: string | null;
          logo_dark_id?: string | null;
          og_image_id?: string | null;
          theme?: Json;
          contact?: Json;
          features?: Json;
          default_mode?: string;
          allow_mode_toggle?: boolean;
          visibility?: string;
          is_default?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          logo_shows_name?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          industry_label?: string;
          business_name?: string;
          tagline?: string | null;
          description?: string | null;
          logo_light_id?: string | null;
          logo_dark_id?: string | null;
          og_image_id?: string | null;
          theme?: Json;
          contact?: Json;
          features?: Json;
          default_mode?: string;
          allow_mode_toggle?: boolean;
          visibility?: string;
          is_default?: boolean;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
          logo_shows_name?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      enquiry_state: "requested" | "confirmed" | "seated" | "no_show" | "cancelled";
      publish_state: "draft" | "published";
    };
    CompositeTypes: Record<never, never>;
  };
};
