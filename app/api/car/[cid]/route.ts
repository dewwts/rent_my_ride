import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/authServices'
import { pickDefined } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_KEYS = [
  'car_brand','model','mileage','year_created','number_of_seats',
  'gear_type','oil_type','daily_rental_price',
  'is_verified',
  'status',
  'location',
  'car_conditionrating','car_image',
] as const

type AllowedKey = (typeof ALLOWED_KEYS)[number]
type CarUpdatable = { [K in AllowedKey]: string | number | boolean | null }

/**
 * @swagger
 * /api/car/{cid}:
 *   patch:
 *     tags:
 *       - Cars
 *     summary: Update car information
 *     description: Update car information. This endpoint requires admin privileges.
 *     operationId: updateCar
 *     parameters:
 *       - name: cid
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "car_123456"
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               car_brand:
 *                 type: string
 *                 example: "Toyota"
 *               model:
 *                 type: string
 *                 example: "Camry"
 *               mileage:
 *                 type: number
 *                 example: 50000
 *               year_created:
 *                 type: number
 *                 example: 2020
 *               number_of_seats:
 *                 type: number
 *                 example: 5
 *               gear_type:
 *                 type: string
 *                 enum: ["ออโต้", "ธรรมดา"]
 *                 example: "ออโต้"
 *               oil_type:
 *                 type: string
 *                 example: "เบนซิน"
 *               daily_rental_price:
 *                 type: number
 *                 example: 1500
 *               is_verified:
 *                 type: boolean
 *                 example: true
 *               status:
 *                 type: string
 *                 example: "available"
 *               location:
 *                 type: string
 *                 example: "Bangkok"
 *               car_conditionrating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *               car_image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/car-image.jpg"
 *     responses:
 *       200:
 *         description: Car updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Car'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Admin privileges required
 *       500:
 *         description: Internal server error
 */
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