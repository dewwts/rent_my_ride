import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = createClient();

  const { user_id, firstName, lastName, phone, address } = body;

  const { data, error } = await supabase
    .from("User_info")
    .update({
      U_FirstName: firstName,
      U_LastName: lastName,
      U_Phone: phone,
      U_Address: address
    })
    .eq("User_id", user_id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });

  return new Response(JSON.stringify({ success: true, data }), { status: 200 });
}