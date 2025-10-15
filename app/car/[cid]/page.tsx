
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {CarDetailsPage} from "@/components/carDetail";
import { createClient } from "@/lib/supabase/client";
import { getCarById } from "@/lib/carServices";


export default async function Page({params}:{params:{cid:string}}) {
    const {cid} = params;
    const car = await getCarById(createClient(), cid);
    console.log(car);
    return (
        <>
        <Header />
        <CarDetailsPage cid={cid} car={car} />
        
        <Footer />
        </>
    )
}

    