import { NextResponse } from "next/server"
import Stripe from "stripe"

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

if (!process.env.NEXT_PUBLIC_SERVER_URL) {
    throw new Error('NEXT_PUBLIC_SERVER_URL is not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

/**
 * @swagger
 * /api/stripe/create-checkout-session:
 *   post:
 *     tags:
 *       - Stripe
 *     summary: Create Stripe checkout session
 *     description: Creates a Stripe checkout session for a rental payment. Supports both card and PromptPay payment methods.
 *     operationId: createCheckoutSession
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - rid
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in THB
 *                 minimum: 0.01
 *                 example: 5000
 *               rid:
 *                 type: string
 *                 description: Renting ID
 *                 example: "rent_123456"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: string
 *                       example: "cs_test_1234567890"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://checkout.stripe.com/c/pay/cs_test_1234567890"
 *                     message:
 *                       type: string
 *                       example: "สร้าง Checkout Session สำเร็จ"
 *       400:
 *         description: Bad request - Invalid amount or missing renting ID
 *       500:
 *         description: Internal server error
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { amount, rid } = body

        if (!amount || amount <= 0 || !rid) {
            return NextResponse.json({ success: false, error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 })
        }
        console.log("run checkout");
        // สร้าง Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'promptpay'],
            line_items: [
                {
                    price_data: {
                        currency: 'thb',
                        product_data: {
                            name: 'ค่าเช่ารถ',
                            description: `Renting ID: ${rid}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/${rid}/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/checkout/${rid}/cancle`,
            metadata: {
                renting_id: rid
            }
        })
        console.log('Checkout session created:', session.id)
        return NextResponse.json({
            success: true,
            data: {
                session_id: session.id,
                url: session.url,
                message: "สร้าง Checkout Session สำเร็จ"
            }
        })
    } catch (err: unknown) {
        console.error('Create checkout session error:', err)
        return NextResponse.json({ success: false, error: "ไม่สามารถสร้าง Checkout Session ได้" }, { status: 500 })
    }
}
