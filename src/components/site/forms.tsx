"use client";

import { useActionState, useId } from "react";
import { BrandSpinner } from "@/components/brand/brand-loader";
import { CheckCircle2, Send } from "lucide-react";
import { sendMessage, submitEnquiry } from "@/lib/actions/public";
import { idleState } from "@/lib/form-state";
import { cn } from "@/lib/utils";
import { useBusyWhile } from "@/components/forms/use-busy-while";

/**
 * The two forms a visitor fills in.
 *
 * **They write real rows.** That is the argument the whole demonstration makes: a
 * prospect fills this in and the enquiry appears in the panel a second later. A
 * form that shows a thank-you and stores nothing is the difference between a
 * demonstration and a mock-up, and prospects can tell.
 *
 * **A success replaces the form rather than sitting above it.** A confirmation
 * under a still-full form invites a second submission, and the second one is the
 * enquiry nobody wanted.
 */

const FIELD =
  "block w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm " +
  "placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 " +
  "aria-[invalid=true]:border-red-500";

function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (id: string, describedBy: string | undefined) => React.ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </label>

      <div className="mt-2">{children(id, describedBy)}</div>

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Done({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-accent-soft p-8 text-center">
      <CheckCircle2 className="mx-auto size-8 text-accent" aria-hidden />
      <p role="status" className="measure mx-auto mt-4 leading-relaxed">
        {message}
      </p>
    </div>
  );
}

export function EnquiryForm({
  variant,
  offers,
  people,
  today,
  preselect,
  cta,
}: {
  variant: string;
  offers: { slug: string; name: string; price_label: string | null }[];
  people: { slug: string; full_name: string; role_label: string | null }[];
  today: string;
  preselect: { offer?: string; person?: string };
  cta: string;
}) {
  const [state, action, pending] = useActionState(submitEnquiry, idleState);
  useBusyWhile(pending, "Sending enquiry");

  if (state.status === "success" && state.message) {
    return <Done message={state.message} />;
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="variant" value={variant} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={state.fieldErrors?.person_name}>
          {(id, describedBy) => (
            <input
              id={id}
              name="person_name"
              required
              autoComplete="name"
              aria-describedby={describedBy}
              aria-invalid={state.fieldErrors?.person_name ? true : undefined}
              className={FIELD}
            />
          )}
        </Field>

        <Field
          label="Phone"
          required
          hint="We come back to you on this."
          error={state.fieldErrors?.phone}
        >
          {(id, describedBy) => (
            <input
              id={id}
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              aria-describedby={describedBy}
              aria-invalid={state.fieldErrors?.phone ? true : undefined}
              className={FIELD}
            />
          )}
        </Field>
      </div>

      <Field label="Email" hint="Optional. For a written confirmation." error={state.fieldErrors?.email}>
        {(id, describedBy) => (
          <input
            id={id}
            name="email"
            type="email"
            autoComplete="email"
            aria-describedby={describedBy}
            className={FIELD}
          />
        )}
      </Field>

      <Field label="How many of you" required hint="Including children." error={state.fieldErrors?.party_size}>
        {(id, describedBy) => (
          <input
            id={id}
            name="party_size"
            type="number"
            min={1}
            max={40}
            required
            aria-describedby={describedBy}
            className={FIELD}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="What for">
          {(id) => (
            <select id={id} name="offer" defaultValue={preselect.offer ?? ""} className={FIELD}>
              <option value="">Not sure yet</option>
              {offers.map((offer) => (
                <option key={offer.slug} value={offer.slug}>
                  {offer.name}
                  {offer.price_label ? ` — ${offer.price_label}` : ""}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field label="Anybody in particular">
          {(id) => (
            <select id={id} name="person" defaultValue={preselect.person ?? ""} className={FIELD}>
              <option value="">Anybody available</option>
              {people.map((person) => (
                <option key={person.slug} value={person.slug}>
                  {person.full_name}
                  {person.role_label ? ` — ${person.role_label}` : ""}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Which day" required error={state.fieldErrors?.preferred_on}>
          {(id, describedBy) => (
            <input
              id={id}
              name="preferred_on"
              type="date"
              required
              min={today}
              defaultValue={today}
              aria-describedby={describedBy}
              aria-invalid={state.fieldErrors?.preferred_on ? true : undefined}
              className={FIELD}
            />
          )}
        </Field>

        <Field label="Time of day">
          {(id) => (
            <select id={id} name="preferred_slot" defaultValue="" className={FIELD}>
              <option value="">Any time</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>
          )}
        </Field>
      </div>

      <Field label="Anything we should know" error={state.fieldErrors?.note}>
        {(id, describedBy) => (
          <textarea
            id={id}
            name="note"
            rows={3}
            maxLength={1000}
            aria-describedby={describedBy}
            className={cn(FIELD, "resize-y")}
          />
        )}
      </Field>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {pending && <BrandSpinner />}
        {pending ? "Sending" : cta}
      </button>
    </form>
  );
}

export function MessageForm({ variant }: { variant: string }) {
  const [state, action, pending] = useActionState(sendMessage, idleState);
  useBusyWhile(pending, "Sending message");

  if (state.status === "success" && state.message) {
    return <Done message={state.message} />;
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="variant" value={variant} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={state.fieldErrors?.name}>
          {(id, describedBy) => (
            <input id={id} name="name" required autoComplete="name" aria-describedby={describedBy} className={FIELD} />
          )}
        </Field>

        <Field label="Phone" error={state.fieldErrors?.phone}>
          {(id, describedBy) => (
            <input id={id} name="phone" type="tel" autoComplete="tel" aria-describedby={describedBy} className={FIELD} />
          )}
        </Field>
      </div>

      <Field label="Email" error={state.fieldErrors?.email}>
        {(id, describedBy) => (
          <input id={id} name="email" type="email" autoComplete="email" aria-describedby={describedBy} className={FIELD} />
        )}
      </Field>

      <Field label="Your message" required error={state.fieldErrors?.body}>
        {(id, describedBy) => (
          <textarea
            id={id}
            name="body"
            rows={5}
            required
            maxLength={2000}
            aria-describedby={describedBy}
            className={cn(FIELD, "resize-y")}
          />
        )}
      </Field>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? <BrandSpinner /> : <Send className="size-4" aria-hidden />}
        {pending ? "Sending" : "Send it"}
      </button>
    </form>
  );
}
