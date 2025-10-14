
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {CarDetailsPage} from "@/components/carDetail";


export default async function Page({params}:{params:{cid:string}}) {
    const {cid} = await params;
    return (
        <>
        <Header />
        <CarDetailsPage cid={cid}/>
        <Footer />
        </>
    )
}

    