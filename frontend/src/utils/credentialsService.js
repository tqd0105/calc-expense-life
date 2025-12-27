/**
 * Credentials Service - Lưu credentials vào Supabase theo user
 */
import { supabase } from '../lib/supabase'

/**
 * Lưu credentials vào Supabase
 * @param {string} store - 'bachhoaxanh' | 'kingfoodmart'
 * @param {object} credentials - Credentials object
 */
export async function saveCredentialsToSupabase(store, credentials) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  // Upsert: insert hoặc update nếu đã tồn tại
  const { data, error } = await supabase
    .from('user_credentials')
    .upsert({
      user_id: user.id,
      store_type: store,
      credentials: credentials,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,store_type'
    })
    .select()

  if (error) {
    console.error('Error saving credentials:', error)
    throw error
  }

  return data
}

/**
 * Load credentials từ Supabase
 * @param {string} store - 'bachhoaxanh' | 'kingfoodmart'
 */
export async function loadCredentialsFromSupabase(store) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('user_credentials')
    .select('credentials')
    .eq('user_id', user.id)
    .eq('store_type', store)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found - chưa có credentials
      return null
    }
    console.error('Error loading credentials:', error)
    return null
  }

  return data?.credentials || null
}

/**
 * Xóa credentials từ Supabase
 * @param {string} store - 'bachhoaxanh' | 'kingfoodmart'
 */
export async function clearCredentialsFromSupabase(store) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  const { error } = await supabase
    .from('user_credentials')
    .delete()
    .eq('user_id', user.id)
    .eq('store_type', store)

  if (error) {
    console.error('Error clearing credentials:', error)
    throw error
  }
}

/**
 * Migrate credentials từ localStorage sang Supabase
 * Chạy một lần khi user đăng nhập
 */
export async function migrateLocalCredentials() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  const stores = ['bachhoaxanh', 'kingfoodmart']
  
  for (const store of stores) {
    const localKey = `${store}_credentials`
    const localData = localStorage.getItem(localKey)
    
    if (localData) {
      try {
        const credentials = JSON.parse(localData)
        
        // Check nếu chưa có trong Supabase thì migrate
        const existing = await loadCredentialsFromSupabase(store)
        if (!existing) {
          await saveCredentialsToSupabase(store, credentials)
          console.log(`✅ Migrated ${store} credentials to Supabase`)
        }
        
        // Xóa khỏi localStorage sau khi migrate
        localStorage.removeItem(localKey)
      } catch (err) {
        console.error(`Error migrating ${store} credentials:`, err)
      }
    }
  }
}
