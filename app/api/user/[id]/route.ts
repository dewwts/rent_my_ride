import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
/**
 * @description API Route สำหรับอัปเดต Role ของผู้ใช้ (User) by admin
 * @method PUT
 * @route /api/users/[id]
 * @param {NextRequest} request - Object ของ request ที่เข้ามา
 * @param {object} params - Object ที่มี dynamic route parameters
 * @param {string} params.id - ID ของผู้ใช้ที่ต้องการอัปเดต
 * @body {{ role: string }} - ข้อมูล role ใหม่ที่ต้องการกำหนดให้กับผู้ใช้
 * * @returns {NextResponse}
 * - กรณีสำเร็จ (200): มี { success: true, data: UpdatedProfile }
 * - กรณีข้อมูลไม่ถูกต้อง (400): มี { success: false, message: "..." }
 * - กรณี Server Error (500): มี { success: false, message: "..." }
 */
export async function PUT(request:NextRequest, {params}:{params:{id:String}}) {
    try{
        const {role} = await request.json()
        const userId = params.id;
        if (!role || typeof role !== 'string') {
            return NextResponse.json({
                success: false,
                message: "Role is required and must be a string."
            }, {
                status: 400 
            });
        }
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )
        console.log(userId);
        const {data:UpdatedProfile, error:updatedError} = await supabase
            .from('user_info')
            .update({role:role})
            .eq('user_id',userId)
            .select()
            .single()
        if (updatedError){
            return NextResponse.json({
                success: false,
                message: `Failed to update user id: ${userId}`,
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

