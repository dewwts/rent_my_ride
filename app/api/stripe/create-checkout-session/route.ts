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
