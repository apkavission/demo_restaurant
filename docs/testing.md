# Restaurant demo — the click-through list

Run it once, at the end, on something finished. A pass against a half-built
panel finds the half that is missing rather than the half that is wrong.

**Before anything:** your account needs this demo ticked under **Users →
Applications** in the company website admin. Until then the panel refuses you,
which is correct and looks like a bug.

```
cd demo-restaurant && npm run dev      # http://localhost:3400
```

## As a visitor — `http://localhost:3400`

- [ ] It lands on **Fine Dining** with no variant in the URL.
- [ ] The switcher in the top bar moves between all three: Fine Dining, Cafe & Bakery, Cloud Kitchen. The
      name, the colours, the dishes and the phone number all change.
- [ ] Dark mode, by the moon button. Each business has **its own** dark palette —
      not the light one inverted. Cards still sit above the page.
- [ ] Light mode: the page is grey and the cards are white. If you cannot see
      where a card ends, that is the flat-light bug and it is worth reporting.
- [ ] Every page in the menu opens: dishes, team, reviews, questions,
      contact, book.
- [ ] Send a reservation. It should ask how many are coming, and when.
- [ ] Send a message from the contact page.
- [ ] Submit the form with the email left out — the message appears under that
      input, not at the top of the page.
- [ ] At 390px wide, nothing scrolls sideways.

## As the panel — `http://localhost:3400/admin`

- [ ] Signing in with an account that does **not** have this demo ticked is
      refused, and says why.
- [ ] Your reservation and your message are both there.
- [ ] Move the reservation through its states. The count on the dashboard
      follows.
- [ ] **Content** → change a dish's price, save, reload the public page.
      Already different.
- [ ] Untick *Shown on the site* for one dish — gone from the public
      list, still in the panel.
- [ ] A role that is not owner or super admin sees content, enquiries and
      messages, and does **not** see *Businesses* or *Share links*. Absent, not
      greyed out.

## Share links — super admin only

- [ ] **Share links** → make one for Cloud Kitchen, lasting three days, labelled with
      a name you would recognise a week later.
- [ ] Open it in a private window. It lands on Cloud Kitchen.
- [ ] From that window, try another business's URL — it sends you back.
- [ ] Try `/admin` from that window — the same.
- [ ] **Businesses** → set Cloud Kitchen to **Link only**. In a third window with no
      link, its URL says the link is no longer open.
- [ ] Back in **Share links**, press **Close it**. Refresh the private window —
      dead immediately, not after a cache expires.

That last one is the case the whole design is shaped around: a link sent to the
wrong person, closed ten minutes later.

## What is checked without a browser

```
cd demo-restaurant    && npm run typecheck && npm run lint && npm test
cd services && npm run check:demos     # anonymous visitor: content yes, enquiries no
cd services && npm run check:queries   # every panel query, run against this schema
```

The last one exists because of a real bug: four panels were forked from the
clinic and still asked for tables that do not exist in their own schemas.
PostgREST refused, the page turned the error into an empty list, and the
dashboard showed nothing while looking perfectly healthy.
