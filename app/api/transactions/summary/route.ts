import { isAdmin } from "@/lib/authServices";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/transactions/summary:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Get transaction summary counts
 *     description: Get summary counts of transactions by status. This endpoint requires admin privileges.
 *     operationId: getTransactionSummary
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 all:
 *                   type: integer
 *                   description: Total number of transactions
 *                   example: 150
 *                 pending:
 *                   type: integer
 *                   description: Number of pending transactions
 *                   example: 10
 *                 done:
 *                   type: integer
 *                   description: Number of completed transactions
 *                   example: 130
 *                 failed:
 *                   type: integer
 *                   description: Number of failed transactions
 *                   example: 10
 *       401:
 *         description: Unauthorized - Admin privileges required
 *       500:
 *         description: Internal server error
 */
export async function GET() {
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