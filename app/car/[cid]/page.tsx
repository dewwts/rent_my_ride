"use client"
import {CarDetailsPage} from "@/components/carDetail";
import { createClient } from "@/lib/supabase/client";
import { getCarById } from "@/lib/carServices";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Car } from "@/types/carInterface";
import { Loader2 } from "lucide-react";


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
    },[])
    if (typeof(cid) === 'string' && car){
        return (
            <>
                <CarDetailsPage car={car} cid={cid} />
            </>
        )
    }
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">กำลังโหลดข้อมูลรถ...</p>
        </div>
      </div>
    );
    
    
}

    