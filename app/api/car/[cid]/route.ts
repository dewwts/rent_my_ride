// app/api/car/[cid]/route.ts
import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/authServices'
import { pickDefined } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_KEYS = [
  'car_brand','model','mileage','year_created','number_of_seats',
  'gear_type','oil_type','daily_rental_price','status','location',
  'car_conditionrating','car_image',
] as const
type AllowedKey = (typeof ALLOWED_KEYS)[number]
type CarUpdatable = { [K in AllowedKey]: string | number | null }

export async function PATCH(req: Request, ctx: unknown) {
  const { cid } = (ctx as { params: { cid: string } }).params

  try {
    const supabase = await createClient()
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ success: false, error: 'ผู้ใช้ไม่ได้รับอนุญาตให้เข้าถึง' }, { status: 401 })
    }

    if (!cid) {
      return NextResponse.json({ success: false, error: 'cid ไม่ถูกต้อง' }, { status: 400 })
    }

    const body = (await req.json()) as Partial<CarUpdatable>
    const patch = pickDefined<CarUpdatable, typeof ALLOWED_KEYS>(body, ALLOWED_KEYS)

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่มีข้อมูลสำหรับอัปเดต' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('car_information')
      .update(patch)
      .eq('car_id', cid)
      .select()
      .single()

    if (error) {
      console.error('Update car error:', error)
      return NextResponse.json({ success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลรถ' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}