# 🤖 Agents de I.A. - Hub.App

Este diretório contém agentes especializados de I.A. para cada função de desenvolvimento no time do Hub.App. Cada agent possui conhecimento específico sobre o projeto, padrões estabelecidos e melhores práticas para sua área de atuação.

## 📋 Índice de Agents

### 👥 **Team Roles**

| Agent | Função | Quando Usar | Arquivo |
|-------|---------|-------------|---------|
| 🚀 **Tech Lead** | Liderança Técnica | Decisões arquiteturais, code reviews, padrões técnicos | [`tech-lead.md`](./tech-lead.md) |
| 💻 **Frontend Developer** | Desenvolvimento Frontend | Implementação de UI, components, mobile-first, React/TS | [`frontend-developer.md`](./frontend-developer.md) |
| 🗄️ **Backend Developer** | Desenvolvimento Backend | Database, RLS policies, multi-tenancy, Supabase | [`backend-developer.md`](./backend-developer.md) |
| 🎨 **UI/UX Designer** | Design e UX | Interface design, usabilidade, mobile-first, design system | [`ui-ux-designer.md`](./ui-ux-designer.md) |
| 🧪 **QA Tester** | Quality Assurance | Testes manuais/automatizados, bugs, multi-tenant testing | [`qa-tester.md`](./qa-tester.md) |
| 📋 **Product Owner** | Gestão de Produto | Features, roadmap, user stories, métricas de negócio | [`product-owner.md`](./product-owner.md) |
| ⚙️ **DevOps Engineer** | Infraestrutura e Deploy | CI/CD, monitoring, security, infraestrutura cloud | [`devops-engineer.md`](./devops-engineer.md) |

---

## 🎯 **Como Usar os Agents**

### 1️⃣ **Seleção do Agent Certo**

Escolha o agent baseado na **natureza da tarefa**, não apenas na tecnologia:

```
Implementar nova tela de clientes:
├── 🎨 UI/UX Designer: Primeiro para design/UX  
├── 💻 Frontend: Para implementação React/mobile
├── 🗄️ Backend: Para APIs e RLS policies
├── 🧪 QA: Para validação e testes
└── 🚀 Tech Lead: Para review arquitetural
```

### 2️⃣ **Contexto Multi-disciplinar**

Muitas tarefas precisam de **múltiplos agents** trabalhando em sequência:

```
Nova funcionalidade completa:
📋 Product Owner → Define requirements e user stories
🎨 UI/UX Designer → Cria mockups e fluxos  
🚀 Tech Lead → Define arquitetura técnica
💻 Frontend → Implementa interface
🗄️ Backend → Cria APIs e database  
🧪 QA Tester → Valida funcionalidade
⚙️ DevOps → Deploy e monitoramento
```

### 3️⃣ **Especialização por Contexto**

Cada agent tem **conhecimento específico** do Hub.App:

- **Multi-tenancy**: Todos conhecem RLS e isolamento de dados
- **Mobile-first**: Priorizaram desenvolvimento mobile
- **Stack**: Experts em React + Supabase + Tailwind
- **Negócio**: Entendem PMEs e casos de uso

---

## 📚 **Guias de Uso por Cenário**

### 🛠️ **Desenvolvimento de Features**

**Cenário**: Implementar módulo de agenda/calendar

**Sequência Recomendada**:
1. **📋 Product Owner** - Define user stories, acceptance criteria
2. **🎨 UI/UX Designer** - Cria layouts mobile-first, fluxos
3. **🚀 Tech Lead** - Define arquitetura, padrões, integrações
4. **🗄️ Backend Developer** - Schema, RLS policies, APIs
5. **💻 Frontend Developer** - Components, hooks, mobile UI  
6. **🧪 QA Tester** - Test cases, validação multi-tenant
7. **⚙️ DevOps Engineer** - Deploy, monitoring, performance

### 🐛 **Resolução de Bugs**

**Cenário**: Bug em produção - dados de cliente não aparecem

**Fluxo de Investigação**:
1. **🧪 QA Tester** - Reproduce bug, identifica steps
2. **🚀 Tech Lead** - Analisa logs, identifica root cause
3. **🗄️ Backend** OU **💻 Frontend** - Fix baseado na causa
4. **🧪 QA Tester** - Valida correção
5. **⚙️ DevOps** - Deploy da correção, monitoring

### 🎨 **Melhorias de UX**

**Cenário**: Interface confusa para cadastro de clientes

**Processo de Melhoria**:
1. **📋 Product Owner** - Analisa métricas, feedback users
2. **🎨 UI/UX Designer** - Redesign do fluxo, usability testing  
3. **💻 Frontend Developer** - Implementa novo design
4. **🧪 QA Tester** - Valida usabilidade, A/B testing
5. **📋 Product Owner** - Acompanha métricas pós-deploy

### ⚡ **Performance & Scaling**

**Cenário**: App lento, muitos usuários simultâneos

**Análise e Otimização**:
1. **⚙️ DevOps Engineer** - Analisa métricas infraestrutura
2. **🗄️ Backend Developer** - Otimiza queries, índices DB
3. **💻 Frontend Developer** - Code splitting, lazy loading
4. **🚀 Tech Lead** - Review arquitetural, caching strategy
5. **🧪 QA Tester** - Performance testing, load testing

---

## 🔧 **Context Switching**

### **Mudança de Contexto Entre Agents**

Quando mudar de agent durante uma conversa:

```
❌ Evite: Mudança abrupta sem contexto
"Agora como Backend Developer, crie as APIs..."

✅ Recomendado: Transição clara com contexto  
"Agora preciso mudar para o contexto de Backend Developer para criar as RLS policies e APIs que vão suportar essa interface que acabamos de planejar..."
```

### **Informações que Cada Agent Precisa**

Todos os agents compartilham conhecimento base sobre:
- ✅ Arquitetura multi-tenant do Hub.App
- ✅ Stack tecnológica (React + Supabase + Tailwind)
- ✅ Padrões mobile-first e responsive design
- ✅ Sistema de módulos e permissões
- ✅ Target audience (PMEs, usuários não-técnicos)

---

## ⚠️ **Importantes Lembretes**

### **Sempre Considerar**:
- 🏢 **Multi-tenancy**: Isolamento obrigatório de dados
- 📱 **Mobile-first**: Funcionalidade perfeita em smartphones  
- 🔐 **Segurança**: RLS policies, autenticação, permissões
- 🎯 **Usabilidade**: Interface simples para não-técnicos
- 📊 **Performance**: Sistema deve escalar para milhares de PMEs

### **Nunca Fazer**:
- ❌ Quebrar isolamento multi-tenant
- ❌ Implementar funcionalidade que não seja mobile-first
- ❌ Ignorar sistema de permissões existente  
- ❌ Criar interfaces complexas demais para o público-alvo
- ❌ Hardcode valores que deveriam ser configuráveis

---

## 🚀 **Quick Start**

1. **Identifique o tipo de tarefa** que você precisa realizar
2. **Escolha o agent apropriado** usando a tabela acima
3. **Forneça contexto específico** da tarefa e objetivos
4. **Mencione outros agents** se precisar de trabalho multi-disciplinar
5. **Valide o resultado** considerando padrões do Hub.App

**Exemplo de uso**:
> "Preciso implementar funcionalidade de relatórios de vendas no módulo CRM. Como **Product Owner**, quais são as user stories mais importantes? Depois preciso do **UI/UX Designer** para criar a interface mobile-first."

---

**🎯 Hub.App - Centralize. Automatize. Cresça.**