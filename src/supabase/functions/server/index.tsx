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
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Simular dados de módulos ativos (substituir por consulta real quando schema estiver pronto)
    const mockActiveModules = [
      {
        id: "mod_crm",
        nome: "CRM",
        descricao: "Sistema de gestão de relacionamento com clientes",
        icone_lucide: "Users",
        categoria: "productivity",
        is_free: true,
        status: "active",
        module_status: "active",
        installed_at: new Date().toISOString(),
        link_destino: "https://crm.example.com"
      },
      {
        id: "mod_agenda",
        nome: "Agenda",
        descricao: "Sistema de agendamento e calendário",
        icone_lucide: "Calendar",
        categoria: "productivity", 
        is_free: true,
        status: "active",
        module_status: "active",
        installed_at: new Date().toISOString(),
        link_destino: "https://agenda.example.com"
      }
    ];

    return c.json({ 
      success: true,
      modules: mockActiveModules 
    });

  } catch (error) {
    console.error('Erro ao buscar módulos ativos:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

// Listar módulos disponíveis para instalação
app.get("/make-server-d3150113/modules/available", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Simular dados de módulos disponíveis
    const mockAvailableModules = [
      {
        id: "mod_financeiro",
        nome: "Financeiro",
        descricao: "Gestão financeira completa para sua empresa",
        icone_lucide: "DollarSign",
        categoria: "finance",
        is_free: false,
        preco: 29.90,
        developer: "Hub.App Team",
        rating: 4.8,
        downloads: "1.2K+",
        size: "15 MB",
        status: "active"
      },
      {
        id: "mod_estoque",
        nome: "Controle de Estoque",
        descricao: "Gerencie seu estoque com facilidade",
        icone_lucide: "Package",
        categoria: "productivity",
        is_free: true,
        developer: "Hub.App Team",
        rating: 4.6,
        downloads: "850+",
        size: "12 MB",
        status: "active"
      },
      {
        id: "mod_vendas",
        nome: "Vendas Online",
        descricao: "Plataforma de vendas e e-commerce integrada",
        icone_lucide: "ShoppingCart",
        categoria: "ecommerce",
        is_free: false,
        preco: 49.90,
        developer: "Hub.App Team", 
        rating: 4.9,
        downloads: "2.5K+",
        size: "25 MB",
        status: "active"
      },
      {
        id: "mod_rh",
        nome: "Recursos Humanos",
        descricao: "Gestão completa de recursos humanos",
        icone_lucide: "UserCheck",
        categoria: "hr",
        is_free: false,
        preco: 39.90,
        developer: "Hub.App Team",
        rating: 4.7,
        downloads: "680+",
        size: "18 MB",
        status: "active"
      }
    ];

    return c.json({ 
      success: true,
      modules: mockAvailableModules 
    });

  } catch (error) {
    console.error('Erro ao buscar módulos disponíveis:', error);
    return c.json({ 
      error: "Erro interno do servidor" 
    }, 500);
  }
});

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

    // Simular instalação bem-sucedida
    // Em produção, isso seria uma inserção real na tabela tenants_modulos
    
    return c.json({ 
      success: true,
      message: "Módulo instalado com sucesso",
      installed_at: new Date().toISOString()
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

    // Simular desinstalação bem-sucedida
    
    return c.json({ 
      success: true,
      message: "Módulo desinstalado com sucesso"
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