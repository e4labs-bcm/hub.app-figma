# 🧠 Estratégia de Treinamento Progressivo - Agentes Hub.App

## 🎯 Abordagens de "Treinamento" Disponíveis

### **📊 Nível 1: Few-Shot Learning (Implementação Imediata)**

#### **Como Funciona**
Adicionar exemplos específicos nos prompts dos agentes, melhorando a compreensão gradualmente.

```typescript
class PromptManager {
  private examples: Map<string, Example[]> = new Map();

  // Adicionar exemplos baseados no feedback dos usuários
  addExample(moduleId: string, example: Example) {
    const moduleExamples = this.examples.get(moduleId) || [];
    moduleExamples.push(example);
    
    // Manter apenas os 10 melhores exemplos
    if (moduleExamples.length > 10) {
      const sorted = moduleExamples.sort((a, b) => b.successRate - a.successRate);
      this.examples.set(moduleId, sorted.slice(0, 10));
    }
  }

  buildPromptWithExamples(moduleId: string, userMessage: string): string {
    const examples = this.examples.get(moduleId) || [];
    
    return `
Você é o assistente IA do Hub.App para ${moduleId}.

EXEMPLOS DE COMANDOS BEM-SUCEDIDOS:
${examples.map(ex => `
👤 "${ex.userInput}"
🤖 Ação: ${ex.actionId}
📋 Parâmetros: ${JSON.stringify(ex.parameters)}
✅ Sucesso: ${ex.successRate}%
`).join('\n')}

NOVA MENSAGEM DO USUÁRIO: "${userMessage}"

Baseado nos exemplos acima, interprete a mensagem e responda com JSON...
`;
  }
}

interface Example {
  userInput: string;
  actionId: string;
  parameters: any;
  successRate: number;
  feedback: 'positive' | 'negative';
  timestamp: Date;
}
```

#### **Implementação Prática**
```typescript
// Sistema de aprendizado por feedback
export class FeedbackLearning {
  async recordInteraction(interaction: AIInteraction) {
    // Salvar no banco para análise
    await supabase.from('ai_learning_data').insert({
      tenant_id: interaction.tenantId,
      user_input: interaction.message,
      ai_response: interaction.response,
      action_executed: interaction.action,
      user_feedback: interaction.feedback, // 👍 👎
      success: interaction.wasSuccessful,
      created_at: new Date()
    });

    // Se feedback positivo, adicionar como exemplo
    if (interaction.feedback === 'positive') {
      this.promptManager.addExample(interaction.moduleId, {
        userInput: interaction.message,
        actionId: interaction.action.actionId,
        parameters: interaction.action.parameters,
        successRate: 95,
        feedback: 'positive',
        timestamp: new Date()
      });
    }
  }
}
```

### **🔍 Nível 2: Prompt Engineering Iterativo (Semanas 2-4)**

#### **Otimização Baseada em Dados**
```typescript
class PromptOptimizer {
  async analyzeFailures(): Promise<PromptImprovement[]> {
    // Buscar interações que falharam nos últimos 7 dias
    const failures = await supabase
      .from('ai_learning_data')
      .select('*')
      .eq('success', false)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    // Identificar padrões de falha
    const patterns = this.identifyFailurePatterns(failures);
    
    return patterns.map(pattern => ({
      issue: pattern.description,
      suggestedFix: pattern.promptAdjustment,
      affectedCommands: pattern.examples,
      priority: pattern.frequency > 10 ? 'high' : 'medium'
    }));
  }

  private identifyFailurePatterns(failures: any[]): FailurePattern[] {
    const patterns: FailurePattern[] = [];
    
    // Padrão 1: Problemas com datas
    const dateIssues = failures.filter(f => 
      f.user_input.includes('amanhã') || 
      f.user_input.includes('próxima semana') ||
      f.user_input.includes('mês que vem')
    );
    
    if (dateIssues.length > 5) {
      patterns.push({
        description: 'Dificuldade com interpretação de datas relativas',
        promptAdjustment: 'Adicionar mais exemplos de datas em português',
        examples: dateIssues.slice(0, 3),
        frequency: dateIssues.length
      });
    }

    // Padrão 2: Problemas com valores monetários
    const moneyIssues = failures.filter(f => 
      f.user_input.includes('R$') || 
      f.user_input.includes('reais') ||
      f.user_input.includes('mil')
    );
    
    if (moneyIssues.length > 3) {
      patterns.push({
        description: 'Parsing incorreto de valores monetários',
        promptAdjustment: 'Melhorar regex para valores em reais',
        examples: moneyIssues.slice(0, 3),
        frequency: moneyIssues.length
      });
    }

    return patterns;
  }
}
```

### **🧠 Nível 3: Contextual Memory (Mês 2-3)**

#### **Memória de Conversação Inteligente**
```typescript
class ConversationMemory {
  private context: Map<string, ConversationContext> = new Map();

  updateContext(sessionId: string, interaction: AIInteraction) {
    const existing = this.context.get(sessionId) || {
      userId: interaction.userId,
      tenantId: interaction.tenantId,
      preferences: {},
      recentActions: [],
      commonPatterns: {}
    };

    // Aprender padrões do usuário
    this.learnUserPatterns(existing, interaction);
    
    // Manter histórico relevante
    existing.recentActions.push({
      action: interaction.action.actionId,
      timestamp: new Date(),
      success: interaction.wasSuccessful
    });

    // Manter apenas últimas 10 ações
    if (existing.recentActions.length > 10) {
      existing.recentActions = existing.recentActions.slice(-10);
    }

    this.context.set(sessionId, existing);
  }

  private learnUserPatterns(context: ConversationContext, interaction: AIInteraction) {
    // Detectar preferências de linguagem
    if (interaction.message.includes('por favor')) {
      context.preferences.politeness = 'formal';
    } else if (interaction.message.includes('cara') || interaction.message.includes('mano')) {
      context.preferences.politeness = 'casual';
    }

    // Detectar padrões de uso
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17) {
      context.commonPatterns.workingHours = true;
    }

    // Módulos mais usados
    const moduleUsage = context.commonPatterns.moduleUsage || {};
    moduleUsage[interaction.moduleId] = (moduleUsage[interaction.moduleId] || 0) + 1;
    context.commonPatterns.moduleUsage = moduleUsage;
  }

  getPersonalizedPrompt(sessionId: string, basePrompt: string): string {
    const context = this.context.get(sessionId);
    if (!context) return basePrompt;

    let personalizedPrompt = basePrompt;

    // Ajustar tom baseado nas preferências
    if (context.preferences.politeness === 'formal') {
      personalizedPrompt += '\nUse linguagem formal e educada.';
    } else if (context.preferences.politeness === 'casual') {
      personalizedPrompt += '\nUse linguagem casual e amigável.';
    }

    // Adicionar contexto de ações recentes
    const recentSuccesses = context.recentActions
      .filter(a => a.success)
      .slice(-3);
      
    if (recentSuccesses.length > 0) {
      personalizedPrompt += `\n\nAções recentes do usuário: ${recentSuccesses.map(a => a.action).join(', ')}`;
    }

    return personalizedPrompt;
  }
}
```

### **📊 Nível 4: Categorization Learning (Mês 3-4)**

#### **ML para Categorização de Extratos**
```typescript
class CategoryLearning {
  private model: CategoryModel;

  constructor() {
    this.model = new CategoryModel();
    this.loadTrainingData();
  }

  async trainFromUserFeedback() {
    // Buscar correções feitas pelos usuários
    const corrections = await supabase
      .from('ai_pdf_corrections')
      .select('*')
      .is('validated', true);

    const trainingData = corrections.map(correction => ({
      input: {
        description: correction.transaction_description,
        amount: correction.amount,
        merchant: this.extractMerchant(correction.transaction_description)
      },
      output: correction.correct_category
    }));

    // Re-treinar modelo com novos dados
    await this.model.retrain(trainingData);
    
    console.log(`Modelo retreinado com ${trainingData.length} novos exemplos`);
  }

  async categorizeTransaction(transaction: Transaction): Promise<CategoryPrediction> {
    const features = this.extractFeatures(transaction);
    const prediction = await this.model.predict(features);
    
    return {
      category: prediction.category,
      confidence: prediction.confidence,
      alternatives: prediction.alternatives?.slice(0, 3) || []
    };
  }

  private extractFeatures(transaction: Transaction): TransactionFeatures {
    return {
      description_keywords: this.extractKeywords(transaction.description),
      amount_range: this.getAmountRange(transaction.amount),
      merchant_type: this.classifyMerchant(transaction.description),
      day_of_week: new Date(transaction.date).getDay(),
      time_of_day: new Date(transaction.date).getHours()
    };
  }

  // Modelo simples de categorização (pode evoluir para TensorFlow.js)
  private async simpleCategoryModel(features: TransactionFeatures): Promise<CategoryPrediction> {
    const rules = [
      {
        condition: (f: TransactionFeatures) => f.description_keywords.some(k => 
          ['ifood', 'uber eats', 'restaurante', 'lanchonete'].includes(k)
        ),
        category: 'Alimentação',
        confidence: 0.9
      },
      {
        condition: (f: TransactionFeatures) => f.description_keywords.some(k => 
          ['uber', 'taxi', 'posto', 'combustivel', 'gasolina'].includes(k)
        ),
        category: 'Transporte',
        confidence: 0.85
      },
      {
        condition: (f: TransactionFeatures) => f.description_keywords.some(k => 
          ['farmacia', 'drogaria', 'hospital', 'clinica'].includes(k)
        ),
        category: 'Saúde',
        confidence: 0.8
      }
    ];

    for (const rule of rules) {
      if (rule.condition(features)) {
        return {
          category: rule.category,
          confidence: rule.confidence,
          alternatives: []
        };
      }
    }

    return {
      category: 'Outros',
      confidence: 0.5,
      alternatives: ['Alimentação', 'Transporte', 'Serviços']
    };
  }
}
```

### **🎯 Nível 5: A/B Testing de Prompts (Mês 4-6)**

#### **Teste Contínuo de Melhorias**
```typescript
class PromptABTesting {
  private experiments: Map<string, ABExperiment> = new Map();

  createExperiment(name: string, config: ExperimentConfig): ABExperiment {
    const experiment: ABExperiment = {
      id: name,
      variants: config.variants,
      allocation: config.allocation || [50, 50],
      metrics: config.metrics,
      startDate: new Date(),
      isActive: true,
      results: {
        totalInteractions: 0,
        variantResults: {}
      }
    };

    this.experiments.set(name, experiment);
    return experiment;
  }

  getPromptVariant(userId: string, experimentName: string): string {
    const experiment = this.experiments.get(experimentName);
    if (!experiment || !experiment.isActive) {
      return experiment?.variants[0].prompt || '';
    }

    // Deterministic assignment baseado no userId
    const hash = this.hashUserId(userId);
    const bucket = hash % 100;
    
    let cumulative = 0;
    for (let i = 0; i < experiment.variants.length; i++) {
      cumulative += experiment.allocation[i];
      if (bucket < cumulative) {
        return experiment.variants[i].prompt;
      }
    }

    return experiment.variants[0].prompt;
  }

  recordResult(userId: string, experimentName: string, metrics: InteractionMetrics) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return;

    const variantIndex = this.getUserVariant(userId, experimentName);
    const variantId = experiment.variants[variantIndex].id;

    if (!experiment.results.variantResults[variantId]) {
      experiment.results.variantResults[variantId] = {
        interactions: 0,
        successRate: 0,
        avgLatency: 0,
        userSatisfaction: 0
      };
    }

    const variant = experiment.results.variantResults[variantId];
    variant.interactions++;
    variant.successRate = (variant.successRate * (variant.interactions - 1) + (metrics.success ? 1 : 0)) / variant.interactions;
    variant.avgLatency = (variant.avgLatency * (variant.interactions - 1) + metrics.latency) / variant.interactions;
    
    experiment.results.totalInteractions++;
  }

  analyzeResults(experimentName: string): ExperimentAnalysis {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) throw new Error('Experiment not found');

    const analysis: ExperimentAnalysis = {
      experimentId: experimentName,
      duration: Date.now() - experiment.startDate.getTime(),
      isStatisticallySignificant: false,
      winner: null,
      confidence: 0,
      metrics: {}
    };

    // Análise simples - pode ser expandida com testes estatísticos
    const variants = Object.entries(experiment.results.variantResults);
    if (variants.length >= 2) {
      const [variantA, variantB] = variants;
      const [idA, resultsA] = variantA;
      const [idB, resultsB] = variantB;

      // Determinar vencedor baseado em success rate
      if (resultsA.successRate > resultsB.successRate) {
        analysis.winner = idA;
        analysis.confidence = Math.abs(resultsA.successRate - resultsB.successRate);
      } else {
        analysis.winner = idB;
        analysis.confidence = Math.abs(resultsB.successRate - resultsA.successRate);
      }

      // Significância estatística simples (>5% diferença + >100 samples)
      analysis.isStatisticallySignificant = 
        analysis.confidence > 0.05 && 
        Math.min(resultsA.interactions, resultsB.interactions) > 100;
    }

    return analysis;
  }
}

// Exemplo de experimento
const promptExperiment = abTesting.createExperiment('financial_actions_v1', {
  variants: [
    {
      id: 'formal',
      prompt: 'Você é um assistente financeiro profissional...'
    },
    {
      id: 'casual', 
      prompt: 'Oi! Sou seu assistente financeiro e estou aqui para ajudar...'
    }
  ],
  allocation: [50, 50],
  metrics: ['success_rate', 'user_satisfaction', 'task_completion_time']
});
```

## 🚀 **Roadmap de Treinamento Progressivo**

### **📅 Cronograma de Implementação**

#### **Semana 1-2: Setup Básico**
```
✅ Sistema de feedback (👍 👎)
✅ Logging de todas as interações
✅ Estrutura de dados para learning
✅ Interface para correções manuais
```

#### **Semana 3-4: Few-Shot Learning**
```
✅ PromptManager com exemplos dinâmicos
✅ Sistema de ranking de exemplos
✅ Adição automática de casos de sucesso
✅ Interface para curadoria manual
```

#### **Mês 2: Prompt Optimization**
```
✅ Análise automática de padrões de falha
✅ Sugestões de melhorias de prompt
✅ A/B testing básico
✅ Métricas de performance por módulo
```

#### **Mês 3: Contextual Memory**
```
✅ Memória de conversação por usuário
✅ Personalização baseada em padrões
✅ Aprendizado de preferências
✅ Context-aware responses
```

#### **Mês 4: ML Categorization**
```
✅ Modelo de categorização de extratos
✅ Re-training baseado em feedback
✅ Confidence scoring
✅ Alternative suggestions
```

#### **Mês 5-6: Advanced Learning**
```
✅ A/B testing robusto de prompts
✅ Análise estatística de performance
✅ Auto-optimization de modelos
✅ Multi-armed bandit para prompt selection
```

## 📊 **Estrutura de Dados para Learning**

### **Tabelas de Machine Learning**
```sql
-- Dados de treinamento por interação
CREATE TABLE ai_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES perfis(id),
  session_id UUID,
  module_id TEXT,
  user_input TEXT,
  ai_response JSONB,
  action_executed JSONB,
  user_feedback TEXT CHECK (user_feedback IN ('positive', 'negative', 'neutral')),
  success BOOLEAN,
  error_type TEXT,
  latency_ms INTEGER,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exemplos curateados para few-shot learning
CREATE TABLE ai_prompt_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id TEXT NOT NULL,
  user_input_example TEXT NOT NULL,
  expected_action JSONB NOT NULL,
  success_rate DECIMAL(5,2) DEFAULT 0.00,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES perfis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Correções de categorização de PDFs
CREATE TABLE ai_pdf_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  transaction_description TEXT,
  amount DECIMAL(10,2),
  original_category TEXT,
  correct_category TEXT,
  validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES perfis(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experimentos A/B de prompts
CREATE TABLE ai_ab_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT UNIQUE NOT NULL,
  variants JSONB NOT NULL,
  allocation JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  results JSONB DEFAULT '{}'
);

-- Contexto de conversação por usuário
CREATE TABLE ai_user_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES perfis(id),
  tenant_id UUID REFERENCES tenants(id),
  preferences JSONB DEFAULT '{}',
  usage_patterns JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, tenant_id)
);
```

## 💡 **Benefícios do Treinamento Progressivo**

### **📈 Melhoria Contínua**
```
Semana 1: Accuracy 75% → Muitas falhas
Semana 4: Accuracy 85% → Few-shot examples
Mês 2: Accuracy 90% → Prompt optimization  
Mês 3: Accuracy 93% → Context awareness
Mês 6: Accuracy 95% → Full learning pipeline
```

### **🎯 Personalização**
```
Usuário A (Formal):
"Por favor, crie uma receita de consultoria..."
→ Resposta formal e detalhada

Usuário B (Casual):  
"Cria uma receita aí de 2k..."
→ Resposta casual e direta
```

### **💰 Otimização de Custos**
```
Mês 1: 100% requests para LLM → €500
Mês 3: 70% cache hit rate → €150  
Mês 6: 85% cache + better prompts → €75
```

## 🔮 **Futuro: Advanced Learning (Ano 2)**

### **🤖 Custom Model Fine-tuning**
```
Com dados suficientes (6+ meses):
├── Fine-tune Gemini para contexto Hub.App
├── Modelo específico para extratos brasileiros  
├── Embedding customizado para busca semântica
└── Multi-modal model para invoices/documentos
```

### **🧠 Reinforcement Learning**
```
Sistema que aprende com:
├── Resultados de negócio (vendas, eficiência)
├── Feedback comportamental dos usuários
├── Métricas de satisfação de longo prazo
└── Outcomes empresariais mensuráveis
```

---

**🎯 Conclusão**: Com essa estratégia de treinamento progressivo, os agentes do Hub.App se tornam **mais inteligentes a cada interação**, criando uma vantagem competitiva sustentável e melhorando constantemente a experiência dos usuários!