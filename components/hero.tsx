"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search, MapPin, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { carAvailable } from "@/lib/carServices";
import dayjs from "dayjs";
import { DbCar } from "@/types/carInterface";

// ------------------ Helpers ------------------
// (1) ยืนยันซ้ำ: เช็ค overlap แบบ DATE-to-DATE + กรองสถานะ Pending/Confirmed
async function hasDateOverlapPendingOrConfirmed(
  supabase: ReturnType<typeof createClient>,
  carId: string,
  startAt: Date,
  endAt: Date
) {
  const startDATE = dayjs(startAt).format("YYYY-MM-DD");
  const endExclusiveDATE = dayjs(endAt).format("YYYY-MM-DD");

  const { data, error } = await supabase
    .from("renting")
    .select("renting_id")
    .eq("car_id", carId)
    .in("status", ["Pending", "Confirmed"])
    .gt("edate", startDATE)
    .lt("sdate", endExclusiveDATE);

  if (error) return true; // กันพลาด: เช็คไม่ได้ให้ถือว่าทับ
  return (data?.length ?? 0) > 0;
}

async function fetchLocationOptions(supabase: ReturnType<typeof createClient>): Promise<string[]> {
  const { data, error } = await supabase
    .from("car_information")
    .select("location")
    .not("location", "is", null);

  if (error) return [];
  const all = (data ?? [])
    .map((r: any) => (r.location ?? "").trim())
    .filter(Boolean);

  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}

// (3) เลือก “ยอดนิยม” ง่าย ๆ จากรายการทั้งหมด (หน้าบ้าน)
function pickPopularLocations(all: string[], n = 6): string[] {
  return all.slice(0, n);
}

// ------------------ Component ------------------
export function Hero() {
  // state
  const [location, setLocation] = useState("");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // UI: autocomplete locations
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [openSuggest, setOpenSuggest] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createClient(), []);

  // load locations once
  useEffect(() => {
    fetchLocationOptions(supabase).then(setAllLocations).catch(() => {});
  }, [supabase]);

  // filter suggestions
  const suggestions = useMemo(() => {
    const q = location.trim().toLowerCase();
    if (!q) return allLocations.slice(0, 10);
    return allLocations.filter((loc) => loc.toLowerCase().includes(q)).slice(0, 10);
  }, [location, allLocations]);

  const popular = useMemo(() => pickPopularLocations(allLocations), [allLocations]);

  // close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpenSuggest(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // keyboard navigation
  const onLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!openSuggest && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpenSuggest(true);
      setActiveIndex(0);
      return;
    }
    if (!openSuggest) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + Math.max(1, suggestions.length)) % Math.max(1, suggestions.length));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        setLocation(suggestions[activeIndex]);
        setOpenSuggest(false);
      }
    } else if (e.key === "Escape") {
      setOpenSuggest(false);
    }
  };

  // ------------------ Search handler ------------------
  const onSearch = async () => {
    if (!start || !end) {
      alert("กรุณาเลือกวันที่รับและคืนรถ");
      return;
    }

    // หน้าต่าง [start, endExclusive)
    const startAt = dayjs(start).startOf("day").toDate();
    const endAt = dayjs(end).add(1, "day").startOf("day").toDate();

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      alert("รูปแบบวันที่ไม่ถูกต้อง");
      return;
    }
    if (startAt >= endAt) {
      alert("วันเริ่มต้องไม่เกินวันสิ้นสุด");
      return;
    }

    try {
      setLoading(true);

      // 1) ค้นรถตามสถานที่ (ilike)
      let query = supabase
        .from("car_information")
        .select(
          "car_id, car_brand, model, car_image, daily_rental_price, car_conditionrating, number_of_seats, oil_type, gear_type, status, location"
        );

      if (location.trim()) {
        query = query.ilike("location", `%${location.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      const cars = (data ?? []) as DbCar[];

      // 2) เช็คว่างรอบแรกด้วย carAvailable (TS/ISO logic)
      const flags = await Promise.all(
        cars.map((c) => carAvailable(supabase, c.car_id, startAt, endAt))
      );
      const availableCars = cars.filter((_, i) => flags[i] === true);

      // 3) ยืนยันซ้ำแบบ DATE-only + สถานะที่ถือว่า "จองจริง"
      const verifyFlags = await Promise.all(
        availableCars.map((c) =>
          hasDateOverlapPendingOrConfirmed(supabase, c.car_id, startAt, endAt)
        )
      );
      const verifiedCars = availableCars.filter((_, i) => verifyFlags[i] === false);

      // 4) ส่งผลลัพธ์ให้ HomeClient
      window.dispatchEvent(
        new CustomEvent("cars:search-results", {
          detail: {
            cars: verifiedCars,
            meta: { location, start, end },
          },
        })
      );
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "เกิดข้อผิดพลาดขณะค้นหา");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ UI (your original look & feel, now wired up) ------------------
  return (
    <div className="w-full max-w-5xl mx-auto text-center space-y-8">
      {/* Hero Text - More minimal */}
      <div className="space-y-4">
        <h1 className="font-medium text-4xl md:text-5xl text-black">
          เช่ารถง่าย ใช้ได้จริง
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto">
          เลือกรถที่ใช่ สำหรับทุกการเดินทาง
        </p>
      </div>

      {/* Modern Search Bar - Simplified */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Location Input + suggestions */}
          <div className="flex-1 relative" ref={boxRef}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              placeholder="เลือกสถานที่รับรถ"
              className="pl-10 h-12 border-gray-200 focus:border-black focus:ring-0"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setOpenSuggest(true);
              }}
              onFocus={() => setOpenSuggest(true)}
              onKeyDown={onLocationKeyDown}
            />

            {/* Suggestions dropdown */}
            {openSuggest && suggestions.length > 0 && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow">
                <ul className="max-h-64 overflow-auto py-2">
                  {suggestions.map((s, i) => (
                    <li
                      key={s + i}
                      className={`px-3 py-2 text-left cursor-pointer ${
                        i === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLocation(s);
                        setOpenSuggest(false);
                      }}
                      onMouseEnter={() => setActiveIndex(i)}
                    >
                      {s}
                    </li>
                  ))}
                </ul>

                {/* Popular quick chips */}
                {popular.length > 0 && (
                  <div className="border-t px-3 py-2 text-left">
                    <div className="text-xs text-gray-500 mb-2">ยอดนิยม</div>
                    <div className="flex flex-wrap gap-2">
                      {popular.map((p) => (
                        <button
                          key={p}
                          className="text-sm px-2 py-1 rounded-full border hover:bg-gray-50"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setLocation(p);
                            setOpenSuggest(false);
                          }}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-4 lg:flex-1">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 h-12 border-gray-200 focus:border-black focus:ring-0"
                value={start}
                min={dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="date"
                className="pl-10 h-12 border-gray-200 focus:border-black focus:ring-0"
                value={end}
                min={start || dayjs().format("YYYY-MM-DD")}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Search Button */}
          <Button
            variant="default"
            size="lg"
            onClick={onSearch}
            disabled={loading}
            className="h-12"
          >
            <Search className="h-5 w-5 mr-2" />
            {loading ? "กำลังค้นหา..." : "ค้นหา"}
          </Button>
        </div>
      </div>
    </div>
  );
}
