import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import Stripe from 'stripe';

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
 * /api/stripe/create-connect-account:
 *   post:
 *     tags:
 *       - Stripe
 *     summary: Create or retrieve Stripe Connect account
 *     description: Creates a new Stripe Connect Express account for a user or retrieves an existing account link for onboarding. This is used for owner payouts.
 *     operationId: createConnectAccount
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account created or account link retrieved successfully
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
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://connect.stripe.com/setup/c/..."
 *                     aid:
 *                       type: string
 *                       example: "acct_1234567890"
 *       401:
 *         description: Unauthorized - User must be logged in
 *       500:
 *         description: Internal server error
 */
export async function POST(){
    try{
        // เช็คว่า user login แล้วหรือยัง
        const supabase = await createClient()
        const user = await supabase.auth.getUser()
        if (!user.data.user){
            return NextResponse.json({success: false, error: "โปรดเข้าสู่ระบบก่อน"},{status:401})
        }

        // เช็คว่ามี stripe account อยู่แล้วหรือไม่
        const {data: existingUser} = await supabase
            .from('user_info')
            .select('stripe_account_id')
            .eq('user_id', user.data.user.id)
            .single()

        if (existingUser?.stripe_account_id) {
            // มี account แล้ว ให้สร้าง account link ใหม่
            const accountLink = await stripe.accountLinks.create({
                account: existingUser.stripe_account_id,
                refresh_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/onboard-client?reauth=true`,
                return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/onboard-success?account=${existingUser.stripe_account_id}`,
                type: 'account_onboarding'
            })
            return NextResponse.json({
                success: true,
                data: {
                    url: accountLink.url,
                    aid: existingUser.stripe_account_id
                }
            },{status:200})
        }

        // สร้าง stripe account ใหม่
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'TH',
            capabilities:{
                transfers: {requested: true}
            },
            business_type: 'individual'
        })
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
            return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/onboard-success?account=${account.id}`,
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