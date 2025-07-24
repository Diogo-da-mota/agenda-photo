
export interface CompanyData {
  id?: string;  // Optional id for Supabase record
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  whatsapp: string;
  email: string;
  logo_url?: string;  // Logo URL from Supabase
  user_id?: string;   // User ID for Supabase RLS
}
