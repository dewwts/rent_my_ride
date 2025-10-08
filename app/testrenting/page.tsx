"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRentings,createRenting,updateRenting,setRentingStatus,getRentingById} from "@/lib/rentingServices";
export default function TestRentingPage() {
  const [result, setResult] = useState<any>(null);

  const handleTest = async () => {
    const supabase = createClient();
    // const newRenting = await createRenting(supabase, {
    //     car_id: "aa12a0ac-36ca-42f3-8b05-4e9509342b3e",
    //     sdate: "2025-10-08",
    //     edate: "2025-10-15",
    //     status: "Pending"
    // });
    // const updaterenting = await updateRenting(supabase,"33803ff0-89ed-4ab4-a45d-f93ba7bb2b41",{
    //     sdate: "2025-10-30",
    //     edate: "2025-10-31"
    // });
    // console.log(updaterenting);
    // // console.log(newRenting);
    // const data = await getRentings(supabase);
    // setResult(data);
    // console.log(data)
  };

  return (
    <div className="p-4">
      <button
        onClick={handleTest}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        ทดสอบ getRentings
      </button>
      <pre className="mt-4 bg-gray-100 p-3 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}