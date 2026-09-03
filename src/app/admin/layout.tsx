import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/shell";
import { getAdminSession } from "@/lib/auth";
import { signOut } from "@/lib/actions/admin";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s — Restaurant demo panel" },
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The panel's shell.
 *
 * A rail beside the work rather than a strip of links above it — the shape the
 * company admin uses, so the nine applications read as one company's work
 * rather than as products bought from different people. `AdminShell` holds the
 * markup and the reasoning; this file decides only who is asking and what they
 * may open.
 *
 * The sign-in page lives under this layout and must render without a session,
 * which is why the shell is not wrapped around everything unconditionally.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) return <>{children}</>;

  /* Built from the role. The super-admin entries are absent rather than
     disabled for anybody else — see the note in `AdminShell`. */
  /*
    Grouped by what somebody came here to do, rather than by which table each
    screen happens to write.

    "Content", "Testimonials", "Questions" and "Menu" are all editing the site;
    "Enquiries" is the work that arrives on its own. Everything under the super
    admin's fold decides what the site *is* rather than what it says — who it is
    for, what it is called, who may see it — which is the line that makes it
    obvious why those four are the ones not everybody gets.
  */
  const items = [
    { href: "/admin", label: "Today" },
    { href: "/admin/enquiries", label: "Enquiries" },
    { href: "/admin/content", label: "Content" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/questions", label: "Questions" },
    { href: "/admin/pages", label: "Pages" },
    { href: "/admin/menu", label: "Menu" },
    ...(session.isSuperAdmin
      ? [
          { href: "/admin/media", label: "Pictures" },
          { href: "/admin/variants", label: "Businesses" },
          { href: "/admin/branding", label: "Brand" },
          { href: "/admin/links", label: "Share links" },
        ]
      : []),
  ];

  return (
    <AdminShell
      brand="Restaurant demo"
      items={items}
      name={session.name}
      roleLabel={session.roleLabel}
      isSuperAdmin={session.isSuperAdmin}
      signOutAction={signOut}
    >
      {children}
    </AdminShell>
  );
}
