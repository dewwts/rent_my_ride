
import { isAdmin } from "@/lib/authServices";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest){
    const supabase = await createClient()
    const IsAdmin = await isAdmin(supabase)
    if (!IsAdmin){
        return NextResponse.json({success: false, error: "ผู้ใช้ไม่ได้รับอณุญาติให้เข้าถึง"},{status:401})
    }
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    console.log(page);
    const limit = parseInt(searchParams.get('limit')|| '5', 10)
    console.log(limit);
    const filter = searchParams.get('filter')
    const Adminsupabase = createAdminClient()
    let countQuery = Adminsupabase.from('transactions').select('*', { count: 'exact', head: true });

    if (filter && filter !== 'all') {
      countQuery = countQuery.eq('status', filter.charAt(0).toUpperCase() + filter.slice(1));
    }
    const { count, error: countError } = await countQuery;
    if (countError) {
      console.error('Error counting transactions:', countError);
      return NextResponse.json({
        success: false,
        error: "Failed to access Database"
      }, {status:500})
    }
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;
    let dataQuery = Adminsupabase.from('transactions')
      .select(`
        transaction_id,
        renting_id,
        lessee_id,
        lessor_id,
        amount,
        status,
        transaction_date,
        renting:renting_id (
          sdate,
          edate,
          status,
          car_information:car_id (
            car_brand,
            model,
            year_created,
            car_image
          )
        ),
        lessee_info:lessee_id (
          u_firstname,
          u_lastname
        ),
        lessor_info:lessor_id (
          u_firstname,
          u_lastname
        )
    `);
    if ( filter && filter !== 'all') {
      dataQuery = dataQuery.eq('status', filter.charAt(0).toUpperCase() + filter.slice(1));
    }
    const { data, error: fetchError } = await dataQuery
      .order('transaction_date', { ascending: false })
      .range(startIndex, endIndex);
    if (fetchError) {
      console.error('Error fetching transactions:', fetchError);
      return NextResponse.json({
          success: false,
          error: 'เกิดข้อผิดพลาดในการโหลดข้อมูลธุรกรรม'
      },{status: 500})
    }
    const totalPages = Math.ceil((count ?? 0) / limit);
    return NextResponse.json({
        success: true,
        pagination: {
            currentPage: page,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
            totalPages: totalPages,
            totalItems: count
        },
        data: data
    }, { status: 200 });
}