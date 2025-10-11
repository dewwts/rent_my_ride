import { NextResponse } from "next/server"
import Stripe from "stripe"

export const config = {
    api:{
        body_parser: false
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || "")
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string || ""

export async function POST(req: Request){
    try{
        const body = await req.text()
        const sig = req.headers.get("stripe-signature")as string
        let event:Stripe.Event
        try{
            event = stripe.webhooks.constructEvent(body, sig,webhookSecret)
        }catch(err: unknown){
            console.error(err);
            return NextResponse.json({success: false, error: "Invalid signature"},{status:400})
        }
        while(event.type){
            if (event.type === 'payment_intent.succeeded'){
                const success_payment = event.data.object
                // add logic update database here
            }else if (event.type === 'payment_intent.payment_failed'){
                const failed_payment = event.data.object
                // add logic update database here
            }else{
                console.log(`Unhandled event type ${event.type}`);
            }
        }
        return NextResponse.json({success:true, messsage: "การจ่ายเงินสำเร็จ"},{status:200})
    }catch(err: unknown){
        console.error(err);
        return NextResponse.json({
            success: false,
            error:"Webhook ผิดพลาด"
        })
    }
}