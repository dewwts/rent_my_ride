// components/FilterSidebar.tsx
"use client";
import { UIRangeFilter } from "@/types/carInterface";

type Props = { value: UIRangeFilter; onChange: (v: UIRangeFilter) => void };

const PRICE = [
  { id: "p0", label: "0 – 1,000 บาท",     min: 0,    max: 1000 },
  { id: "p1", label: "1,001 – 1,500 บาท", min: 1001, max: 1500 },
  { id: "p2", label: "1,501 – 2,000 บาท", min: 1501, max: 2000 },
  { id: "p3", label: "2,001 – 4,000 บาท", min: 2001, max: 4000 },
  { id: "p4", label: "4,001+ บาท",        min: 4001, max: undefined },
];

const SEATS = [
  { id: "s4", label: "4 ที่นั่ง", min: 4, max: 4 },
  { id: "s5", label: "5 ที่นั่ง", min: 5, max: 5 },
  { id: "s7", label: "7 ที่นั่ง", min: 7, max: 7 },
];

const GEARS = ["ออโต้", "ธรรมดา"];

export default function FilterSidebar({ value, onChange }: Props) {
  // === NEW: เช็คว่ามีตัวกรองอยู่ไหม
  const hasAnyFilter =
    !!value.price ||
    !!value.seats ||
    !!(value.gear_types && value.gear_types.length) ||
    !!value.includeUnavailable;

  // === NEW: รีเซ็ตตัวกรองทั้งหมด
  const clearAll = () =>
    onChange({
      price: undefined,
      seats: undefined,
      gear_types: [],
      includeUnavailable: false,
    });

  const pickPrice = (id?: string) => {
    if (!id) return onChange({ ...value, price: undefined });
    const b = PRICE.find((x) => x.id === id)!;
    onChange({ ...value, price: { min: b.min, max: b.max } });
  };

  const pickSeats = (id?: string) => {
    if (!id) return onChange({ ...value, seats: undefined });
    const b = SEATS.find((x) => x.id === id)!;
    onChange({ ...value, seats: { min: b.min, max: b.max } });
  };

  const toggleGear = (g: string) => {
    const cur = new Set(value.gear_types ?? []);
    cur.has(g) ? cur.delete(g) : cur.add(g);
    onChange({ ...value, gear_types: [...cur] });
  };

  return (
    <aside className="w-full max-w-[280px] rounded-2xl border border-sky-400 bg-white p-4 shadow-sm">
      {/* === NEW: แถวหัวเรื่อง + ล้างทั้งหมด === */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">ตัวกรอง</h3>
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasAnyFilter}
          className="text-sky-600 text-sm hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          aria-disabled={!hasAnyFilter}
        >
          ล้างทั้งหมด
        </button>
      </div>

      {/* ราคาต่อวัน */}
      <div className="mb-5">
        <div className="font-medium mb-2 text-slate-900">ราคาต่อวัน</div>
        <ul className="space-y-2">
          {PRICE.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="price"
                className="h-4 w-4 accent-sky-600"
                checked={value.price?.min === b.min && value.price?.max === b.max}
                onChange={() => pickPrice(b.id)}
              />
              <label className="text-sm text-slate-800 cursor-pointer">{b.label}</label>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <input
              type="radio"
              name="price"
              className="h-4 w-4 accent-sky-600"
              checked={!value.price}
              onChange={() => pickPrice(undefined)}
            />
            <label className="text-sm text-slate-800 cursor-pointer">ทั้งหมด</label>
          </li>
        </ul>
      </div>

      <div className="my-4 h-px bg-slate-200" />

      {/* ระบบเกียร์ */}
      <div className="mb-5">
        <div className="font-medium mb-2 text-slate-900">ระบบเกียร์</div>
        <ul className="space-y-2">
          {GEARS.map((g) => (
            <li key={g} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded-[3px] border border-slate-400 accent-sky-600"
                checked={value.gear_types?.includes(g) ?? false}
                onChange={() => toggleGear(g)}
              />
              <label className="text-sm text-slate-800 cursor-pointer">{g}</label>
            </li>
          ))}
        </ul>
      </div>

      <div className="my-4 h-px bg-slate-200" />

      {/* จำนวนที่นั่ง */}
      <div className="mb-5">
        <div className="font-medium mb-2 text-slate-900">จำนวนที่นั่ง</div>
        <ul className="space-y-2">
          {SEATS.map((b) => (
            <li key={b.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="seats"
                className="h-4 w-4 accent-sky-600"
                checked={value.seats?.min === b.min && value.seats?.max === b.max}
                onChange={() => pickSeats(b.id)}
              />
              <label className="text-sm text-slate-800 cursor-pointer">{b.label}</label>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <input
              type="radio"
              name="seats"
              className="h-4 w-4 accent-sky-600"
              checked={!value.seats}
              onChange={() => pickSeats(undefined)}
            />
            <label className="text-sm text-slate-800 cursor-pointer">ทั้งหมด</label>
          </li>
        </ul>
      </div>

      <label className="mt-2 flex items-center gap-2">
        <input
          type="checkbox"
          className="h-4 w-4 rounded-[3px] border border-slate-400 accent-sky-600"
          checked={value.includeUnavailable ?? false}
          onChange={(e) =>
            onChange({ ...value, includeUnavailable: e.target.checked })
          }
        />
        <span className="text-sm text-slate-800">แสดงรถที่ไม่พร้อมเช่า (รวมด้วย)</span>
      </label>
    </aside>
  );
}
