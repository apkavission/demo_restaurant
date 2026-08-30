"use client";

import { useActionState, useState } from "react";
import { Copy, CopyPlus, Loader2, Link2Off } from "lucide-react";
import {
  createShareLink,
  revokeShareLink,
  savePerson,
  saveOffer,
  setVariantVisibility,
  cloneVariant,
} from "@/lib/actions/admin";
import { idleState } from "@/lib/form-state";
import { cn } from "@/lib/utils";

const FIELD =
  "block w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm " +
  "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

function Message({ state }: { state: { status: string; message?: string } }) {
  if (state.status === "idle" || !state.message) return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "text-sm",
        state.status === "error" ? "text-red-600 dark:text-red-400" : "text-muted",
      )}
    >
      {state.message}
    </p>
  );
}

/**
 * Editing one service, in place.
 *
 * **A row that saves itself, rather than a form that saves twelve.** Content is
 * corrected one line at a time — a price that changed, a summary that reads
 * badly — and a single Save covering the whole page makes every one of those an
 * opportunity to change something nobody meant to.
 */
export function OfferEditor({
  offer,
}: {
  offer: {
    id: string;
    name: string;
    summary: string | null;
    price_label: string | null;
    meta_label: string | null;
    status: string;
  };
}) {
  const [state, action, pending] = useActionState(saveOffer, idleState);

  return (
    <form action={action} className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <input type="hidden" name="id" value={offer.id} />

      <div className="grid gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <label className="block">
          <span className="text-xs text-muted">Name</span>
          <input name="name" defaultValue={offer.name} required className={cn(FIELD, "mt-1")} />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Price</span>
          <input
            name="price_label"
            defaultValue={offer.price_label ?? ""}
            placeholder="From ₹4,500"
            className={cn(FIELD, "mt-1")}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">When</span>
          <input
            name="meta_label"
            defaultValue={offer.meta_label ?? ""}
            placeholder="45 min"
            className={cn(FIELD, "mt-1")}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-xs text-muted">One line, for the card</span>
        <input name="summary" defaultValue={offer.summary ?? ""} className={cn(FIELD, "mt-1")} />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="status"
            value="published"
            defaultChecked={offer.status === "published"}
            className="size-4 rounded border-border-strong text-accent focus:ring-2 focus:ring-accent/25"
          />
          Shown on the site
        </label>

        {/* An unticked checkbox sends nothing, so the draft value travels in a
            hidden field behind it. Without this, unticking would send no status
            at all and the action would fall back to "published" — the opposite
            of what was asked for. */}
        <input type="hidden" name="status" value="draft" />

        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-2 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          {pending ? "Saving" : "Save"}
        </button>

        <Message state={state} />
      </div>
    </form>
  );
}

export function PersonEditor({
  person,
}: {
  person: {
    id: string;
    full_name: string;
    role_label: string | null;
    qualification: string | null;
    bio: string | null;
    status: string;
  };
}) {
  const [state, action, pending] = useActionState(savePerson, idleState);

  return (
    <form action={action} className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <input type="hidden" name="id" value={person.id} />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-xs text-muted">Name</span>
          <input name="full_name" defaultValue={person.full_name} required className={cn(FIELD, "mt-1")} />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Role</span>
          <input
            name="role_label"
            defaultValue={person.role_label ?? ""}
            className={cn(FIELD, "mt-1")}
          />
        </label>

        <label className="block">
          <span className="text-xs text-muted">Qualification</span>
          <input
            name="qualification"
            defaultValue={person.qualification ?? ""}
            className={cn(FIELD, "mt-1")}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-xs text-muted">About them</span>
        <textarea
          name="bio"
          rows={2}
          defaultValue={person.bio ?? ""}
          className={cn(FIELD, "mt-1 resize-y")}
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="status"
            value="published"
            defaultChecked={person.status === "published"}
            className="size-4 rounded border-border-strong text-accent focus:ring-2 focus:ring-accent/25"
          />
          Shown on the site
        </label>
        <input type="hidden" name="status" value="draft" />

        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-2 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          {pending ? "Saving" : "Save"}
        </button>

        <Message state={state} />
      </div>
    </form>
  );
}

/**
 * Whether a business can be found by anybody, or only through a link.
 *
 * Two states with a sentence each, rather than a switch labelled "public". The
 * consequence of getting this wrong — a demo built for one prospect discovered
 * by the next — is worth two lines of explanation on the screen.
 */
export function VisibilityToggle({
  id,
  visibility,
}: {
  id: string;
  visibility: string;
}) {
  const [state, action, pending] = useActionState(setVariantVisibility, idleState);
  const next = visibility === "public" ? "link_only" : "public";

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="visibility" value={next} />

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
          visibility === "public"
            ? "bg-accent-soft text-accent hover:opacity-80"
            : "bg-surface-2 text-muted hover:text-text",
        )}
      >
        {pending ? "Saving" : visibility === "public" ? "Anybody can see it" : "Link only"}
      </button>

      <Message state={state} />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Share links                                                                 */
/* -------------------------------------------------------------------------- */

export function ShareLinkForm({
  variants,
}: {
  variants: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createShareLink, idleState);

  return (
    <form action={action} className="space-y-4 rounded-[var(--radius-card)] border border-border bg-surface p-6">
      <h2 className="font-display text-lg font-semibold">Send somebody a link</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Which business</span>
          <select name="variant_id" required defaultValue="" className={cn(FIELD, "mt-1")}>
            <option value="" disabled>
              Choose
            </option>
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-muted">Who is it for</span>
          <input
            name="label"
            required
            placeholder="Dr Sinha, Kankarbagh"
            className={cn(FIELD, "mt-1")}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">Works for</span>
          <select name="days" defaultValue="14" className={cn(FIELD, "mt-1")}>
            <option value="3">3 days</option>
            <option value="7">A week</option>
            <option value="14">A fortnight</option>
            <option value="30">A month</option>
            <option value="90">Three months</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-muted">Opens allowed (optional)</span>
          <input
            name="max_views"
            type="number"
            min={1}
            max={9999}
            placeholder="No limit"
            className={cn(FIELD, "mt-1")}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? "Creating" : "Create the link"}
        </button>

        <Message state={state} />
      </div>
    </form>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          /* Some browsers refuse without a user gesture they recognise, or over
             plain http. The address is shown beside this button either way, so
             there is always a way to get it. */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
    >
      <Copy className="size-3.5" aria-hidden />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function RevokeLink({ id }: { id: string }) {
  const [state, action, pending] = useActionState(revokeShareLink, idleState);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-red-400 hover:text-red-600 disabled:opacity-60 dark:hover:text-red-400"
      >
        <Link2Off className="size-3.5" aria-hidden />
        {pending ? "Closing" : "Close it"}
      </button>
      {state.status === "error" && state.message && (
        <span role="alert" className="ml-2 text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      )}
    </form>
  );
}

/**
 * Copy a business.
 *
 * **Closed until asked for.** It is the one control on this screen that creates
 * something rather than adjusting it, and an always-open form invites a
 * half-filled accidental copy.
 *
 * The address is asked for rather than generated from the name, because a slug
 * derived from "Eye Care Hospital (new)" is a URL somebody has to live with.
 */
export function CloneVariant({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(cloneVariant, idleState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-2"
      >
        <CopyPlus className="size-3.5" aria-hidden />
        Copy this one
      </button>
    );
  }

  return (
    <form action={action} className="w-full space-y-3 rounded-lg border border-border bg-surface-2 p-4">
      <input type="hidden" name="id" value={id} />

      <p className="text-xs text-muted">
        Copies everything {name} sells and says. Enquiries, messages and links
        stay where they are. The copy starts switched off.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs">
          <span className="text-muted">Name</span>
          <input name="name" required maxLength={120} className={FIELD} />
          {state.fieldErrors?.name && (
            <span className="mt-1 block text-red-600 dark:text-red-400">
              {state.fieldErrors.name}
            </span>
          )}
        </label>

        <label className="block text-xs">
          <span className="text-muted">Address</span>
          <input
            name="slug"
            required
            pattern="[a-z][a-z0-9-]*"
            placeholder="new-business"
            className={FIELD}
          />
          {state.fieldErrors?.slug && (
            <span className="mt-1 block text-red-600 dark:text-red-400">
              {state.fieldErrors.slug}
            </span>
          )}
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg disabled:opacity-60"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          {pending ? "Copying" : "Copy"}
        </button>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted hover:text-text"
        >
          Cancel
        </button>

        <Message state={state} />
      </div>
    </form>
  );
}
