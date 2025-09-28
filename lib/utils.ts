import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProfileSchema } from "./schemas";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type ProfileValues = z.infer<typeof ProfileSchema>;

const ADDRESS_SEP = " | ";
const PFX = {
  sub: "แขวง/ตำบล ",
  dist: "เขต/อำเภอ ",
  prov: "จังหวัด ",
  post: "รหัสไปรษณีย์ ",
  country: "ประเทศ ",
};

export function buildAddress(v: ProfileValues): string | null {
  const parts: string[] = [];
  if (v.addr_line?.trim()) parts.push(v.addr_line.trim());
  if (v.subdistrict?.trim()) parts.push(PFX.sub + v.subdistrict.trim());
  if (v.district?.trim()) parts.push(PFX.dist + v.district.trim());
  if (v.province?.trim()) parts.push(PFX.prov + v.province.trim());
  if (v.postcode?.trim()) parts.push(PFX.post + v.postcode.trim());
  if (v.country?.trim()) parts.push(PFX.country + v.country.trim());
  return parts.length ? parts.join(ADDRESS_SEP) : null;
}
export function stripPrefix(s: string, prefix: string) {
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}
export function parseAddress(s: string | null | undefined) {
  let addr_line = "", subdistrict = "", district = "", province = "", postcode = "", country = "";
  if (!s) return { addr_line, subdistrict, district, province, postcode, country };
  const tokens = s.split(ADDRESS_SEP).map(t => t.trim()).filter(Boolean);
  const freeTexts: string[] = [];
  for (const t of tokens) {
    if (t.startsWith(PFX.sub)) subdistrict = stripPrefix(t, PFX.sub);
    else if (t.startsWith(PFX.dist)) district = stripPrefix(t, PFX.dist);
    else if (t.startsWith(PFX.prov)) province = stripPrefix(t, PFX.prov);
    else if (t.startsWith(PFX.post)) postcode = stripPrefix(t, PFX.post);
    else if (t.startsWith(PFX.country)) country = stripPrefix(t, PFX.country);
    else if (/^\d{5}$/.test(t) && !postcode) postcode = t;
    else freeTexts.push(t);
  }
  if (freeTexts.length) addr_line = freeTexts.join(" ");
  return { addr_line, subdistrict, district, province, postcode, country };
}