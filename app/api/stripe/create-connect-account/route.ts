import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string || "")

export async function POST(){
    try{
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'TH',
            capabilities:{
                card_payments: {requested: true},
                promptpay_payments: {requested: true}
            },
            business_type: 'individual'
        })
        // เก็บ account id ใส่ใน database
        const supabase = await createClient()
        const user = await supabase.auth.getUser()
        if (!user.data.user){
            return NextResponse.json({success: false, error: "โปรดเข้าสู่ระบบก่อน"},{status:401})
        }
        const {error: update_error} = await supabase.from('user_info').update({
            stripe_account_id: account.id
        }).eq('user_id', user.data.user.id)
        if (update_error){
            console.error(update_error)
            return NextResponse.json({
                success: false,
                error: "เกิดความขัดข้องกับระบบ"
            },{status:500})
        }
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/onboard-client?reauth=true`,
            return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/onboard-success-?account=${account.id}`,
            type: 'account_onboarding'
        })
        if (!accountLink.url){
            return NextResponse.json({
                success: false,
                error: "เกิดความขัดข้องกับระบบชำระเงิน"
            },{status:500})
        }
        return NextResponse.json({success: true, data:{
            url: accountLink.url,
            aid: account.id
        }},{status:200})
    }catch(err: unknown){
        console.error(err);
        return NextResponse.json({
            success: false,
            error: "ไม่สามารถสร้างบัญชีเชื่อมต่อได้"
        }, {status:500})
    }
    
}