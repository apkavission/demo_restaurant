"use client";

import { useActionState } from "react";
import { BrandSpinner } from "@/components/brand/brand-loader";
import { Check } from "lucide-react";
import { markMessageRead, setEnquiryStatus } from "@/lib/actions/admin";
import { idleState } from "@/lib/form-state";
import { cn } from "@/lib/utils";
import { useBusyWhile } from "@/components/forms/use-busy-while";

/**
 * The two controls that make the demo a working thing rather than a picture.
 *
 * A prospect books on the public site, walks round to this screen, and watches
 * their own request move from *requested* to *confirmed*. That thirty seconds is
 * the entire argument for the build, and it only works if these actually write.
 */

const STATES = [
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "seated", label: "Seated" },
  { value: "no_show", label: "No show" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export function EnquiryStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [state, action, pending] = useActionState(setEnquiryStatus, idleState);
  useBusyWhile(pending, "Saving enquiry status");

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />

      <label className="sr-only" htmlFor={`status-${id}`}>
        Status
      </label>
      <select
        id={`status-${id}`}
        name="status"
        defaultValue={status}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
      >
        {STATES.map((entry) => (
          <option key={entry.value} value={entry.value}>
            {entry.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        {pending ? <BrandSpinner /> : null}
        {pending ? "Saving" : "Save"}
      </button>

      {state.status !== "idle" && state.message && (
        <span
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "text-xs",
            state.status === "error" ? "text-red-600 dark:text-red-400" : "text-muted",
          )}
        >
          {state.message}
        </span>
      )}
    </form>
  );
}

export function MarkRead({ id }: { id: string }) {
  const [state, action, pending] = useActionState(markMessageRead, idleState);
  useBusyWhile(pending, "Working");

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        <Check className="size-3.5" aria-hidden />
        {pending ? "Saving" : "Mark read"}
      </button>
      {state.status === "error" && state.message && (
        <span role="alert" className="ml-2 text-xs text-red-600 dark:text-red-400">
          {state.message}
        </span>
      )}
    </form>
  );
}
