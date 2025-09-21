import { createServiceRoleClient } from './supabase-client'

/**
 * Enhanced role checking functions that support both single role (legacy) 
 * and multiple roles (new JSONB array format)
 */

export interface UserProfile {
  id: string
  email: string
  role: string | null  // Legacy single role
  roles: string[] | null  // New multiple roles array
  full_name: string | null
}

/**
 * Check if user has weedmenu or admin access
 * Supports both legacy single role and new multiple roles
 */
export const checkWeedMenuRole = async (userId: string): Promise<boolean> => {
  const supabase = createServiceRoleClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, roles')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return false
  }
  
  // Check legacy single role
  if (profile.role === 'weedmenu' || profile.role === 'admin') {
    return true
  }
  
  // Check new multiple roles array
  if (profile.roles && Array.isArray(profile.roles)) {
    return profile.roles.includes('weedmenu') || profile.roles.includes('admin')
  }
  
  return false
}

/**
 * Check if user has admin role (for sensitive operations like migration)
 */
export const checkAdminRole = async (userId: string): Promise<boolean> => {
  const supabase = createServiceRoleClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, roles')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return false
  }
  
  // Check legacy single role
  if (profile.role === 'admin') {
    return true
  }
  
  // Check new multiple roles array
  if (profile.roles && Array.isArray(profile.roles)) {
    return profile.roles.includes('admin')
  }
  
  return false
}

/**
 * Get user profile with role information
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = createServiceRoleClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, role, roles, full_name')
    .eq('id', userId)
    .single()
  
  if (error || !profile) {
    return null
  }
  
  return profile as UserProfile
}

/**
 * Add role to user (preserving existing roles)
 * Only works if multiple roles are enabled in database
 */
export const addRoleToUser = async (userId: string, newRole: string): Promise<boolean> => {
  const supabase = createServiceRoleClient()
  
  try {
    // Try to use the database function if multiple roles are enabled
    const { error } = await supabase.rpc('add_role_to_user', {
      user_id: userId,
      new_role: newRole
    })
    
    if (!error) {
      return true
    }
    
    // Fallback: if multiple roles not enabled, update single role
    // But only if user doesn't have an important role
    const profile = await getUserProfile(userId)
    if (!profile) return false
    
    // Don't overwrite admin or doctor roles
    if (profile.role && ['admin', 'doctor'].includes(profile.role)) {
      console.warn(`Not overwriting important role ${profile.role} for user ${userId}`)
      return false
    }
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    
    return !updateError
    
  } catch (error) {
    console.error('Error adding role to user:', error)
    return false
  }
}

/**
 * Remove role from user
 * Only works if multiple roles are enabled in database
 */
export const removeRoleFromUser = async (userId: string, roleToRemove: string): Promise<boolean> => {
  const supabase = createServiceRoleClient()
  
  try {
    const { error } = await supabase.rpc('remove_role_from_user', {
      user_id: userId,
      role_to_remove: roleToRemove
    })
    
    return !error
  } catch (error) {
    console.error('Error removing role from user:', error)
    return false
  }
}

/**
 * Check if multiple roles system is enabled
 */
export const isMultipleRolesEnabled = async (): Promise<boolean> => {
  const supabase = createServiceRoleClient()
  
  try {
    // Try to call the multiple roles function
    const { error } = await supabase.rpc('user_has_role', {
      user_roles: '["admin"]',
      required_role: 'admin'
    })
    
    return !error
  } catch (error) {
    return false
  }
}
