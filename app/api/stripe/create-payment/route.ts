import { NextResponse } from "next/server"
import Stripe from "stripe"

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req:Request){
    try{
        const body = await req.json()
        const {amount, rid} = body
        if (!amount || amount <= 0 || !rid) {
            return NextResponse.json({success: false, error:"ข้อมูลไม่ถูกต้อง"},{status:400})
        }
        const totalAmount = Math.round(amount * 100)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'thb',
            payment_method_types:['promptpay', 'card'],
            metadata:{
                renting_id: rid
            }
        })

        return NextResponse.json({
            success: true,
            data:{
                client_secret:paymentIntent.client_secret,
                message: "สร้างคำขอชำระเงินสำเร็จ"
            }
        })
    }catch(err: unknown){
        console.error(err);
        return NextResponse.json({success:false, error: "ไม่สามารถสร้างคำขอชำระเงินได้"}, {status:500})
    }
}