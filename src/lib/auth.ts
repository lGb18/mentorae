import { supabase } from '../lib/supabaseClient'

export type Role = 'student' | 'teacher'

export async function signUp(
  email: string,
  password: string,
  role: Role,
  display_name?: string
) {

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  const user = data.user
  
  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        role,
        display_name: display_name ?? '',
      })
    if (profileError) throw profileError
  }

  return data
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  const user = data.user

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) throw profileError

  return { user, profile }
}

export async function updateProfile(userId: string, updates: Partial<{ display_name: string; bio: string }>) {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId)
  if (error) throw error
}

