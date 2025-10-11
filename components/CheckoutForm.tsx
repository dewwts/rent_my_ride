import { useElements, useStripe, Elements, PaymentElement } from "@stripe/react-stripe-js"
import { useState } from "react"
import { Button } from "./ui/button"
import { toast } from "./ui/use-toast"

export function CheckoutFrom(){
    const stripe = useStripe()
    const elements = useElements()
    const [message, setMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const handleSubmit = async(e: React.FormEvent)=>{
        e.preventDefault()
        if (!stripe || !elements){
            console.error("stripe and elements not found");
            return
        }
        setIsLoading(true)
        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams:{
                return_url: `${window.location.origin}/success`
            }
        })
        if (error){
            toast({
                variant:"destructive",
                title:"ไม่สำเร็จ",
                description:error.message
            })
            setMessage(error.message || "เกิดข้อผิดพลาด")
            setIsLoading(false)
            return
        }
        setIsLoading(false)
        toast({
            variant:"success",
            title:"สำเร็จ",
            description:"ชำระเงินสำเร็จ"
        })
    }
    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element"/>
            <Button variant={"secondary"} size={"lg"} className="w-full mt-4" disabled={isLoading || !stripe || !elements} type="submit">
                {isLoading ? <div className="loader h-4 w-4 border-white"></div> : "ชำระเงิน"}
            </Button>
            {message && 
                <div id="payment-message" className="text-sm text-center mt-4">{message}</div>
            }
        </form>
    )
}