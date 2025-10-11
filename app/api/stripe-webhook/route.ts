import { createClient } from "@/lib/supabase/server"
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
        const supabase = await createClient()
        const body = await req.text()
        const sig = req.headers.get("stripe-signature")as string
        let event:Stripe.Event
        try{
            event = stripe.webhooks.constructEvent(body, sig,webhookSecret)
        }catch(err: unknown){
            console.error(err);
            return NextResponse.json({success: false, error: "Invalid signature"},{status:400})
        }
        if (event.type === 'payment_intent.succeeded'){
            const success_payment = event.data.object
            const amount = success_payment.amount / 100;
            const renting_id = success_payment.metadata.renting_id
            if (!renting_id || !amount || amount <= 0){
                return NextResponse.json({success: false, error: "ข้อมูลไม่ถูกต้อง"},{status:400})
            }
            const {error: update_error} = await supabase.rpc('update_transaction_and_renting',{
                p_rid: renting_id,
                p_amount: amount,
                p_payment_intent_id: success_payment.id
            })
            if (update_error){
                console.error(update_error)
                return NextResponse.json({success: false, error:"เกิดความขัดข้องการบันทึกข้อมูล"},{status:500})
            }
        }else if (event.type === 'payment_intent.payment_failed'){
            const failed_payment = event.data.object
            const renting_id = failed_payment.metadata.renting_id
            const { error: update_error } = await supabase
                .from('renting')
                .update({ status: 'Failed' })
                .eq('renting_id', renting_id);
            if (update_error) {
                console.error('Supabase Update Error:', update_error);
                return NextResponse.json({ success: false, error: "เกิดความขัดข้องการอัปเดตสถานะ" }, { status: 500 });
            }
            return NextResponse.json({
                success: false,
                message: "อัปเดตข้อมูลการชำระเงินที่ล้มเหลวแล้ว"
            },{status:200})
            }else{
                console.log(`Unhandled event type ${event.type}`);
                return NextResponse.json({success: false, message: "Unhandled event type"},{status:200})
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