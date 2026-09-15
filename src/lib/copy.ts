/**
 * The words on the site, out of the code and into the row.
 *
 * ---------------------------------------------------------------------------
 * **Why this exists.** Every band on the home page carried its heading, its
 * intro sentence and its promises as literals in the page file. So a demo could
 * have its own name, colours, typeface, prices and people — and still say
 * something the business would never say. The owner asked for the opposite:
 *
 *     best design, layout and theme and full dynamic chaiye
 *     har ek chej kuch bhi static mat karna
 *
 * ---------------------------------------------------------------------------
 * **Two bands, named for what they hold rather than for this trade.** The
 * content band is `catalogue` and the people band is `people`, in every demo in
 * this estate — and what each is *called* on screen is `PAGE_KEYS`, which is
 * data. That is what lets one reader, one set of guarantees and one panel screen
 * serve a restaurant and a clinic without either of them reading like the
 * other. Renaming the keys per trade would be five files that drift.
 *
 * ---------------------------------------------------------------------------
 * **An empty column is a finished page.** Every slot has a default below, so a
 * business nobody has edited reads exactly as it read before this column
 * existed, and the panel shows these as placeholders. Postgres does not check
 * the shape of jsonb, so this reader is also what turns a half-edited value into
 * a working page rather than a crash in front of a prospect.
 */

/** One heading and its sentence. */
export interface Band {
  heading: string;
  intro: string;
}

/** One promise in the strip under the first screen. */
export interface Promise_ {
  icon: string;
  title: string;
  note: string;
}

/**
 * How the first screen is arranged.
 *
 * Not the banner itself — that is `variants.hero_image_id` and
 * `hero_video_url`, because a file belongs in the media library. These are the
 * two presentation choices that go with the words: how dark the scrim over a
 * picture is, and whether the words sit left or centred.
 */
export interface Hero {
  /**
   * How much the banner is darkened behind the words.
   *
   * `none` is the one setting that can produce an unreadable hero — over a
   * bright photograph, light type on no scrim is unreadable — so the panel says
   * so where it is chosen.
   */
  overlay: "soft" | "strong" | "none";
  align: "left" | "centre";
}

export interface HomeCopy {
  hero: Hero;
  catalogue: Band;
  people: Band;
  reviews: Band;
  questions: Band;
  cta: Band;
  promises: Promise_[];

  /**
   * The pages behind the menu, each with its own title and opening line.
   *
   * Separate from the bands above because they are different sentences for a
   * different moment: the home page's band introduces a section somebody is
   * scrolling past, while a page's opening line is read by somebody who chose
   * to be there.
   */
  pages: {
    catalogue: Band;
    people: Band;
    reviews: Band;
    questions: Band;
    contact: Band;
    book: Band;
  };
}

/**
 * Which pages carry a title and an opening line, what the panel calls each of
 * them, and the route each one is.
 *
 * `path` is here so the panel can link to the page it is editing — a screen of
 * eight text fields with no way to see the result is a screen nobody trusts.
 */
export const PAGE_KEYS = [
  { key: "catalogue", label: "The menu", path: "menu" },
  { key: "people", label: "The kitchen", path: "people" },
  { key: "reviews", label: "Reviews", path: "reviews" },
  { key: "questions", label: "Questions", path: "questions" },
  { key: "contact", label: "Contact", path: "contact" },
  { key: "book", label: "The booking page", path: "book" },
] as const;

/**
 * The icons a promise may be drawn with.
 *
 * A fixed list rather than a free text field, for the same reason the typeface
 * is a list: the component imports these by name at build time, so an icon
 * named in a database row that nothing imported cannot be drawn. A free field
 * would accept anything, save cleanly, and render nothing.
 */
export const PROMISE_ICONS = [
  { key: "person", label: "A person" },
  { key: "estimate", label: "A document" },
  { key: "shield", label: "A shield" },
  { key: "calendar", label: "A calendar" },
  { key: "phone", label: "A telephone" },
  { key: "clock", label: "A clock" },
  { key: "pin", label: "A map pin" },
  { key: "spark", label: "A spark" },
] as const;

export function isPromiseIcon(value: unknown): value is string {
  return typeof value === "string" && PROMISE_ICONS.some((icon) => icon.key === value);
}

/**
 * What the site says when nobody has said otherwise.
 *
 * **Taken word for word off the pages as they were written**, so turning this
 * column on changed nothing anybody could see. A default that has to be deleted
 * before a site is usable is worse than an empty field.
 */
export const DEFAULT_COPY: HomeCopy = {
  /* Soft, because it is readable over most pictures and does not bury a good
     one. Left, because this is a page a person reads rather than a poster. */
  hero: { overlay: "soft", align: "left" },
  catalogue: {
      heading: "What is on tonight",
      intro:
        "Written for what the market had this morning, so it changes. Every price is what you would actually pay.",
    },
  people: {
      heading: "Who cooks it",
      intro:
        "The same people every service, which is the part that makes a kitchen consistent and the part most places cannot promise.",
    },
  reviews: {
      heading: "What people said",
      intro:
        "Examples, written for this demonstration. A real site would carry reviews collected from actual guests.",
    },
  questions: {
      heading: "Before you book",
      intro:
        "The ones that come up on the telephone, answered here so nobody has to ring to find out.",
    },
  cta: {
      heading: "",
      intro:
        "Pick an evening and we will confirm it by telephone. Nothing is charged to hold a table.",
    },
  pages: {
    catalogue: {
      heading: "The menu",
      intro:
        "Written for what the market had this morning, so it changes. What is printed here is what you would actually pay.",
    },
    people: {
      heading: "Our team",
      intro:
        "The people who cook it and serve it, and what each of them does. The same faces every service — which is the part that makes a kitchen consistent.",
    },
    reviews: {
      heading: "What people said",
      intro:
        "Written as examples for this demonstration. On a live site these would be reviews collected from real guests, with their permission.",
    },
    questions: {
      heading: "Questions people ask",
      intro:
        "The ones that come up on the telephone, answered here so nobody has to ring to find out.",
    },
    contact: {
      heading: "Contact",
      intro:
        "Ring during opening hours and somebody who can answer picks up. Outside them, write and we will come back to you.",
    },
    book: {
      heading: "",
      intro:
        "Tell us when and how many, and we will confirm by telephone. Nothing is charged to hold a table.",
    },
  },
  promises: [
    {
      icon: "person",
      title: "One sitting a night",
      note: "The table is yours for the evening.",
    },
    {
      icon: "estimate",
      title: "One price, agreed first",
      note: "Per head, with nothing added at the end.",
    },
    {
      icon: "clock",
      title: "The menu is written daily",
      note: "After the market, not before it.",
    },
    {
      icon: "phone",
      title: "Ring for tonight",
      note: "Cancellations go to whoever rings.",
    },
  ],
};

/** A string from the row, or the default. Whitespace only counts as absent. */
function text(given: unknown, fallback: string): string {
  return typeof given === "string" && given.trim() ? given : fallback;
}

function band(given: unknown, fallback: Band): Band {
  const value = (given ?? {}) as Partial<Band>;
  return {
    heading: text(value.heading, fallback.heading),
    intro: text(value.intro, fallback.intro),
  };
}

/**
 * The inner pages, each defaulted on its own.
 *
 * One page edited must not take the others with it, which is what a single
 * merge of the whole object would do if it were written as a spread.
 */
function pages(given: unknown): HomeCopy["pages"] {
  const value = (given ?? {}) as Partial<Record<string, unknown>>;
  const fallback = DEFAULT_COPY.pages;

  return {
    catalogue: band(value.catalogue, fallback.catalogue),
    people: band(value.people, fallback.people),
    reviews: band(value.reviews, fallback.reviews),
    questions: band(value.questions, fallback.questions),
    contact: band(value.contact, fallback.contact),
    book: band(value.book, fallback.book),
  };
}

/**
 * Read whatever is in the column, and always return a page that renders.
 *
 * **The promises list is replaced, not merged.** A business that keeps three of
 * the four means three, and filling the fourth back in from the defaults would
 * put a claim on the page that somebody deliberately removed — which is the one
 * failure this column exists to prevent. An empty list is honoured as empty;
 * only an absent or unusable value falls back.
 */
export function readCopy(value: unknown): HomeCopy {
  const given = (value ?? {}) as Partial<Record<keyof HomeCopy, unknown>>;

  const promises = Array.isArray(given.promises)
    ? given.promises
        .map((entry) => {
          const promise = (entry ?? {}) as Partial<Promise_>;
          const title = typeof promise.title === "string" ? promise.title.trim() : "";
          if (!title) return null;

          return {
            icon: isPromiseIcon(promise.icon) ? promise.icon : PROMISE_ICONS[0].key,
            title,
            note: typeof promise.note === "string" ? promise.note.trim() : "",
          };
        })
        .filter((promise): promise is Promise_ => promise !== null)
    : DEFAULT_COPY.promises;

  const hero = (given.hero ?? {}) as Partial<Hero>;

  return {
    hero: {
      overlay:
        hero.overlay === "strong" || hero.overlay === "none"
          ? hero.overlay
          : DEFAULT_COPY.hero.overlay,
      align: hero.align === "centre" ? "centre" : DEFAULT_COPY.hero.align,
    },
    catalogue: band(given.catalogue, DEFAULT_COPY.catalogue),
    people: band(given.people, DEFAULT_COPY.people),
    reviews: band(given.reviews, DEFAULT_COPY.reviews),
    questions: band(given.questions, DEFAULT_COPY.questions),
    /* The call to action's heading defaults to the main button's own label,
       which the page knows and this file does not — so it stays empty here and
       the page fills it in. */
    cta: band(given.cta, DEFAULT_COPY.cta),
    promises,
    pages: pages(given.pages),
  };
}
