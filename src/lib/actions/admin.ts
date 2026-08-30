"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors, type FormState } from "@/lib/form-state";

/**
 * What the panel can change.
 *
 * Every action here is guarded twice: `requireAdmin` or `requireSuperAdmin`
 * decides who may run it, and the row policies decide which rows it may touch.
 * Both, deliberately — a server action is a public HTTP endpoint, reachable by
 * anybody who knows its name whether or not a button for it was ever drawn.
 */

/* -------------------------------------------------------------------------- */
/* Signing in                                                                  */
/* -------------------------------------------------------------------------- */

export async function signIn(_previous: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { status: "error", message: "Both fields are needed." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    /*
      One message for a wrong address and a wrong password, on purpose. Telling
      them apart tells somebody probing which addresses have accounts.
    */
    return { status: "error", message: "That email and password do not match an account." };
  }

  redirect("/admin");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* The inbox: appointments and messages                                        */
/* -------------------------------------------------------------------------- */

const appointmentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["requested", "confirmed", "seated", "no_show", "cancelled"]),
  staff_note: z.string().trim().max(1000).optional(),
});

/**
 * Move an appointment along.
 *
 * The five states are the ones a receptionist actually uses, and `attended` and
 * `missed` are the pair that matter: a clinic's no-show rate is the number that
 * decides whether it starts taking deposits, and it cannot be worked out from a
 * diary that only records bookings.
 */
export async function setEnquiryStatus(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = appointmentSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    staff_note: formData.get("staff_note") || undefined,
  });

  if (!parsed.success) return { status: "error", message: "That did not make sense." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("reservations")
    .update({
      status: parsed.data.status,
      ...(parsed.data.staff_note ? { staff_note: parsed.data.staff_note } : {}),
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[admin] appointment update failed:", error.message);
    return { status: "error", message: "Could not save that." };
  }

  revalidatePath("/admin");
  return { status: "success", message: "Updated." };
}

export async function markMessageRead(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "That did not make sense." };

  const supabase = await createClient();
  const { error } = await supabase.from("messages").update({ is_read: true }).eq("id", id);

  if (error) return { status: "error", message: "Could not save that." };

  revalidatePath("/admin");
  return { status: "success", message: "Marked as read." };
}

/* -------------------------------------------------------------------------- */
/* Content                                                                     */
/* -------------------------------------------------------------------------- */

const serviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "It needs a name.").max(160),
  summary: z.string().trim().max(300).optional(),
  price_label: z.string().trim().max(60).optional(),
  meta_label: z.string().trim().max(60).optional(),
  status: z.enum(["draft", "published"]),
});

export async function saveOffer(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    summary: formData.get("summary") || undefined,
    price_label: formData.get("price_label") || undefined,
    meta_label: formData.get("meta_label") || undefined,
    status: formData.get("status") || "published",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("dishes")
    .update({
      name: parsed.data.name,
      summary: parsed.data.summary ?? null,
      price_label: parsed.data.price_label ?? null,
      meta_label: parsed.data.meta_label ?? null,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[admin] service save failed:", error.message);
    return { status: "error", message: "Could not save. Nothing was changed." };
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { status: "success", message: "Saved. The site shows it straight away." };
}

const doctorSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().trim().min(2, "A name is needed.").max(160),
  role_label: z.string().trim().max(160).optional(),
  qualification: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1000).optional(),
  status: z.enum(["draft", "published"]),
});

export async function savePerson(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const parsed = doctorSchema.safeParse({
    id: formData.get("id"),
    full_name: formData.get("full_name"),
    role_label: formData.get("role_label") || undefined,
    qualification: formData.get("qualification") || undefined,
    bio: formData.get("bio") || undefined,
    status: formData.get("status") || "published",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("team")
    .update({
      full_name: parsed.data.full_name,
      role_label: parsed.data.role_label ?? null,
      qualification: parsed.data.qualification ?? null,
      bio: parsed.data.bio ?? null,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[admin] doctor save failed:", error.message);
    return { status: "error", message: "Could not save. Nothing was changed." };
  }

  revalidatePath("/admin");
  revalidatePath("/", "layout");

  return { status: "success", message: "Saved." };
}

/* -------------------------------------------------------------------------- */
/* Share links — a super admin's                                               */
/* -------------------------------------------------------------------------- */

const linkSchema = z.object({
  variant_id: z.string().uuid("Which demo is this for?"),
  label: z.string().trim().min(2, "Who is it for? This is how you find it later.").max(160),
  days: z.coerce
    .number()
    .int()
    .min(1, "At least a day.")
    .max(365, "A year is the longest a demo link should live."),
  max_views: z.coerce.number().int().min(1).max(9999).optional(),
  note: z.string().trim().max(500).optional(),
});

/**
 * Issue a link.
 *
 * **The label is required**, and that is the whole reason revocation works: the
 * case that matters is the wrong link sent to the wrong person, and a table of
 * unlabelled tokens gives nobody a way to say which one to close.
 *
 * The token is 32 random bytes in base64url — long enough that guessing is not a
 * strategy, and short enough to paste into an email without wrapping.
 */
export async function createShareLink(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireSuperAdmin();

  const parsed = linkSchema.safeParse({
    variant_id: formData.get("variant_id"),
    label: formData.get("label"),
    days: formData.get("days") || 14,
    max_views: formData.get("max_views") || undefined,
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the fields." };
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + parsed.data.days);

  const supabase = await createClient();

  const { error } = await supabase.from("share_links").insert({
    variant_id: parsed.data.variant_id,
    token: randomBytes(24).toString("base64url"),
    label: parsed.data.label,
    note: parsed.data.note ?? null,
    expires_at: expires.toISOString(),
    max_views: parsed.data.max_views ?? null,
    created_by: session.id,
  });

  if (error) {
    console.error("[admin] share link failed:", error.message);
    return { status: "error", message: "Could not create it." };
  }

  revalidatePath("/admin/links");

  return {
    status: "success",
    message: `Link created. It works for ${parsed.data.days} day${parsed.data.days === 1 ? "" : "s"}.`,
  };
}

/**
 * Close a link now.
 *
 * Revoked rather than deleted: the row is the record of who was sent what and
 * how often they opened it, and that is worth keeping after the link is dead.
 */
export async function revokeShareLink(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSuperAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "That did not make sense." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);

  if (error) {
    console.error("[admin] revoke failed:", error.message);
    return { status: "error", message: "Could not close it." };
  }

  revalidatePath("/admin/links");

  return { status: "success", message: "Closed. It stops working immediately." };
}

/* -------------------------------------------------------------------------- */
/* Variants — a super admin's                                                  */
/* -------------------------------------------------------------------------- */

export async function setVariantVisibility(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSuperAdmin();

  const id = String(formData.get("id") ?? "");
  const visibility = formData.get("visibility") === "link_only" ? "link_only" : "public";

  if (!id) return { status: "error", message: "That did not make sense." };

  const supabase = await createClient();
  const { error } = await supabase.from("variants").update({ visibility }).eq("id", id);

  if (error) {
    console.error("[admin] visibility failed:", error.message);
    return { status: "error", message: "Could not change it." };
  }

  revalidatePath("/admin/variants");
  revalidatePath("/", "layout");

  return {
    status: "success",
    message:
      visibility === "public"
        ? "Anybody with the address can see it now."
        : "Only somebody holding a live link can see it now.",
  };
}

const cloneSchema = z.object({
  id: z.string().uuid(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z][a-z0-9-]*$/, "Lower case, starting with a letter."),
  name: z.string().trim().min(2, "What is it called?").max(120),
});

/**
 * Copy a whole business.
 *
 * **The walk lives in the database, in `clone_variant`, because it is one
 * transaction.** A copy done in six round trips from here leaves half a
 * business behind the first time a connection drops -- a variant row with no
 * content, which looks finished and is not.
 *
 * What it does not copy: enquiries, messages and share links. Those belong to
 * the business that received them, and a copied link would hand a second
 * prospect a URL we thought we had given to one person.
 *
 * The copy arrives **switched off and link-only**, carrying the original's
 * words until somebody edits them -- which is exactly when nobody should be
 * able to find it.
 */
export async function cloneVariant(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSuperAdmin();

  const parsed = cloneSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the fields below.",
      fieldErrors: fieldErrors(parsed.error.issues),
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("clone_variant", {
    p_source: parsed.data.id,
    p_slug: parsed.data.slug,
    p_name: parsed.data.name,
  });

  if (error) {
    console.error("[admin] clone failed:", error.message);

    if (error.message.includes("already taken")) {
      return {
        status: "error",
        message: "That address is taken.",
        fieldErrors: { slug: "Another business already uses it." },
      };
    }

    return { status: "error", message: "The copy did not happen." };
  }

  revalidatePath("/admin/variants");
  revalidatePath("/", "layout");

  return {
    status: "success",
    message: "Copied. It is switched off and link-only until you change it.",
  };
}
