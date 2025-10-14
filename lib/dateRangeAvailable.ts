// src/lib/validation/dateRangeSchema.ts
import { z } from "zod";
import dayjs, { Dayjs } from "dayjs";

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
