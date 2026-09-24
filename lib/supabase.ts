import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ykeuhzossgqmjrpkejev.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_HwTLbkvbF6gk08WwVrFWQg_KwEfRh0Z";

export const supabase = createClient(url, key);
