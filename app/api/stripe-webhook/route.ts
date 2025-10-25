import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import Stripe from "stripe"

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables')
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined in environment variables')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request){
    try{
        const supabase = await createClient()
        const body = await req.text()
        const sig = req.headers.get("stripe-signature") as string

        if (!sig) {
            return NextResponse.json({success: false, error: "No signature found"},{status:400})
        }

        let event: Stripe.Event
        
        try{
            event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
        }catch(err: unknown){
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({success: false, error: "Invalid signature"},{status:400})
        }
        console.log('Webhook event received:', event.type)

        // Handle Checkout Session completion (สำคัญสำหรับ Checkout Session flow)
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session
            const renting_id = session.metadata?.renting_id
            const amount = (session.amount_total || 0) / 100

            console.log('Checkout session completed:', {renting_id, amount, session_id: session.id})

            if (!renting_id || !amount || amount <= 0){
                console.error('Invalid checkout session data:', {renting_id, amount})
                return NextResponse.json({success: false, error: "ข้อมูลไม่ถูกต้อง"},{status:400})
            }

            // Get renting information
            const {data: rentingData, error: rentingError} = await supabase
                .from('renting')
                .select('lessee_id, car_id')
                .eq('renting_id', renting_id)
                .single()

            if (rentingError || !rentingData){
                console.error('Failed to get renting data:', rentingError)
                return NextResponse.json({success: false, error:"ไม่พบข้อมูลการเช่า"},{status:404})
            }

            // Get car owner
            const {data: carData, error: carError} = await supabase
                .from('car_information')
                .select('owner_id')
                .eq('car_id', rentingData.car_id)
                .single()

            if (carError || !carData){
                console.error('Failed to get car data:', carError)
                return NextResponse.json({success: false, error:"ไม่พบข้อมูลรถ"},{status:404})
            }

            // Update renting status
            const {error: rentingUpdateError} = await supabase
                .from('renting')
                .update({ status: 'Confirmed' })
                .eq('renting_id', renting_id)

            if (rentingUpdateError) {
                console.error('Failed to update renting status:', rentingUpdateError)
                return NextResponse.json({success: false, error:"เกิดความขัดข้องการอัปเดตสถานะการเช่า"},{status:500})
            }

            // Create transaction record
            const {error: transactionError} = await supabase
                .from('transactions')
                .insert({
                    renting_id: renting_id,
                    lessee_id: rentingData.lessee_id,
                    lessor_id: carData.owner_id,
                    amount: amount,
                    status: 'Done',
                    stripe_payment_intent_id: session.payment_intent as string
                })

            if (transactionError){
                console.error('Failed to create transaction:', transactionError)
                return NextResponse.json({success: false, error:"เกิดความขัดข้องการบันทึกธุรกรรม"},{status:500})
            }

            console.log('Checkout payment processed successfully')
            return NextResponse.json({success:true, message: "การจ่ายเงินสำเร็จ"},{status:200})

        } else if (event.type === 'payment_intent.succeeded'){
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const amount = paymentIntent.amount / 100
            const renting_id = paymentIntent.metadata.renting_id

            console.log('Payment succeeded:', {renting_id, amount, payment_intent_id: paymentIntent.id})

            if (!renting_id || !amount || amount <= 0){
                console.error('Invalid payment data:', {renting_id, amount})
                return NextResponse.json({success: false, error: "ข้อมูลไม่ถูกต้อง"},{status:400})
            }
            
            // Get renting information to find lessee and lessor
            const {data: rentingData, error: rentingError} = await supabase
                .from('renting')
                .select('lessee_id, car_id')
                .eq('renting_id', renting_id)
                .single()

            if (rentingError || !rentingData){
                console.error('Failed to get renting data:', rentingError)
                return NextResponse.json({success: false, error:"ไม่พบข้อมูลการเช่า"},{status:404})
            }

            // Get car owner (lessor)
            const {data: carData, error: carError} = await supabase
                .from('car_information')
                .select('owner_id')
                .eq('car_id', rentingData.car_id)
                .single()

            if (carError || !carData){
                console.error('Failed to get car data:', carError)
                return NextResponse.json({success: false, error:"ไม่พบข้อมูลรถ"},{status:404})
            }

            // Update renting status to Confirmed
            const {error: rentingUpdateError} = await supabase
                .from('renting')
                .update({ status: 'Confirmed' })
                .eq('renting_id', renting_id)

            if (rentingUpdateError) {
                console.error('Failed to update renting status:', rentingUpdateError)
                return NextResponse.json({success: false, error:"เกิดความขัดข้องการอัปเดตสถานะการเช่า"},{status:500})
            }

            // Create transaction record
            const {error: transactionError} = await supabase
                .from('transactions')
                .insert({
                    renting_id: renting_id,
                    lessee_id: rentingData.lessee_id,
                    lessor_id: carData.owner_id,
                    amount: amount,
                    status: 'Done',
                    stripe_payment_intent_id: paymentIntent.id
                })

            if (transactionError){
                console.error('Failed to create transaction:', transactionError)
                return NextResponse.json({success: false, error:"เกิดความขัดข้องการบันทึกธุรกรรม"},{status:500})
            }

            console.log('Payment processed successfully')
            return NextResponse.json({success:true, message: "การจ่ายเงินสำเร็จ"},{status:200})

        } else if (event.type === 'payment_intent.payment_failed'){
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const renting_id = paymentIntent.metadata.renting_id

            console.log('Payment failed:', {renting_id, payment_intent_id: paymentIntent.id})

            if (!renting_id) {
                return NextResponse.json({success: false, error: "ไม่พบข้อมูลการเช่า"},{status:400})
            }

            // Update renting status to Cancelled
            const { error: updateError } = await supabase
                .from('renting')
                .update({ status: 'Cancelled' })
                .eq('renting_id', renting_id)

            if (updateError) {
                console.error('Failed to update renting status on payment failure:', updateError)
                return NextResponse.json({ success: false, error: "เกิดความขัดข้องการอัปเดตสถานะ" }, { status: 500 })
            }

            // Create failed transaction record
            const {data: rentingData} = await supabase
                .from('renting')
                .select('lessee_id, car_id')
                .eq('renting_id', renting_id)
                .single()

            if (rentingData) {
                const {data: carData} = await supabase
                    .from('car_information')
                    .select('owner_id')
                    .eq('car_id', rentingData.car_id)
                    .single()

                if (carData) {
                    await supabase.from('transactions').insert({
                        renting_id: renting_id,
                        lessee_id: rentingData.lessee_id,
                        lessor_id: carData.owner_id,
                        amount: paymentIntent.amount / 100,
                        status: 'Failed',
                        stripe_payment_intent_id: paymentIntent.id
                    })
                }
            }

            return NextResponse.json({
                success: true,
                message: "อัปเดตข้อมูลการชำระเงินที่ล้มเหลวแล้ว"
            },{status:200})

        } else {
            console.log(`Unhandled event type: ${event.type}`)
            return NextResponse.json({success: true, message: "Event received"},{status:200})
        }
    }catch(err: unknown){
        console.error('Webhook error:', err)
        return NextResponse.json({
            success: false,
            error:"Webhook ผิดพลาด"
        }, {status:500})
    }
}