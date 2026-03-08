import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  old_price: number | null;
  image_url: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  image_url_4: string | null;
  image_url_5: string | null;
  created_at: string;
  updated_at: string;
};

export type Promo = {
  id: number;
  title: string;
  text: string;
  btn1_text: string;
  btn1_url: string;
  btn2_text: string;
  btn2_url: string;
  emoji1: string;
  emoji2: string;
  emoji3: string;
  emoji4: string;
  visible: boolean;
};