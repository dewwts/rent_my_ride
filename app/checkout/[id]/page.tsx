"use client"
import { CheckoutFrom } from "@/components/CheckoutForm"
import { toast } from "@/components/ui/use-toast"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import axios, { AxiosError } from "axios"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY as string)

export default function CheckoutPage(){
    const [clientSecret, setClientSecret] = useState<string>('')
    // รับเงินจาก renting process ก่อนหน้ากับ stripe id จาก renting
    const params = useParams()
    // const rid = params?.id
    const rid = "222c22a0-7057-477d-8f65-ab197edbda4a";
    const amount = 1000 // example
    const stripeid = "example_stripe_id" // example
    useEffect(()=>{
        async function createPayment(){
            try{
                const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/stripe/create-checkout-session`,{
                    amount:amount,
                    rid:rid
                })
                if (!response.data.success){
                    toast({
                        variant:"destructive",
                        title:"ไม่สำเร็จ",
                        description:response.data.error
                    })
                    return
                }
                console.log(stripePromise);
                setClientSecret(response.data.data.client_secret)
                toast({
                    variant:"success",
                    title:"สำเร็จ",
                    description:response.data.data.message
                })
            }catch(err: unknown){
                let msg = "เกิดปัญหา"
                if (err instanceof AxiosError){
                    msg = err.response?.data.error
                }else if (err instanceof Error){
                    msg = err.message
                }
                toast({
                    variant:"destructive",
                    title:"ไม่สำเร็จ",
                    description:msg
                })
            }
        }
        createPayment()
    },[])
    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const
        }
    }
    return (
        <div className=" flex flex-col justify-center items-center gap-3 p-5 sm:gap-5 lg:gap-10 h-screen">
            <h1 className=" text-center font-bold text-lg text-cyan-600">ชำระค่าเช่ารถรวม</h1>
            <p className=" text-gray-700 text-base text-center">ชำระเงินรวม {amount} บาท</p>
            {clientSecret ? 
                (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutFrom/>
                </Elements>)
                :(
                    <div className="">Loading...</div>
                )
            }
        </div>
    )
}