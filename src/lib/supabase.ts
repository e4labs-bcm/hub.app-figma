import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../utils/supabase/info'

const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseKey = publicAnonKey

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types para o banco de dados
export interface Perfil {
  id: string
  nome: string
  email: string
  avatar_url?: string
  tenant_id: string
  role: 'super_admin' | 'admin' | 'user'
  created_at: string
  updated_at: string
  tenants?: Tenant
}

export interface Tenant {
  id: string
  nome_empresa: string
  cnpj?: string
  email_empresa?: string
  status: 'ativo' | 'inativo' | 'suspenso'
  plano: 'basico' | 'profissional' | 'empresarial'
  max_usuarios: number
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email?: string
  created_at: string
}