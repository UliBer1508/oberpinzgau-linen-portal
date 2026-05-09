import { supabase } from '@/integrations/external/client';

export type AppRole = 'admin' | 'customer' | 'waeschekraft';

export async function hasRole(userId: string, role: AppRole): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: role,
  });
  if (error) {
    console.error('hasRole error', error);
    return false;
  }
  return !!data;
}
