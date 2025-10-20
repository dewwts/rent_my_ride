import { isAdmin } from "@/lib/authServices";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try{
        const supabase = await createClient()
        const IsAdmin = await isAdmin(supabase)
        if (!IsAdmin){
            return NextResponse.json({success: false, error: "ผู้ใช้ไม่ได้รับอนุญาตให้เข้าถึง"},{status:401})
        }
        const Adminsupabase = createAdminClient()
        const [allCountResult, pendingCountResult, doneCountResult, failedCountResult] = await Promise.all([
          Adminsupabase.from('transactions').select('*', { count: 'exact', head: true }),
          Adminsupabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
          Adminsupabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'Done'),
          Adminsupabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'Failed')
        ]);
        return NextResponse.json({
            success: true,
            all: allCountResult.count,
            pending: pendingCountResult.count,
            done: doneCountResult.count,
            failed: failedCountResult.count
        },{status:200})
    }catch(err: unknown){
        console.error(err);
        return NextResponse.json({success: false, error: "Something went wrong"},{status:500})
    }    
}