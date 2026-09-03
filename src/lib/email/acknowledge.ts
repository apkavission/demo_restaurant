import "server-only";

import { renderDemoEmail } from "@/lib/email/layout";
import { sendMail } from "@/lib/email/mailer";
import { createClient } from "@/lib/supabase/server";
import { readTheme } from "@/lib/theme";
import { clientEnv } from "@/lib/env";
import type { VariantContact } from "@/types/database";

/**
 * The note that goes back to whoever asked for a table.
 *
 * ---------------------------------------------------------------------------
 * **Why a demonstration site sends real email.**
 *
 * A form that swallows a submission in silence is the one thing a prospect
 * definitely notices, and the demo exists to make the opposite point. Somebody
 * being shown this fills the form in with their own address, and thirty seconds
 * later their phone has a message from *their* business, in *their* colour.
 * That is the whole pitch, delivered by the thing itself rather than described.
 *
 * ---------------------------------------------------------------------------
 * **It can never break the booking.**
 *
 * The row is already saved and the visitor has already been told it arrived.
 * Everything below is wrapped so that no mail failure — no credentials, a
 * refused connection, a bad address — turns a successful table into an
 * error on somebody's screen. A missing courtesy is not lost work.
 *
 * ---------------------------------------------------------------------------
 * **An address is optional on these forms**, deliberately: plenty of people
 * would rather leave a phone number. Nothing is sent when there is nowhere to
 * send it, and that is not a failure either.
 */

export interface Acknowledgement {
  /** The variant this was submitted against, by slug. */
  variantSlug: string;
  to: string | null;
  name: string;
  /** Label/value pairs repeating what they asked for. */
  rows: Array<[string, string]>;
  /** Anything they typed, in their own words. */
  note?: string | null;
}

export async function acknowledge(input: Acknowledgement): Promise<void> {
  if (!input.to?.trim()) return;

  try {
    const supabase = await createClient();

    const { data: variant } = await supabase
      .from("variants")
      .select("business_name, theme, contact")
      .eq("slug", input.variantSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (!variant) return;

    const theme = readTheme(variant.theme);
    const contact = (variant.contact ?? {}) as VariantContact;

    const firstName = input.name.trim().split(/\s+/)[0] || input.name;

    const html = renderDemoEmail({
      preheader: `${firstName}, we have your table — nothing is confirmed until somebody comes back to you.`,
      heading: "Your table request is with us",
      intro: "The table is not held until somebody confirms it — this is a note so you have it in writing.",
      rows: input.rows,
      quote: input.note?.trim() ? { label: "What you told us", body: input.note.trim() } : null,
      note: "Nothing has been charged. If your plans change, reply to this email or ring us and we will let the table go.",
      brand: {
        businessName: variant.business_name,
        /* The light palette's accent: the email is a light document, and the
           dark one would be the wrong colour on white. */
        accent: theme.light.accent,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        address: contact.address ?? null,
        siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL,
      },
    });

    const text = [
      `Hello ${firstName},`,
      "",
      "The table is not held until somebody confirms it — this is a note so you have it in writing.",
      "",
      ...input.rows.map(([label, value]) => `${label}: ${value}`),
      ...(input.note?.trim() ? ["", "What you told us:", input.note.trim()] : []),
      "",
      "Nothing has been charged. If your plans change, reply to this email or ring us and we will let the table go.",
      "",
      variant.business_name,
      "",
      "This is a demonstration website built by Apka Vission.",
    ].join("\n");

    await sendMail({
      to: input.to,
      subject: "We have your table request",
      /* From the business, by name. The address is still ours — see the note in
         `mailer.ts` about SPF. */
      fromName: variant.business_name,
      text,
      html,
    });
  } catch (error) {
    /* Logged and swallowed. See the note at the top of this file. */
    console.error(
      "[acknowledge] could not send:",
      error instanceof Error ? error.message : error,
    );
  }
}
