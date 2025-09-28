import { loginInfo, profileInfo, userInfo } from "@/types/authInterface";
import { SupabaseClient } from "@supabase/supabase-js";

export const SignUp = async(data: userInfo, supabase: SupabaseClient)=>{
    const { data: user} = await supabase.from('user_info').select('u_email').eq('u_email', data.email).single();
    if (user){throw new Error('Email already exists');}
    const { error: signupError } = await supabase.auth.signUp({
      email:data.email,
      password:data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          role: 'user'
        },
      },
    });
    if (signupError){
        throw signupError
    }
    return true
}

export const SignIn = async(data: loginInfo, supabase: SupabaseClient)=>{
    const { error: SignInError } = await supabase.auth.signInWithPassword({
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
    if (SignInError){
        throw SignInError
    }
    return true
}

export const SignOut = async(supabase: SupabaseClient)=>{
    await supabase.auth.signOut()
    return true
}

export const getRole = async(supabase: SupabaseClient)=>{ 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("ไม่เจอผู้ใช้งานนี้ในฐานข้อมูล")
    }
    const {data : row ,error: getRoleError} =await supabase
      .from("user_info")
      .select("role")
      .eq("user_id",user.id)
      .maybeSingle();
    if (getRoleError){
        throw getRoleError
    }
    return row?.role
}   
export const getFirstname = async(supabase: SupabaseClient)=>{
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user){
      const {data: userInfo, error: err} = await supabase.from('user_info').select('u_firstname').eq('user_id',user.id).single()
      if (userInfo){
        return userInfo.u_firstname
      }
      throw new Error("ไม่เจอผู้ใช้งานนี้ในฐานข้อมูล")
    }
    // throw new Error("โปรดเข้าสู่ระบบก่อนใช้งาน")
}

export const getProfile = async(supabase: SupabaseClient)=>{
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    if (!user)throw new Error("โปรดเข้าสู่ระบบก่อนใช้งาน")  
    const { data: row, error } = await supabase
      .from("user_info")
      .select("u_firstname, u_lastname, u_email, u_phone, u_address, url")
      .eq("user_id", user.id)
      .maybeSingle()    
    if (error) throw error;
    const object: profileInfo = {
        u_firstname: row?.u_firstname,
        u_lastname: row?.u_lastname,
        u_email:row?.u_email,
        u_address:row?.u_address,
        u_phone:row?.u_phone,
        url:row?.url
    }
    return object
}