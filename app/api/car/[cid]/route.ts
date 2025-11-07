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
  'is_verified', // <-- **FIX 1: ADD THIS KEY HERE**
] as const
type AllowedKey = (typeof ALLOWED_KEYS)[number]

// **FIX 2: UPDATE THIS TYPE TO INCLUDE BOOLEAN**
type CarUpdatable = { [K in AllowedKey]: string | number | boolean | null }

export async function PATCH(
  req: Request,
  { params }: { params: { cid: string } }
) {
  try {
    const { cid } = params

    if (!cid) {
      return NextResponse.json({ success: false, error: 'cid ไม่ถูกต้อง' }, { status: 400 })
    }
    
    const supabase = await createClient()
    if (!(await isAdmin(supabase))) {
      return NextResponse.json({ success: false, error: 'ผู้ใช้ไม่ได้รับอนุญาตให้เข้าถึง' }, { status: 401 })
    }

    const body = (await req.json()) as Partial<CarUpdatable>
    const patch = pickDefined<CarUpdatable, typeof ALLOWED_KEYS>(body, ALLOWED_KEYS)

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: 'ไม่มีข้อมูลสำหรับอัปเดต' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('car_information')
      .update(patch) // 'patch' will now correctly include { is_verified: true }
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
    console.error("API Route Error:", msg)
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}