import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { getAdminSession, type AdminSession } from "@/lib/auth";
import { signOut } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s — Restaurant demo panel" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The panel's shell.
 *
 * **The menu is built from the role, and the two super-admin entries are absent
 * rather than disabled** for anybody else. A greyed-out "Share links" tells a
 * colleague that a feature exists which they may not have, which is an
 * invitation to ask why — and the honest answer is a conversation about
 * seniority nobody wanted to have over a menu item.
 *
 * The role is written in the header on purpose. Somebody wondering why they
 * cannot issue a link should be able to see they are signed in as an admin
 * rather than a super admin without asking anybody.
 *
 * **No variant branding anywhere.** This screen belongs to us. Dressing it in
 * Smile Care's teal would be pretending an invented clinic has staff.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  /* The sign-in page lives under this layout and must render without one. */
  if (!session) return <>{children}</>;

  return <Shell session={session}>{children}</Shell>;
}

function Shell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const items = [
    { href: "/admin", label: "Today" },
    { href: "/admin/content", label: "Content" },
    ...(session.isSuperAdmin
      ? [
          { href: "/admin/variants", label: "Businesses" },
          { href: "/admin/links", label: "Share links" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center gap-6">
          <Link href="/admin" className="font-display font-semibold tracking-tight">
            Restaurant demo
          </Link>

          <nav aria-label="Panel" className="hidden items-center gap-1 sm:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-muted sm:flex">
              {session.name}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text">
                {session.isSuperAdmin && <ShieldCheck className="size-3" aria-hidden />}
                {session.roleLabel}
              </span>
            </span>

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-surface-2"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Panel" className="container-page flex gap-1 pb-3 sm:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
