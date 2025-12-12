import bcrypt from 'bcryptjs'
import { supabase } from './supabase'

export interface AdminUser {
  id: string
  username: string
  email?: string
  is_active: boolean
}

export const authenticateAdmin = async (username: string, password: string): Promise<AdminUser | null> => {
  try {
    // Autenticação simples
    if ((username === 'sofiazissou' && password === 'Sjz10041973@') ||
        (username === 'fabiozissou' && password === 'Fbz12061972@')) {
      return {
        id: '1',
        username: username,
        email: username === 'sofiazissou' ? 'sofia@zissou.com' : 'fabio@zissou.com',
        is_active: true
      }
    }
    return null
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return null
  }
}

export const generatePasswordHash = async (password: string): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}