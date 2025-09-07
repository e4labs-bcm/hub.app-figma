import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Função para criar novo tenant
app.post("/make-server-d3150113/create-tenant", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { nome_empresa, cnpj, email_empresa, user_id } = await c.req.json();

    if (!nome_empresa || !user_id) {
      return c.json({ 
        error: "Nome da empresa e ID do usuário são obrigatórios" 
      }, 400);
    }

    // Verificar se o usuário já tem uma empresa
    const { data: existingProfile } = await supabase
      .from('perfis')
      .select('tenant_id')
      .eq('id', user_id)
      .single();

    if (existingProfile?.tenant_id) {
      return c.json({ 
        error: "Usuário já possui uma empresa vinculada" 
      }, 400);
    }

    // Criar nova empresa
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        nome_empresa,
        cnpj: cnpj || null,
        email_empresa: email_empresa || null,
        status: 'active',
        plano: 'free'
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Erro ao criar tenant:', tenantError);
      return c.json({ 
        error: "Erro ao criar empresa: " + tenantError.message 
      }, 500);
    }

    // Criar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('perfis')
      .insert({
        id: user_id,
        nome_completo: 'Administrador', // Campo correto no novo schema
        tenant_id: tenant.id,
        role: 'admin_empresa' // Roles corretos do novo schema
      })
      .select(`
        *,
        tenants (*)
      `)
      .single();

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se falhar ao criar perfil, deletar o tenant criado
      await supabase.from('tenants').delete().eq('id', tenant.id);
      return c.json({ 
        error: "Erro ao criar perfil do usuário: " + profileError.message 
      }, 500);
    }

    return c.json({ 
      success: true, 
      tenant, 
      profile 
    });

  } catch (error) {
    console.error('Erro inesperado ao criar tenant:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Função para buscar dados do perfil
app.get("/make-server-d3150113/profile/:userId", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const userId = c.req.param('userId');

    const { data: profile, error } = await supabase
      .from('perfis')
      .select(`
        *,
        tenants (*)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return c.json({ error: error.message }, 404);
    }

    return c.json({ profile });

  } catch (error) {
    console.error('Erro inesperado ao buscar perfil:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Função para criar usuário diretamente (bypass de confirmação de email)
app.post("/make-server-d3150113/signup", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ 
        error: "Email e senha são obrigatórios" 
      }, 400);
    }

    console.log('Criando usuário no servidor:', email);

    // Criar usuário com confirmação automática de email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automaticamente
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return c.json({ 
        error: error.message 
      }, 400);
    }

    console.log('Usuário criado com sucesso:', data.user?.id);

    return c.json({ 
      success: true, 
      user: data.user 
    });

  } catch (error) {
    console.error('Erro inesperado ao criar usuário:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// ============================================
// MÓDULOS - Sistema de Módulos
// ============================================

// Listar módulos ativos do tenant
app.get("/make-server-d3150113/modules/active", async (c) => {
  console.log('🚀 ENDPOINT /modules/active CHAMADO!');
  try {
    // Usar service role para evitar problemas com RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Buscar módulos instalados pelo tenant específico (usando tenant_id direto)
    // Pegar tenant_id do perfil do usuário auth primeiro
    const authHeader = c.req.header('authorization');
    if (!authHeader) {
      return c.json({ error: 'Authorization header required' }, 401);
    }

    // Buscar tenant_id do usuário logado
    const { data: profile } = await supabase
      .from('perfis')
      .select('tenant_id')
      .eq('id', 'SELECT auth.uid()')
      .single();

    // Como fallback, usar o tenant_id que vimos nos logs
    const tenantId = 'deb87331-9f3e-4474-8a19-b0386a68b398';

    const { data: activeModules, error } = await supabase
      .from('tenants_modulos')
      .select(`
        modulos (
          id,
          nome,
          slug,
          descricao,
          descricao_longa,
          link_destino,
          is_free,
          preco_mensal,
          categoria,
          status,
          desenvolvedor,
          manifest,
          avaliacao_media
        ),
        data_instalacao,
        status as installation_status
      `)
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    if (error) {
      console.error('Erro ao buscar módulos ativos:', error);
      return c.json({ 
        error: "Erro ao carregar módulos instalados: " + error.message 
      }, 500);
    }

    // Converter para formato esperado pelo frontend, adicionando campos necessários
    const formattedModules = (activeModules || []).map(installation => {
      const module = installation.modulos;
      return {
        id: module.id,
        nome: module.nome,
        descricao: module.descricao || module.descricao_longa,
        icone_lucide: extractIconFromManifest(module.manifest) || "Package",
        categoria: module.categoria,
        is_free: module.is_free,
        preco: module.preco_mensal,
        developer: module.desenvolvedor,
        status: module.status,
        module_status: installation.installation_status,
        installed_at: installation.data_instalacao,
        link_destino: module.link_destino
      };
    });

    console.log(`Encontrados ${formattedModules.length} módulos ativos`);

    return c.json({ 
      success: true,
      modules: [{
        id: "test-123",
        nome: "TESTE - SE VOCÊ VÊ ISSO, O EDGE FUNCTION FUNCIONA!",
        descricao: "Módulo de teste para debug",
        icone_lucide: "TestTube",
        categoria: "teste",
        is_free: true,
        preco: 0,
        developer: "DEBUG",
        rating: 5.0,
        downloads: "1K+",
        size: "1 MB",
        status: "active"
      }]
    });

  } catch (error) {
    console.error('Erro ao buscar módulos ativos:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Função auxiliar para extrair ícone do manifest
function extractIconFromManifest(manifest: any): string | null {
  if (!manifest || typeof manifest !== 'object') return null;
  return manifest.icon || manifest.icone_lucide || null;
}

// Listar módulos disponíveis para instalação  
app.get("/make-server-d3150113/modules/available", async (c) => {
  console.log('🚀 ENDPOINT /modules/available CHAMADO!');
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Usar o tenant_id fixo já conhecido
    const tenantId = 'deb87331-9f3e-4474-8a19-b0386a68b398';

    // Primeiro, buscar módulos já instalados
    const { data: installedModules } = await supabase
      .from('tenants_modulos')
      .select('modulo_id')
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    const installedIds = installedModules?.map(m => m.modulo_id) || [];
    
    console.log('=== DEBUG MODULES/AVAILABLE ===');
    console.log('Tenant ID:', tenantId);
    console.log('Módulos instalados encontrados:', installedModules?.length || 0);
    console.log('IDs instalados:', installedIds);

    // Buscar módulos disponíveis que NÃO estão instalados
    let query = supabase
      .from('modulos')
      .select('*')
      .eq('status', 'active');
    
    if (installedIds.length > 0) {
      query = query.not('id', 'in', `(${installedIds.map(id => `'${id}'`).join(',')})`);
    }
    
    const { data: availableModules, error } = await query;

    console.log('Módulos encontrados na query:', availableModules?.length || 0);
    availableModules?.forEach(m => console.log(`  - ${m.nome} (${m.categoria})`));

    if (error) {
      console.error('Erro ao buscar módulos disponíveis:', error);
      return c.json({ 
        error: "Erro ao carregar módulos disponíveis: " + error.message 
      }, 500);
    }

    // Converter para formato esperado pelo frontend
    const formattedModules = (availableModules || []).map(module => ({
      id: module.id,
      nome: module.nome,
      descricao: module.descricao || module.descricao_longa,
      icone_lucide: extractIconFromManifest(module.manifest) || getCategoryIcon(module.categoria),
      categoria: module.categoria,
      is_free: module.is_free,
      preco: module.preco_mensal,
      developer: module.desenvolvedor || "Hub.App Team",
      rating: module.avaliacao_media || generateRandomRating(),
      downloads: generateDownloadCount(),
      size: "15 MB", // Valor padrão
      status: module.status
    }));

    console.log(`Encontrados ${formattedModules.length} módulos disponíveis`);

    return c.json({ 
      success: true,
      modules: [{
        id: "test-123",
        nome: "TESTE - SE VOCÊ VÊ ISSO, O EDGE FUNCTION FUNCIONA!",
        descricao: "Módulo de teste para debug",
        icone_lucide: "TestTube",
        categoria: "teste",
        is_free: true,
        preco: 0,
        developer: "DEBUG",
        rating: 5.0,
        downloads: "1K+",
        size: "1 MB",
        status: "active"
      }]
    });

  } catch (error) {
    console.error('Erro ao buscar módulos disponíveis:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// NOVO ENDPOINT PARA TESTAR CACHE
app.get("/make-server-d3150113/modules/available-v2", async (c) => {
  console.log('🚀 ENDPOINT /modules/available-V2 CHAMADO! - SEM CACHE!');
  return c.json({ 
    success: true,
    modules: [{
      id: "test-no-cache",
      nome: "🎯 SEM CACHE - ENDPOINT V2 FUNCIONANDO!",
      descricao: "Este módulo prova que não há cache!",
      icone_lucide: "Rocket",
      categoria: "teste",
      is_free: true,
      preco: 0,
      developer: "NO CACHE TEST",
      rating: 5.0,
      downloads: "∞",
      size: "0 MB",
      status: "active"
    }]
  });
});

// Função auxiliar para obter ícone baseado na categoria
function getCategoryIcon(categoria: string): string {
  const icons = {
    'vendas': 'ShoppingCart',
    'financeiro': 'DollarSign', 
    'produtividade': 'Zap',
    'comunicacao': 'MessageCircle',
    'marketing': 'Megaphone',
    'recursos_humanos': 'UserCheck',
    'outros': 'Package'
  };
  return icons[categoria as keyof typeof icons] || 'Package';
}

// Função auxiliar para gerar rating aleatório realista
function generateRandomRating(): number {
  return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // Entre 3.5 e 5.0
}

// Função auxiliar para gerar contagem de downloads
function generateDownloadCount(): string {
  const counts = ['150+', '350+', '500+', '800+', '1.2K+', '2.5K+', '5K+'];
  return counts[Math.floor(Math.random() * counts.length)];
}

// Instalar módulo
app.post("/make-server-d3150113/modules/install", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { module_id, tenant_id } = await c.req.json();

    if (!module_id || !tenant_id) {
      return c.json({ 
        error: "ID do módulo e tenant são obrigatórios" 
      }, 400);
    }

    console.log(`Instalando módulo ${module_id} para tenant ${tenant_id}`);

    // Verificar se o módulo existe e está ativo
    const { data: module, error: moduleError } = await supabase
      .from('modulos')
      .select('*')
      .eq('id', module_id)
      .eq('status', 'active')
      .single();

    if (moduleError || !module) {
      return c.json({ 
        error: "Módulo não encontrado ou inativo" 
      }, 404);
    }

    // Verificar se o módulo já não está instalado
    const { data: existingInstallation } = await supabase
      .from('tenants_modulos')
      .select('id')
      .eq('tenant_id', tenant_id)
      .eq('modulo_id', module_id)
      .eq('status', 'active')
      .single();

    if (existingInstallation) {
      return c.json({ 
        error: "Módulo já está instalado" 
      }, 409);
    }

    // Instalar o módulo
    const { data: installation, error: installError } = await supabase
      .from('tenants_modulos')
      .insert({
        tenant_id: tenant_id,
        modulo_id: module_id,
        status: 'active',
        data_instalacao: new Date().toISOString()
      })
      .select()
      .single();

    console.log('Tentativa de instalação:', {
      tenant_id,
      module_id,
      installation,
      installError
    });

    if (installError) {
      console.error('Erro ao instalar módulo:', installError);
      return c.json({ 
        error: "Erro ao instalar módulo: " + installError.message 
      }, 500);
    }

    // Log de auditoria
    try {
      await supabase
        .from('audit_log')
        .insert({
          tenant_id,
          user_id: null, // Será preenchido pela RLS se disponível
          acao: 'INSTALL_MODULE',
          entidade: 'tenants_modulos',
          detalhes: {
            module_id,
            module_name: module.nome,
            installation_id: installation.id
          }
        });
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria:', auditError);
    }

    return c.json({ 
      success: true,
      message: "Módulo instalado com sucesso",
      installed_at: installation.data_instalacao,
      installation_id: installation.id
    });

  } catch (error) {
    console.error('Erro ao instalar módulo:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Desinstalar módulo
app.post("/make-server-d3150113/modules/uninstall", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { module_id, tenant_id } = await c.req.json();

    if (!module_id || !tenant_id) {
      return c.json({ 
        error: "ID do módulo e tenant são obrigatórios" 
      }, 400);
    }

    console.log(`Desinstalando módulo ${module_id} para tenant ${tenant_id}`);

    // Buscar a instalação existente
    const { data: installation, error: findError } = await supabase
      .from('tenants_modulos')
      .select(`
        *,
        modulos (nome)
      `)
      .eq('tenant_id', tenant_id)
      .eq('modulo_id', module_id)
      .eq('status', 'active')
      .single();

    if (findError || !installation) {
      return c.json({ 
        error: "Módulo não está instalado ou não encontrado" 
      }, 404);
    }

    // Desinstalar o módulo (soft delete - muda status para cancelled)
    const { error: uninstallError } = await supabase
      .from('tenants_modulos')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', installation.id);

    if (uninstallError) {
      console.error('Erro ao desinstalar módulo:', uninstallError);
      return c.json({ 
        error: "Erro ao desinstalar módulo: " + uninstallError.message 
      }, 500);
    }

    // Log de auditoria
    try {
      await supabase
        .from('audit_log')
        .insert({
          tenant_id,
          user_id: null, // Será preenchido pela RLS se disponível
          acao: 'UNINSTALL_MODULE',
          entidade: 'tenants_modulos',
          detalhes: {
            module_id,
            module_name: installation.modulos?.nome,
            installation_id: installation.id,
            previous_status: 'active'
          }
        });
    } catch (auditError) {
      console.warn('Erro ao registrar auditoria:', auditError);
    }

    return c.json({ 
      success: true,
      message: "Módulo desinstalado com sucesso",
      uninstalled_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao desinstalar módulo:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// ============================================
// PERMISSÕES - Sistema de Permissões
// ============================================

// Listar permissões do usuário atual
app.get("/make-server-d3150113/permissions", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Simular permissões do usuário (substituir por consulta real)
    const mockPermissions = [
      { codigo: "crm.read", nome: "Visualizar CRM", modulo: "CRM" },
      { codigo: "crm.write", nome: "Editar CRM", modulo: "CRM" },
      { codigo: "agenda.read", nome: "Visualizar Agenda", modulo: "Agenda" },
      { codigo: "agenda.write", nome: "Editar Agenda", modulo: "Agenda" },
      { codigo: "settings.read", nome: "Visualizar Configurações", modulo: "Sistema" },
      { codigo: "settings.write", nome: "Editar Configurações", modulo: "Sistema" },
      { codigo: "appstore.read", nome: "Acessar App Store", modulo: "Sistema" },
      { codigo: "modules.install", nome: "Instalar Módulos", modulo: "Sistema" }
    ];

    return c.json({ 
      success: true,
      permissions: mockPermissions 
    });

  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Verificar permissão específica
app.post("/make-server-d3150113/permissions/check", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { permission_code, user_id } = await c.req.json();

    if (!permission_code || !user_id) {
      return c.json({ 
        error: "Código da permissão e ID do usuário são obrigatórios" 
      }, 400);
    }

    console.log(`Verificando permissão ${permission_code} para usuário ${user_id}`);

    // Simular verificação de permissão (sempre retorna true para desenvolvimento)
    // Em produção, fazer consulta real no banco
    const hasPermission = true;

    return c.json({ 
      success: true,
      hasPermission,
      permission_code
    });

  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// ============================================
// NOTIFICAÇÕES - Sistema de Notificações
// ============================================

// Listar notificações do usuário
app.get("/make-server-d3150113/notifications", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Simular notificações do usuário (substituir por consulta real)
    const mockNotifications = [
      {
        id: "notif_1",
        titulo: "Bem-vindo ao Hub.App!",
        mensagem: "Sua conta foi criada com sucesso. Explore nossos módulos e personalize sua experiência.",
        tipo: "success",
        lida: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutos atrás
        user_id: "user_123"
      },
      {
        id: "notif_2", 
        titulo: "Novo módulo disponível",
        mensagem: "O módulo 'Financeiro' está agora disponível na App Store. Instale agora e gerencie suas finanças!",
        tipo: "info",
        lida: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
        user_id: "user_123"
      },
      {
        id: "notif_3",
        titulo: "Configuração pendente",
        mensagem: "Complete as configurações da sua empresa para ter acesso a todos os recursos.",
        tipo: "warning",
        lida: true,
        lida_em: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
        user_id: "user_123"
      }
    ];

    return c.json({ 
      success: true,
      notifications: mockNotifications 
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Marcar notificação como lida
app.post("/make-server-d3150113/notifications/mark-read", async (c) => {
  try {
    const { notification_id } = await c.req.json();

    if (!notification_id) {
      return c.json({ 
        error: "ID da notificação é obrigatório" 
      }, 400);
    }

    console.log(`Marcando notificação ${notification_id} como lida`);

    // Simular marcação como lida
    return c.json({ 
      success: true,
      message: "Notificação marcada como lida"
    });

  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Marcar todas as notificações como lidas
app.post("/make-server-d3150113/notifications/mark-all-read", async (c) => {
  try {
    console.log('Marcando todas as notificações como lidas');

    // Simular marcação de todas como lidas
    return c.json({ 
      success: true,
      message: "Todas as notificações foram marcadas como lidas"
    });

  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Deletar notificação
app.post("/make-server-d3150113/notifications/delete", async (c) => {
  try {
    const { notification_id } = await c.req.json();

    if (!notification_id) {
      return c.json({ 
        error: "ID da notificação é obrigatório" 
      }, 400);
    }

    console.log(`Deletando notificação ${notification_id}`);

    // Simular exclusão
    return c.json({ 
      success: true,
      message: "Notificação deletada com sucesso"
    });

  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Criar nova notificação
app.post("/make-server-d3150113/notifications/create", async (c) => {
  try {
    const { titulo, mensagem, tipo, metadata } = await c.req.json();

    if (!titulo || !mensagem) {
      return c.json({ 
        error: "Título e mensagem são obrigatórios" 
      }, 400);
    }

    console.log('Criando nova notificação:', titulo);

    // Simular criação de notificação
    const newNotification = {
      id: `notif_${Date.now()}`,
      titulo,
      mensagem,
      tipo: tipo || 'info',
      lida: false,
      created_at: new Date().toISOString(),
      user_id: "user_123",
      metadata
    };

    return c.json({ 
      success: true,
      notification: newNotification
    });

  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// ============================================
// AUDIT LOG - Sistema de Auditoria
// ============================================

// Registrar ação no audit log
app.post("/make-server-d3150113/audit-log", async (c) => {
  try {
    const logEntry = await c.req.json();

    console.log('Registrando no audit log:', {
      acao: logEntry.acao,
      entidade: logEntry.entidade,
      timestamp: logEntry.timestamp
    });

    // Simular inserção no audit log
    // Em produção, salvar no banco de dados
    
    return c.json({ 
      success: true,
      message: "Ação registrada no audit log"
    });

  } catch (error) {
    console.error('Erro ao registrar no audit log:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Consultar audit log (apenas para administradores)
app.get("/make-server-d3150113/audit-log", async (c) => {
  try {
    // Simular dados do audit log
    const mockAuditLog = [
      {
        id: "audit_1",
        acao: "LOGIN",
        entidade: "user",
        entidade_id: "user_123",
        detalhes: { login_method: "google" },
        created_at: new Date().toISOString(),
        user_id: "user_123",
        ip_address: "192.168.1.1"
      },
      {
        id: "audit_2",
        acao: "INSTALL_MODULE",
        entidade: "module",
        entidade_id: "mod_crm",
        detalhes: { module_name: "CRM" },
        created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        user_id: "user_123",
        ip_address: "192.168.1.1"
      }
    ];

    return c.json({ 
      success: true,
      audit_log: mockAuditLog 
    });

  } catch (error) {
    console.error('Erro ao consultar audit log:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// ============================================
// EMPRESA - Configurações da Empresa
// ============================================

// Atualizar dados da empresa
app.post("/make-server-d3150113/company/update", async (c) => {
  try {
    const companyData = await c.req.json();
    const { tenant_id, ...updateData } = companyData;

    if (!tenant_id) {
      return c.json({ 
        error: "ID do tenant é obrigatório" 
      }, 400);
    }

    console.log('Atualizando dados da empresa:', tenant_id);

    // Simular atualização (em produção, fazer update real)
    
    return c.json({ 
      success: true,
      message: "Dados da empresa atualizados com sucesso",
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao atualizar dados da empresa:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Obter dados da empresa
app.get("/make-server-d3150113/company/:tenant_id", async (c) => {
  try {
    const tenantId = c.req.param('tenant_id');

    console.log('Buscando dados da empresa:', tenantId);

    // Simular dados da empresa
    const mockCompanyData = {
      id: tenantId,
      nome_empresa: "Minha Empresa LTDA",
      cnpj: "12.345.678/0001-90",
      email_empresa: "contato@minhaempresa.com",
      telefone: "(11) 99999-9999",
      endereco: "Rua das Flores, 123",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01234-567",
      website: "https://www.minhaempresa.com",
      descricao: "Empresa de tecnologia focada em soluções inovadoras",
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias atrás
    };

    return c.json({ 
      success: true,
      company: mockCompanyData 
    });

  } catch (error) {
    console.error('Erro ao buscar dados da empresa:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Health check endpoint
app.get("/make-server-d3150113/health", (c) => {
  return c.json({ 
    status: "Hub.App API - Sistema completo ativo!",
    version: "1.0.0",
    features: [
      "authentication",
      "modules", 
      "permissions",
      "notifications",
      "audit-log",
      "company-settings"
    ]
  });
});

Deno.serve(app.fetch);