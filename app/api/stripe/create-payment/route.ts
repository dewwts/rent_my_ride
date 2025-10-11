import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || "")

export async function POST(req:Request){
    try{
        const body = await req.json()
        const {aid, amount, renting_id} = body
        if (!amount || !aid || amount <= 0) {
            return NextResponse.json({success: false, error:"ข้อมูลไม่ถูกต้อง"},{status:400})
        }
        const totalAmount = Math.round(amount * 100)
        const fee = Math.round(totalAmount * 0.05)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'thb',
            payment_method_types:['promptpay'],
            application_fee_amount: fee,
            // transfer_data:{
            //     destination: aid
            // },
            metadata:{
                amount:amount as string,
                renting_id:renting_id
            }
        },{
            stripeAccount:aid
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