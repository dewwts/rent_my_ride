"use client"
import {CarDetailsPage} from "@/components/carDetail";
import { createClient } from "@/lib/supabase/client";
import { getCarById } from "@/lib/carServices";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Car } from "@/types/carInterface";


export default function Page() {
    const params = useParams();
    const cid = params?.cid
    const router = useRouter()
    const [car, setCar] = useState<Car| null>(null)
    useEffect(()=>{
        const getCar = async()=>{
            if (typeof cid === 'string') {
                const supabase = createClient();
                const response = await getCarById(supabase, cid);
                setCar(response);
            } else if (cid) {
                router.push('/');
            }
        }
        getCar()
    })
    return (
        <>
        {(car && typeof(cid) === 'string' ) ? <CarDetailsPage car={car} cid={cid} /> : <p>Loading...</p>}      
        </>
    )
}

    