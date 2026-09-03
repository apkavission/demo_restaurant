"use server";

import { z } from "zod";
import { acknowledge } from "@/lib/email/acknowledge";
import { fieldErrors, type FormState } from "@/lib/form-state";
import { createClient } from "@/lib/supabase/server";

/**
 * The two things a visitor can actually do: enquire, and write in.
 *
 * **A demo that cannot be used is a picture.** The whole argument this makes to a
 * prospect is "your site would work like this" — so the form writes a real row,
 * the panel shows it a second later, and somebody can move it along. That moment
 * is what sells the build.
 *
 * **Nothing here trusts the variant from the form.** The slug is looked up on the
 * server and its id is what gets written. A hidden `variant_id` would let anybody
 * post an enquiry into a different business — harmless with invented data, and
 * exactly the habit that is not harmless later.
 */

/** Today where the business is, so "not in the past" means their today. */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

const enquirySchema = z.object({
  variant: z.string().trim().min(1),
  person_name: z.string().trim().min(2, "What name should we put it under?").max(160),
  phone: z
    .string()
    .trim()
    .min(6, "A number we can reach you on.")
    .max(20, "That does not look like a phone number."),
  email: z.string().trim().email("That does not look like an email address.").or(z.literal("")),
  offer: z.string().trim().optional(),
  person: z.string().trim().optional(),
  preferred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a day."),
  preferred_slot: z.string().trim().max(40).optional(),
  note: z.string().trim().max(1000).optional(),
  party_size: z.coerce.number().int().min(1, "At least one.").max(40, "Ring us for a group that size."),
});

export async function submitEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = enquirySchema.safeParse({
    variant: formData.get("variant"),
    person_name: formData.get("person_name"),
    phone: formData.get("phone"),
    email: formData.get("email") ?? "",
    offer: formData.get("offer") || undefined,
    person: formData.get("person") || undefined,
    preferred_on: formData.get("preferred_on"),
    preferred_slot: formData.get("preferred_slot") || undefined,
    note: formData.get("note") || undefined,
    party_size: formData.get("party_size") || undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error.issues),
    };
  }

  /* A day that has already gone is a typo, every time. Refused rather than
     accepted and quietly ignored — somebody who picks last Tuesday should be
     told, not left waiting for a call that will not come. */
  if (parsed.data.preferred_on < today()) {
    return {
      status: "error",
      message: "That day has already passed.",
      fieldErrors: { preferred_on: "Pick a day from today onwards." },
    };
  }

  const supabase = await createClient();

  const { data: variant } = await supabase
    .from("variants")
    .select("id")
    .eq("slug", parsed.data.variant)
    .eq("is_active", true)
    .maybeSingle();

  if (!variant) return { status: "error", message: "That business is not taking enquiries." };

  /* The offer and the person arrive as slugs and are resolved here, scoped to
     this variant — so a slug from another business resolves to nothing rather
     than to somebody else's row. */
  const [offer, person] = await Promise.all([
    parsed.data.offer
      ? supabase
          .from("dishes")
          .select("id")
          .eq("variant_id", variant.id)
          .eq("slug", parsed.data.offer)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    parsed.data.person
      ? supabase
          .from("team")
          .select("id")
          .eq("variant_id", variant.id)
          .eq("slug", parsed.data.person)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const { error } = await supabase.from("reservations").insert({
    variant_id: variant.id,
    guest_name: parsed.data.person_name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    offer_id: offer.data?.id ?? null,
    person_id: person.data?.id ?? null,
    preferred_on: parsed.data.preferred_on,
    preferred_slot: parsed.data.preferred_slot ?? null,
    note: parsed.data.note ?? null,
    party_size: parsed.data.party_size ?? null,
    status: "requested",
  });

  if (error) {
    console.error("[enquiry] failed:", error.message);
    return {
      status: "error",
      message: "That did not go through. Nothing was recorded — please try again.",
    };
  }


  /*
    The note back to whoever asked.

    After the insert, and it cannot undo it: `acknowledge` swallows every mail
    failure by design, because the row is already saved and the person is about
    to be told so. A missing email is a missing courtesy, not lost work.
  */
  await acknowledge({
    variantSlug: parsed.data.variant,
    to: parsed.data.email || null,
    name: parsed.data.person_name,
    rows: [
      ["Day", parsed.data.preferred_on],
      ...((parsed.data.preferred_slot ? [["Time", parsed.data.preferred_slot]] : []) as Array<
        [string, string]
      >),
      ["Phone", parsed.data.phone],
    ],
    note: parsed.data.note,
  });
  return {
    status: "success",
    message: "Sent. Somebody will come back to you — nothing is charged to ask.",
  };
}

const messageSchema = z.object({
  variant: z.string().trim().min(1),
  name: z.string().trim().min(2, "Your name.").max(160),
  email: z.string().trim().email("That does not look like an email address.").or(z.literal("")),
  phone: z.string().trim().max(20).optional(),
  body: z.string().trim().min(5, "What would you like to ask?").max(2000),
});

export async function sendMessage(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = messageSchema.safeParse({
    variant: formData.get("variant"),
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") || undefined,
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrors(parsed.error.issues),
    };
  }

  /* One of the two, or there is no way to answer. A rule about the pair, so it
     lives here rather than in the schema. */
  if (!parsed.data.email && !parsed.data.phone) {
    return {
      status: "error",
      message: "Leave a phone number or an email, or we cannot come back to you.",
      fieldErrors: { phone: "One of these is needed." },
    };
  }

  const supabase = await createClient();

  const { data: variant } = await supabase
    .from("variants")
    .select("id")
    .eq("slug", parsed.data.variant)
    .eq("is_active", true)
    .maybeSingle();

  if (!variant) return { status: "error", message: "That business is not taking messages." };

  const { error } = await supabase.from("messages").insert({
    variant_id: variant.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone ?? null,
    body: parsed.data.body,
  });

  if (error) {
    console.error("[message] failed:", error.message);
    return { status: "error", message: "That did not send. Nothing was saved." };
  }

  return { status: "success", message: "Sent. Somebody will come back to you." };
}
