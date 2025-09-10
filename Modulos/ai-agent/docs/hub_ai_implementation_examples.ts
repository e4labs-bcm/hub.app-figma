// ============================================
// EXEMPLO 1: COMPONENTE CHAT FLUTUANTE
// ============================================

import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
}

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { sendMessage, getCurrentContext } = useAI();

  // Detecta módulo atual baseado na URL
  const moduleContext = getCurrentContext();

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendMessage(content, moduleContext);
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        actions: response.suggestedActions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mensagem de boas-vindas baseada no contexto
  const welcomeMessage = () => {
    switch (moduleContext.moduleId) {
      case 'multifins':
        return `💰 Olá! Sou seu assistente financeiro. Posso ajudar com receitas, despesas, relatórios e análise de extratos.`;
      case 'crm':
        return `👥 Oi! Sou especialista em CRM. Posso buscar clientes, criar contatos e gerar relatórios de vendas.`;
      case 'agenda':
        return `📅 Olá! Sou seu assistente de agenda. Posso criar compromissos, buscar horários livres e gerenciar eventos.`;
      default:
        return `🤖 Olá, ${user?.nome_completo}! Qual área você gostaria de abordar hoje? Posso ajudar com financeiro, CRM, agenda e muito mais.`;
    }
  };

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all"
      >
        <MessageCircle size={24} />
      </button>

      {/* Modal do chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <h3 className="font-semibold">
              🤖 Assistente IA - {moduleContext.moduleId || 'Hub'}
            </h3>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                {welcomeMessage()}
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="text-sm text-gray-500">
                <div className="animate-pulse">Pensando...</div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// EXEMPLO 2: HOOK PERSONALIZADO PARA IA
// ============================================

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useLocation } from 'react-router-dom';

interface ModuleContext {
  moduleId: string;
  currentPath: string;
  availableData?: any;
}

interface AIResponse {
  message: string;
  suggestedActions?: AIAction[];
  requiresConfirmation?: boolean;
  widgets?: any[];
}

interface AIAction {
  actionId: string;
  label: string;
  parameters: any;
  requiresConfirmation: boolean;
}

export function useAI() {
  const { user } = useAuth();
  const location = useLocation();

  const getCurrentContext = useCallback((): ModuleContext => {
    const path = location.pathname;
    
    // Detecta módulo baseado na URL
    if (path.includes('/multifins')) {
      return { moduleId: 'multifins', currentPath: path };
    } else if (path.includes('/crm')) {
      return { moduleId: 'crm', currentPath: path };
    } else if (path.includes('/agenda')) {
      return { moduleId: 'agenda', currentPath: path };
    }
    
    return { moduleId: 'hub', currentPath: path };
  }, [location]);

  const sendMessage = async (
    message: string, 
    context: ModuleContext
  ): Promise<AIResponse> => {
    const response = await fetch('/api/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({
        message,
        context,
        userId: user?.id,
        tenantId: user?.tenant_id
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao processar mensagem');
    }

    return response.json();
  };

  const executeAction = async (
    actionId: string,
    parameters: any
  ): Promise<any> => {
    const response = await fetch('/api/v1/ai/actions/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify({
        actionId,
        parameters,
        userId: user?.id,
        tenantId: user?.tenant_id
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao executar ação');
    }

    return response.json();
  };

  return {
    getCurrentContext,
    sendMessage,
    executeAction
  };
}

// ============================================
// EXEMPLO 3: PROCESSADOR DE PDF (BACKEND)
// ============================================

import PDFParser from 'pdf2json';
import { analyzeTransactions } from './transaction-analyzer';

interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category?: string;
}

interface ProcessedExtract {
  bankName: string;
  period: { start: string; end: string };
  transactions: BankTransaction[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
}

export class PDFProcessor {
  async processExtract(pdfBuffer: Buffer): Promise<ProcessedExtract> {
    // 1. Extrair texto do PDF
    const extractedText = await this.extractTextFromPDF(pdfBuffer);
    
    // 2. Detectar banco e formato
    const bankInfo = this.detectBankFormat(extractedText);
    
    // 3. Extrair transações
    const transactions = this.extractTransactions(extractedText, bankInfo);
    
    // 4. Categorizar automaticamente
    const categorizedTransactions = await this.categorizeTransactions(transactions);
    
    // 5. Calcular resumo
    const summary = this.calculateSummary(categorizedTransactions);
    
    return {
      bankName: bankInfo.name,
      period: this.extractPeriod(extractedText),
      transactions: categorizedTransactions,
      summary
    };
  }

  private async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      
      pdfParser.on('pdfParser_dataError', reject);
      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });
      
      pdfParser.parseBuffer(pdfBuffer);
    });
  }

  private detectBankFormat(text: string): { name: string; format: string } {
    // Padrões para diferentes bancos
    const bankPatterns = {
      'Nubank': /nubank|nu\spagamentos/i,
      'Itaú': /itaú|banco\sitaú/i,
      'Bradesco': /bradesco/i,
      'Banco do Brasil': /banco\sdo\sbrasil|bb/i,
      'Santander': /santander/i
    };

    for (const [bank, pattern] of Object.entries(bankPatterns)) {
      if (pattern.test(text)) {
        return { name: bank, format: this.getBankFormat(bank) };
      }
    }

    return { name: 'Desconhecido', format: 'generic' };
  }

  private extractTransactions(text: string, bankInfo: any): BankTransaction[] {
    const transactions: BankTransaction[] = [];
    
    // Regex para capturar transações (exemplo para formato genérico)
    const transactionPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\-\+]?\d+[,\.]\d{2})/gm;
    
    let match;
    while ((match = transactionPattern.exec(text)) !== null) {
      const [, date, description, amountStr] = match;
      
      const amount = this.parseAmount(amountStr);
      const type = amount >= 0 ? 'receita' : 'despesa';
      
      transactions.push({
        date: this.formatDate(date),
        description: description.trim(),
        amount: Math.abs(amount),
        type
      });
    }

    return transactions;
  }

  private async categorizeTransactions(transactions: BankTransaction[]): Promise<BankTransaction[]> {
    // IA simples para categorização baseada em palavras-chave
    const categories = {
      'Alimentação': ['restaurante', 'lanchonete', 'ifood', 'uber eats', 'mercado'],
      'Transporte': ['uber', 'taxi', 'combustível', 'posto', 'estacionamento'],
      'Saúde': ['farmácia', 'hospital', 'clínica', 'médico', 'dentista'],
      'Educação': ['escola', 'curso', 'livro', 'universidade'],
      'Lazer': ['cinema', 'teatro', 'academia', 'spotify', 'netflix']
    };

    return transactions.map(transaction => {
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => 
          transaction.description.toLowerCase().includes(keyword)
        )) {
          transaction.category = category;
          break;
        }
      }
      
      if (!transaction.category) {
        transaction.category = 'Outros';
      }
      
      return transaction;
    });
  }

  private calculateSummary(transactions: BankTransaction[]) {
    const receitas = transactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const despesas = transactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalReceitas: receitas,
      totalDespesas: despesas,
      saldo: receitas - despesas
    };
  }

  private parseAmount(amountStr: string): number {
    const cleanAmount = amountStr
      .replace(/[^\d,\.\-\+]/g, '')
      .replace(',', '.');
    return parseFloat(cleanAmount) || 0;
  }

  private formatDate(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private extractPeriod(text: string): { start: string; end: string } {
    // Implementar extração do período do extrato
    // Por ora, retorna período genérico
    return {
      start: '2025-08-01',
      end: '2025-08-31'
    };
  }

  private getBankFormat(bankName: string): string {
    // Retorna formato específico para cada banco
    return 'standard';
  }
}

// ============================================
// EXEMPLO 4: ENDPOINT API PARA EXECUÇÃO DE AÇÕES
// ============================================

import { Request, Response } from 'express';
import { AIService } from '../services/ai-service';
import { validateJWT, getCurrentUser } from '../middleware/auth';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  // Processar mensagem do usuário
  async processMessage(req: Request, res: Response) {
    try {
      const { message, context } = req.body;
      const user = getCurrentUser(req);

      const response = await this.aiService.processUserMessage({
        message,
        context,
        userId: user.id,
        tenantId: user.tenant_id
      });

      res.json(response);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Executar ação específica
  async executeAction(req: Request, res: Response) {
    try {
      const { actionId, parameters } = req.body;
      const user = getCurrentUser(req);

      // Validar permissões
      const hasPermission = await this.aiService.validateActionPermission(
        actionId, 
        user.id, 
        user.tenant_id
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Sem permissão para executar esta ação' 
        });
      }

      const result = await this.aiService.executeAction({
        actionId,
        parameters,
        userId: user.id,
        tenantId: user.tenant_id
      });

      res.json(result);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      res.status(500).json({ error: 'Erro ao executar ação' });
    }
  }

  // Upload e processamento de PDF
  async processPDF(req: Request, res: Response) {
    try {
      const file = req.file; // multer middleware
      const user = getCurrentUser(req);

      if (!file) {
        return res.status(400).json({ error: 'Arquivo PDF necessário' });
      }

      const processor = new PDFProcessor();
      const extractData = await processor.processExtract(file.buffer);

      // Preparar resposta para confirmação
      const confirmationMessage = this.generateConfirmationMessage(extractData);

      res.json({
        success: true,
        extractData,
        confirmationMessage,
        requiresConfirmation: true
      });
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      res.status(500).json({ error: 'Erro ao processar extrato' });
    }
  }

  private generateConfirmationMessage(extractData: ProcessedExtract): string {
    const { transactions, summary } = extractData;
    
    return `📄 **Extrato processado com sucesso!**

**Resumo:**
• ${transactions.length} transações encontradas
• Receitas: R$ ${summary.totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Despesas: R$ ${summary.totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
• Saldo: R$ ${summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

**Categorias identificadas:**
${this.getCategorySummary(transactions)}

Confirma a importação para o módulo financeiro?`;
  }

  private getCategorySummary(transactions: BankTransaction[]): string {
    const categoryCount = transactions.reduce((acc, t) => {
      acc[t.category || 'Outros'] = (acc[t.category || 'Outros'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .map(([category, count]) => `• ${category}: ${count} transações`)
      .join('\n');
  }
}

// ============================================
// EXEMPLO 5: CONFIGURAÇÃO DE ROTAS
// ============================================

import express from 'express';
import { AIController } from '../controllers/ai-controller';
import { validateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();
const aiController = new AIController();

// Aplicar middleware de autenticação em todas as rotas
router.use(validateJWT);

// Processar mensagem de chat
router.post('/chat', aiController.processMessage.bind(aiController));

// Executar ação específica
router.post('/actions/execute', aiController.executeAction.bind(aiController));

// Upload e processamento de PDF
router.post('/process-pdf', upload.single('pdf'), aiController.processPDF.bind(aiController));

// Listar ações disponíveis para o usuário
router.get('/actions', async (req, res) => {
  // Implementar listagem de ações baseada nas permissões do usuário
});

export default router;