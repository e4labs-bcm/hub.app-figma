
# 🚀 Hub.App - Plataforma de Gestão Modular

Uma aplicação SaaS moderna para micro e pequenas empresas centralizarem e automatizarem sua gestão em uma única plataforma inteligente e modular.

## 📋 Visão Geral

O Hub.App é uma solução de gestão **Mobile-First** com arquitetura multi-tenant que permite às empresas:

- ✅ **Centralizar dados** em uma única plataforma
- ✅ **Adicionar módulos** conforme necessidade  
- ✅ **Personalizar interface** com marca própria
- ✅ **Escalar funcionalidades** através da App Store interna

## 🏗️ Arquitetura

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS + Radix UI + Framer Motion  
- **Backend**: Supabase (PostgreSQL + Row Level Security)
- **Autenticação**: Supabase Auth
- **Deploy**: Pronto para Vercel/Netlify

## 🎯 Funcionalidades Principais

### ✅ **Implementado (MVP)**
- 🔐 **Sistema de autenticação** completo
- 👥 **Multi-tenant** com isolamento de dados
- 📱 **Interface responsiva** (Mobile-First)
- 🎨 **Personalização visual** (backgrounds, logos)
- 🧩 **Sistema modular** dinâmico
- 🛒 **App Store interna** para módulos
- ⚙️ **Centro de configurações** completo
- 🔔 **Sistema de notificações**

### 🚧 **Em Desenvolvimento**
- 📊 **Módulo CRM** funcional
- 📅 **Módulo Agenda** com calendário
- 🔧 **Interface Super Admin**
- 📈 **Dashboard com widgets**

### 🔮 **Próximas Fases**
- 💰 **Monetização** com Stripe
- 🤖 **Agente de IA** para automação
- 📊 **Analytics** e relatórios

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/[seu-usuario]/hub-app.git

# Entre na pasta
cd hub-app

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env.local
# Configure suas variáveis do Supabase

# Execute em desenvolvimento
npm run dev

# Para rede local
npm run dev -- --host
```

### 📱 Testando

- **Local**: http://localhost:5173
- **Rede**: http://[seu-ip]:5173

## 🗄️ Configuração do Banco

O projeto usa Supabase. Execute o schema SQL localizado em `/supabase-schema.sql` no seu projeto Supabase.

### Tabelas principais:
- `tenants` - Empresas/organizações
- `perfis` - Usuários do sistema  
- `modulos` - Módulos disponíveis
- `user_modules` - Módulos ativos por usuário

## 👥 Perfis de Usuário

- **Super Admin**: Gerencia módulos e métricas globais
- **Admin da Empresa**: Controle total da empresa
- **Funcionário**: Acesso limitado aos módulos permitidos
- **Cliente**: Portal white-label (futuro)

## 🎨 Design System

### Princípios
- **Mobile-First**: Funciona perfeitamente no celular
- **Modular**: Componentes reutilizáveis
- **Acessível**: Seguindo padrões de acessibilidade
- **Consistente**: Design system unificado

### Componentes
- Baseado em **Radix UI**
- Animações com **Framer Motion**
- Estilização com **Tailwind CSS**
- Ícones **Lucide React**

## 🔒 Segurança

- ✅ **Row Level Security (RLS)** no Supabase
- ✅ **Autenticação JWT** segura
- ✅ **Isolamento multi-tenant**
- ✅ **HTTPS** obrigatório
- ✅ **Conformidade LGPD**

## 📊 Status do Projeto

**MVP: ~75% completo**
- ✅ Arquitetura: 100%
- ✅ Interface: 95% 
- ⚠️ Módulos funcionais: 30%
- ⚠️ Admin tools: 60%

## 📄 Documentação

Consulte o [PRD.md](./PRD.md) para especificações completas do produto.

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**🚀 Hub.App - Centralize. Automatize. Cresça.**

> **Figma Design**: [hub.App (3)](https://www.figma.com/design/QOchgC88cALxe1YZtGdsQU/hub.App--3-)