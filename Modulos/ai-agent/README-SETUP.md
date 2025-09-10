# 🤖 AI Agent - Setup e Configuração

Este documento explica como configurar e usar o AI Agent no Hub.App.

## 📋 Pré-requisitos

1. ✅ AI Agent instalado via App Store do Hub.App
2. ✅ Conta Google com acesso à API do Gemini
3. ✅ Configuração de variáveis de ambiente

## 🔧 Configuração

### 1. API Key do Google Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Gere uma nova API Key
3. Adicione no arquivo `.env.local`:

```env
VITE_GEMINI_API_KEY=sua_api_key_aqui
```

### 2. Configurações Opcionais

```env
# Habilitar/desabilitar AI Agent
VITE_AI_AGENT_ENABLED=true

# Modo debug (logs detalhados)
VITE_AI_AGENT_DEBUG=true
```

## 🚀 Como Usar

### Acesso ao AI Agent

1. **Via Ícone no Grid**: Clique no ícone "AI Agent" no grid de aplicativos
2. **Via Botão Flutuante**: Quando minimizado, aparece como botão flutuante no canto direito

### Comandos Disponíveis

#### ✨ Comandos Básicos
```
• "Olá" / "Oi" - Iniciar conversa
• "Ajuda" - Listar funcionalidades disponíveis
• "Criar [item]" - Criar novos registros
• "Buscar [informação]" - Pesquisar dados
```

#### 📊 Exemplos Práticos
```
• "Criar cliente João Silva"
• "Agendar reunião amanhã às 14h"
• "Lançar receita de R$ 1.500"
• "Relatório financeiro do mês"
• "Clientes que não compram há 30 dias"
```

#### 📎 Upload de Arquivos
```
• Anexar PDF de extrato bancário
• Processar documentos automaticamente
• Categorizar transações
```

## 🎯 Funcionalidades Implementadas

### ✅ Disponível (MVP)
- Chat contextual por módulo
- Processamento de linguagem natural em português
- Sistema de confirmação para ações
- Anonimização de dados (LGPD)
- Interface mobile-first
- Botão flutuante minimizável

### 🚧 Em Desenvolvimento
- Integração real com API do Gemini
- Ações executáveis nos módulos
- Processamento de PDFs
- Relatórios automáticos

### 🔮 Futuro (Roadmap)
- Voice input/output
- Integração WhatsApp
- Automações baseadas em triggers
- Analytics avançados

## 🔧 Arquitetura Técnica

### Componentes Principais

```
AI Agent/
├── AIAgentProvider.tsx          # Context provider principal
├── components/
│   ├── FloatingChatButton.tsx   # Botão flutuante
│   ├── ChatModal.tsx           # Interface do chat
│   ├── ActionConfirmation.tsx  # Sistema de confirmação
│   └── ContextualHeader.tsx    # Header contextual
├── services/llm/
│   ├── LLMRouter.ts            # Roteamento entre providers
│   ├── providers/
│   │   └── GeminiProvider.ts   # Integração com Gemini
│   └── types.ts                # Tipos TypeScript
└── hooks/
    ├── useAI.ts                # Hook principal de IA
    ├── useChat.ts              # Gerenciamento do chat
    └── useFileProcessor.ts     # Processamento de arquivos
```

### Fluxo de Dados

```
1. Usuário digita mensagem
2. useAI processa via LLMRouter
3. GeminiProvider anonimiza dados
4. Gemini API processa e retorna resposta
5. Sistema extrai ações possíveis
6. ActionConfirmation exibe opções
7. Usuário confirma → Ação executada
```

## 🔐 Segurança e Privacidade

### Proteções Implementadas

- ✅ **Anonimização Automática**: Nomes e valores são substituídos por tokens
- ✅ **Multi-tenant**: Isolamento completo entre empresas
- ✅ **LGPD Compliance**: Dados sensíveis nunca saem do servidor
- ✅ **Rate Limiting**: Controle de uso por usuário/empresa
- ✅ **Logs Auditáveis**: Rastreamento de todas as ações

### Dados Anonimizados

```typescript
// Antes (nunca enviado):
"Criar receita para João Silva de R$ 3.500"

// Depois (enviado para IA):
"Criar receita para CLIENTE_XXX de VALOR_XXX"
```

## 📊 Monitoramento

### Métricas Coletadas

- Número de mensagens por usuário/mês
- Taxa de sucesso das ações
- Tempo de resposta médio
- Custos por interação
- Satisfação do usuário

### Logs de Debug

```javascript
// No console do navegador:
🤖 AI Response: { message, actions, metadata }
🔄 Routing to provider: gemini
✅ Provider gemini responded successfully
```

## 🐛 Troubleshooting

### Problemas Comuns

**Botão flutuante não aparece**
- Verificar se AI Agent está instalado via App Store
- Confirmar que `VITE_AI_AGENT_ENABLED=true`

**Respostas genéricas da IA**
- Verificar API Key do Gemini
- Confirmar quota da API não esgotada

**Erros de permissão**
- Verificar permissões do usuário no módulo
- Confirmar isolamento multi-tenant

## 📞 Suporte

Para dúvidas técnicas ou problemas:

1. Verificar logs no console do navegador
2. Consultar documentação da API do Gemini
3. Abrir issue no repositório do projeto

## 🔄 Atualizações

Este AI Agent segue o versionamento semântico:
- **Patch**: Correções de bugs
- **Minor**: Novas funcionalidades
- **Major**: Mudanças breaking

Verifique regularmente por atualizações via App Store interno.