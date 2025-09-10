import { createServerSideClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";


export async function GET(request: Request){
    const supabase = await createServerSideClient()
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
        const {data: transactions, error: transactionError} = await supabaseAdmin.from('transactions').select('*').order('date', {ascending: false})
        if (transactionError){
            throw transactionError
        }
        return NextResponse.json(transactions, {status: 200});
    }catch(error:any){
        console.error("Error occurred while fetching transactions", error);
        return NextResponse.json({message:"Something went wrong"}, {status: 500})
    }
}