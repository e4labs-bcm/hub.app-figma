# 🚀 Getting Started - Hub.App

Este guia te ajudará a configurar e executar o Hub.App em sua máquina local.

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **Git** para controle de versão
- **Conta Supabase** (gratuita)

## ⚡ Início Rápido

### 1. Clone o Repositório
```bash
git clone https://github.com/e4labs-bcm/hub.app-figma.git
cd hub.app-figma
```

### 2. Instale as Dependências
```bash
npm install
```

### 3. Execute o Projeto
```bash
# Desenvolvimento local
npm run dev

# Com acesso de rede (para testar no celular)
npm run dev -- --host
```

### 4. Acesse a Aplicação
- **Local**: http://localhost:5173
- **Rede**: http://[seu-ip]:5173

## 🔧 Configuração Completa

### Configuração do Supabase

1. **Crie um projeto** em [supabase.com](https://supabase.com)
2. **Configure as variáveis** em `src/utils/supabase/info.tsx`:
   ```typescript
   export const projectId = 'SEU_PROJECT_ID';
   export const publicAnonKey = 'SUA_PUBLIC_ANON_KEY';
   ```
3. **Execute o schema SQL** disponível em `supabase-schema.sql`

### Primeira Execução

1. **Acesse a aplicação** no navegador
2. **Faça login** ou crie uma conta
3. **Configure sua empresa** (primeira vez)
4. **Explore os módulos** disponíveis

## 📱 Testando no Mobile

```bash
# Execute com acesso de rede
npm run dev -- --host

# Encontre seu IP local
ipconfig getifaddr en0  # macOS
ip route get 1 | head -1 | cut -d' ' -f7  # Linux
```

Acesse `http://SEU_IP:5173` no seu celular.

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`.

## 🆘 Problemas Comuns

### Erro de Conexão com Supabase
- Verifique se as variáveis em `info.tsx` estão corretas
- Confirme se o schema SQL foi executado
- Verifique as políticas RLS no Supabase Dashboard

### Erro de Permissões
- Execute o script SQL completo
- Verifique se as tabelas `tenants` e `perfis` existem
- Confirme se as funções RPC foram criadas

### Problemas de Performance
- Use `npm run dev -- --host` apenas quando necessário
- Feche outras aplicações que consomem recursos
- Use Chrome DevTools para debug

## 📚 Próximos Passos

- 📖 Leia [Arquitetura do Sistema](./architecture.md)
- 🎨 Explore [Design System](./design-system.md)
- 🔐 Entenda [Multi-tenancy](./multi-tenancy.md)
- 🧩 Descubra [Sistema de Módulos](./modules-system.md)

## 🎯 Status do Projeto

**MVP: ~75% completo**
- ✅ **Core funcionando**: Auth, Multi-tenant, UI
- ✅ **Módulos básicos**: App Store, Configurações
- 🚧 **Em desenvolvimento**: CRM, Agenda, Super Admin
- 🔮 **Futuro**: IA, Analytics, Monetização

---

**💡 Dica**: Mantenha sempre o servidor de desenvolvimento rodando durante o desenvolvimento para ver as mudanças em tempo real!