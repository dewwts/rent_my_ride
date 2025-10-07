import { SupabaseClient } from "@supabase/supabase-js";

// Get all renting
export const getRenting = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("renting")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

