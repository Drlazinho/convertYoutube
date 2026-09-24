import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function trackDownload(mediaType: string, quality: string, title: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    await supabase.from('downloads').insert([{
      user_id: session.user.id,
      media_type: mediaType,
      quality: quality,
      title: title,
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('Failed to track download:', err);
  }
}
