import { createServerSideClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";


export async function GET(request: Request){
    const supabase = await createServerSideClient()
    const {searchParams} = new URL(request.url)
    const pageStr = searchParams.get('page')
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const startAt = (page-1)*10
    const endAt = startAt + 9
    try{
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user){
            return NextResponse.json({message: "User not found"}, {status: 401})
        }
        const {data: userInfo, error: userError} = await supabase.from('user_info').select('role').eq('user_id',user.id).single()
        if (userError || !userInfo){
            throw userError
        }
        if (userInfo.role !== 'admin'){
            return NextResponse.json({message: "Unauthorized"}, {status: 401})
        }
        const supabaseAdmin = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
        const {data: transactions, error: transactionError, count} = await supabaseAdmin.from('transactions').select(`*
            ,renting:renting_id(
                renting_id,
                sdate,
                edate,
                car_information(
                    car_image,
                    car_brand,
                    model
                )
                
            ),
            lessee:lessee_id(
                u_firstname,
                u_lastname
            ),
            lessor:lessor_id(
                u_firstname,
                u_lastname
            )`, {count:'exact'}).order('date', {ascending: false}).range(startAt,endAt)
        if (transactionError){
            throw transactionError
        }
        return NextResponse.json({
            data:transactions,
            count:count,
            nextPage: endAt < (count ?? 0) ? page+1:-1,
            prevPage:startAt > 0 ? page-1:-1,
        }, {status: 200});
    }catch(error:any){
        console.error("Error occurred while fetching transactions", error);
        return NextResponse.json({message:"Something went wrong",count:0,nextPage:-1,prevPage:-1}, {status: 500})
    }
}

// You have to let endpoint have to had page before request
// The response will return total record and also return nextPage and prevPage to ensure consistensy and database failed
// count use for let client side know how many page should show to client
// if nextpage be -1 mean not have record more 
// if prevPage be -1 mean now is page 1 you can't go previous more 