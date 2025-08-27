import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request:NextRequest, {params}:{params:{id:String}}) {
    try{
        const {role} = await request.json()
        const userId = params.id
        if (!role || typeof role !== 'string') {
            return NextResponse.json({
                success: false,
                message: "Role is required and must be a string."
            }, {
                status: 400 
            });
        }
        const supabase = await createClient()
        
        const {data:UpdatedProfile, error:updatedError} = await supabase
            .from('user')
            .update({role:role})
            .eq('id',userId)
            .select()
            .single()
        if (updatedError){
            return NextResponse.json({
                success: false,
                message: `Failed to update user.`,
            }, {
                status: 400
            });
        }
        return NextResponse.json({
            success:true,
            data: UpdatedProfile
        },{
            status:200
        })
    }catch(err){
        console.error(err);
        return NextResponse.json({
            success:false,
            message:"Error occured while updating"
        },{
            status:500
        })
    }
    
}