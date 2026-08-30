# Restaurant demo — how far along this is

**Counted from the table below, never typed by hand.** The count is the point:
a percentage somebody types drifts, and once one has drifted nobody believes any
of them.

| | |
|---|---|
| **6 of 6 phases done** | **100%** |
| Left | Nothing in this project |

**What the number does not say.** Nobody has clicked through this demo by hand
yet. The automated half is **27 unit tests** over the pure logic, **42 browser
tests** at two widths, and two checks that ask the database directly (`check:demos` and `check:queries`).
A green suite is not the same as somebody having looked at it: the tests check
what they were told to check, and a page can be ugly, confusing or subtly wrong
in ways none of them would notice.

## The phases

| | Phase | State | What it is |
|---|---|---|---|
| 0 | Foundation | done | Next 16 on its own port, its own Supabase client, its own generated types. Nothing imported from another project. |
| 1 | Database | done | Its own schema, row-level security on every table, three businesses seeded with real copy. |
| 2 | The public site | done | Every page under `/[variant]`, so all three businesses are one deployment. Separate light and dark palettes per business. |
| 3 | The panel | done | Sign in, a dashboard that changes with the role, content editors, and the enquiry inbox. |
| 4 | Share links | done | A token with an expiry, a view cap and a revoke button, enforced on every request. |
| 5 | Browser tests | done | 42 Playwright tests, at desktop and phone widths. They check what nobody would report: a link that still works after being closed, a business reachable without one, three variants sharing a heading. |

## What this demo is

Three businesses in one application: **Fine Dining, Cafe & Bakery, Cloud Kitchen**. Switching between them
changes the name, the colours, the dishes, the team and the
phone number — the whole site, not a badge in the corner.

- **Runs on** `http://localhost:3400` · panel at `/admin`
- **Schema** `demo_resto` · 3 migrations, all applied
- **Content** 15 dishes, 9 team members, across the three businesses
- **Its enquiry** is *reservations*, and it asks how many are coming, and when

That last line is the reason there are five separate demos rather than one with
the words swapped. A restaurant that asks for a patient's name is a template.

## What is deliberately not here

**Photographs.** There is a `media` table and nothing in it. Every page stands on
type, colour and layout. A stock photograph of a smiling stranger would make this
look like every other template, and a photograph of a real restaurant would be a lie.

**A clone button.** Adding a fourth business is a database job today: the clone
has to walk every table in dependency order and remap the ids.

**Anything committed or pushed.** That stays the owner's.

## Where the rest is written

| | |
|---|---|
| What only the owner can do | `services/docs/demos-owner-tasks.md` |
| The click-through list | [testing.md](testing.md) |
| Which SQL has actually run | `cd services && npm run verify:estate` |
