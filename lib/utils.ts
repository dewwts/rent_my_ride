import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProfileSchema } from "./schemas";
import z from "zod";
import { SupabaseClient } from "@supabase/supabase-js";
import dayjs, { Dayjs } from "dayjs";
import { DbCar, UIRangeFilter } from "@/types/carInterface";
import { CardForUI } from "@/types/carInterface";

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
  let addr_line = "",
    subdistrict = "",
    district = "",
    province = "",
    postcode = "",
    country = "";
  if (!s)
    return { addr_line, subdistrict, district, province, postcode, country };
  const tokens = s
    .split(ADDRESS_SEP)
    .map((t) => t.trim())
    .filter(Boolean);
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
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
export const calculateDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} วัน`;
};
export const formatCurrency = (amount: number) => {
  return `฿${amount.toLocaleString("th-TH")}`;
};

export const uploadImage = async (
  mbucket: string,
  userid: string,
  file: File,
  supabase: SupabaseClient
) => {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const uid =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());
  const path = `${userid}/${uid}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(mbucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (upErr) {
    console.error(upErr);
    throw new Error("เกิดปัญหากับพื้นที่เก็บข้อมูล");
  }

  const { data: pub } = supabase.storage.from(mbucket).getPublicUrl(path);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) throw new Error("ไม่สามารถสร้าง URL ของรูปได้");
  return publicUrl;
};

export function toAvailability(status: boolean | null | undefined) {
  return status === true
    ? "พร้อมเช่า"
    : "ไม่พร้อมเช่า";
}

const dayjsToDate = (v: unknown) => {
  if (v == null || v === "") return undefined;
  if (dayjs.isDayjs(v)) return (v as Dayjs).toDate();
  return v as Date | undefined;
};

export const dateRangeAvailable = z
  .object({
    startDate: z.preprocess(
      dayjsToDate,
      z.date({ error: "กรุณาเลือกวันเริ่มต้น" })
    ),
    endDate: z.preprocess(
      dayjsToDate,
      z.date({ error: "กรุณาเลือกวันสิ้นสุด" })
    ),
  })
  .superRefine((d, ctx) => {
    const today = dayjs().startOf("day").toDate();
    if (d.startDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "วันเริ่มต้นต้องไม่ย้อนหลัง",
      });
    }
    if (d.endDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "วันสิ้นสุดต้องไม่ย้อนหลัง",
      });
    }
    if (d.startDate > d.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "วันเริ่มต้องไม่เกินวันสิ้นสุด",
      });
    }
  });




const inRange = (v: number, min?: number, max?: number) =>
  (min == null || v >= min) && (max == null || v <= max);

const norm = (s: string) =>
  (s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

export function filterCars(cards: CardForUI[], f: UIRangeFilter): CardForUI[] {
  const { price, seats, gear_types, includeUnavailable = false } = f ?? {};
  const hasGear = !!(gear_types && gear_types.length);
  const gears = hasGear ? gear_types!.map(norm) : [];

  return cards.filter((c) => {
    if (!includeUnavailable && c.availability !== "พร้อมเช่า") return false;
    if (price && !inRange(c.pricePerDay, price.min, price.max)) return false;
    if (seats && !inRange(c.seats, seats.min, seats.max)) return false;
    if (hasGear && !gears.includes(norm(c.transmission))) return false;
    return true;
  });
}

export function mapDbCarToCard(c: DbCar): CardForUI {
  return {
    id: c.car_id,
    name: c.car_brand ?? "ไม่ระบุ",
    model: c.model ?? "",
    image: c.car_image ?? "",
    pricePerDay: Number(c.daily_rental_price ?? 0),
    rating: Number(c.car_conditionrating ?? 0),
    reviewCount: 0,
    seats: c.number_of_seats ?? 0,
    fuelType: c.oil_type ?? "",
    transmission: c.gear_type ?? "",
    availability: toAvailability(c.is_verified),
    features: [],
    year: (c as DbCar)?.year_created ??  undefined,
  };
}