import { BrandLoader } from "@/components/brand/brand-loader";

/**
 * The wait, on every page of the demo site.
 *
 * One boundary at the variant rather than one per page: every public route is
 * a child of this segment, so this is the closest `loading.tsx` above any of
 * them and Next shows it for all seven. A file per page would be seven copies
 * of the same three lines and one of them would eventually be forgotten.
 *
 * Before this existed the demo had no loading state at all, so a click sat on
 * the old page — for ten or twenty seconds against a cold server — with
 * nothing on screen to say it had been heard.
 */
export default function Loading() {
  return <BrandLoader overlay showLabel />;
}
