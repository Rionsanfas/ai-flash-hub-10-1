import { supabase } from '@/integrations/supabase/client';

console.log('Supabase import:', supabase); // Add this line

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'starter' | 'pro' | 'premium';
}

export const auth = {
  async signup(credentials: { email: string; password: string; name: string }): Promise<User> {
    console.log('Supabase before signup check:', supabase); // Add this line
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: { full_name: credentials.name },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: credentials.name,
            plan: 'starter'
          });

        if (profileError) {
          console.warn('profiles upsert failed:', profileError);
        }

        return {
          id: data.user.id,
          email: data.user.email || '',
          name: credentials.name,
          plan: 'starter'
        };
      }

      throw new Error('Signup failed');
    } catch (err: any) {
      // Normalize common network error for clarity
      if (err?.message?.toLowerCase().includes('failed to fetch')) {
        throw new Error('Network error contacting Supabase. Please check your internet connection and Supabase URL/Anon key configuration.');
      }
      throw err;
    }
  },

  async login(credentials: { email: string; password: string }): Promise<User> {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      if (data.user) {
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, plan')
          .eq('id', data.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') { // No row
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: data.user.user_metadata.full_name || '',
              plan: 'starter'
            });
          if (insertError) {
            console.warn('profiles insert failed:', insertError);
          }
          profile = { full_name: data.user.user_metadata.full_name || '', plan: 'starter' } as any;
        } else if (profileError) {
          console.warn('profiles select failed:', profileError);
        }

        return {
          id: data.user.id,
          email: data.user.email || '',
          name: (profile as any)?.full_name,
          plan: (profile as any)?.plan || 'starter'
        };
      }

      throw new Error('Login failed');
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('failed to fetch')) {
        throw new Error('Network error contacting Supabase. Please try again or verify configuration.');
      }
      throw err;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn('profiles select failed:', profileError);
    }

    return {
      id: user.id,
      email: user.email || '',
      name: (profile as any)?.full_name || (user.user_metadata as any).full_name || '',
      plan: (profile as any)?.plan || 'starter'
    };
  },

  async isAuthenticated(): Promise<boolean> {
    if (!supabase) return false;

    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  },

  async logout(): Promise<void> {
    if (!supabase) return;

    await supabase.auth.signOut();
  }
};