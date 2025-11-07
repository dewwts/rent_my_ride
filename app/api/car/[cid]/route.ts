// app/api/car/[car_id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/authServices'
import { pickDefined } from '@/lib/utils'


const ALLOWED_KEYS = [
  'car_brand',
  'model',
  'mileage',
  'year_created',
  'number_of_seats',
  'gear_type',
  'oil_type',
  'daily_rental_price',
  'status',
  'location',
  'car_conditionrating',
  'car_image',
] as const
type AllowedKey = (typeof ALLOWED_KEYS)[number]
type CarPatch = Partial<Record<AllowedKey, string | number >>
// PATCH /api/car/:car_id  → partial update
export async function PATCH(
  req: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // 1) ตรวจสิทธิ์แอดมิน (ใช้ client ปกติ)
    const supabase = await createClient()
    const is_admin = await isAdmin(supabase)
    if (!is_admin) {
      return NextResponse.json(
        { success: false, error: 'ผู้ใช้ไม่ได้รับอนุญาตให้เข้าถึง' },
        { status: 401 }
      )
    }

    const carId = params.cid
    if (!carId) {
      return NextResponse.json(
        { success: false, error: 'car_id ไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const body = await req.json()

    const patch = pickDefined<CarPatch, typeof ALLOWED_KEYS>(body, ALLOWED_KEYS)

    /*const patch = pickDefined(body, ALLOWED_KEYS as unknown as string[]) as Partial<
      Record<AllowedKey, any>
    >*/

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่มีข้อมูลสำหรับอัปเดต' },
        { status: 400 }
      )
    }

    // 3) ใช้ admin client (SERVICE_ROLE_KEY) ทำอัปเดตข้าม RLS
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('car_information')
      .update(patch)          
      .eq('car_id', carId)
      .select()
      .single()

    if (error) {
      console.error('Update car error:', error)
      return NextResponse.json(
        { success: false, error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลรถ' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data }, { status: 200 })
  } catch (err: unknown) {
    console.error('update car error:', err)
    return NextResponse.json(
      { success: false, error:'Server error' },
      { status: 500 }
    )
  }
}
