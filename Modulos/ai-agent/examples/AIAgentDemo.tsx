import { useState } from 'react';
import { Button } from '../../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { FloatingChatButton } from '../components/FloatingChatButton';
import { ChatModal } from '../components/ChatModal';
import { useAIAgent } from '../AIAgentProvider';

export function AIAgentDemo() {
  const [demoState, setDemoState] = useState({
    currentModule: 'vendas',
    currentPage: 'dashboard',
  });

  const { openChat, setContext } = useAIAgent();

  const handleContextChange = (module: string, page: string) => {
    setDemoState({ currentModule: module, currentPage: page });
    setContext(module, page);
  };

  const handleOpenContextualChat = (module: string, page: string) => {
    handleContextChange(module, page);
    openChat();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demo do AI Agent</CardTitle>
          <CardDescription>
            Teste a funcionalidade do assistente de IA em diferentes contextos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Context Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Vendas</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('vendas', 'dashboard')}
                  className="w-full justify-start"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('vendas', 'nova-venda')}
                  className="w-full justify-start"
                >
                  Nova Venda
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('vendas', 'relatorios')}
                  className="w-full justify-start"
                >
                  Relatórios
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-2">Financeiro</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('financeiro', 'dashboard')}
                  className="w-full justify-start"
                >
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('financeiro', 'lancamentos')}
                  className="w-full justify-start"
                >
                  Lançamentos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('financeiro', 'fluxo-caixa')}
                  className="w-full justify-start"
                >
                  Fluxo de Caixa
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-2">Estoque</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('estoque', 'produtos')}
                  className="w-full justify-start"
                >
                  Produtos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('estoque', 'movimentacao')}
                  className="w-full justify-start"
                >
                  Movimentação
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenContextualChat('estoque', 'inventario')}
                  className="w-full justify-start"
                >
                  Inventário
                </Button>
              </div>
            </Card>
          </div>

          {/* Current Context */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Contexto Atual</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Módulo:</strong> {demoState.currentModule} | 
              <strong> Página:</strong> {demoState.currentPage}
            </p>
          </div>

          {/* Test Scenarios */}
          <div className="space-y-3">
            <h4 className="font-medium">Cenários de Teste</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="p-3">
                <h5 className="text-sm font-medium mb-1">Criar Nova Venda</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Teste: "Quero criar uma nova venda"
                </p>
                <Button
                  size="sm"
                  onClick={() => handleOpenContextualChat('vendas', 'nova-venda')}
                >
                  Testar
                </Button>
              </Card>

              <Card className="p-3">
                <h5 className="text-sm font-medium mb-1">Upload de PDF</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Teste upload e análise de documentos
                </p>
                <Button
                  size="sm"
                  onClick={() => handleOpenContextualChat('financeiro', 'lancamentos')}
                >
                  Testar
                </Button>
              </Card>

              <Card className="p-3">
                <h5 className="text-sm font-medium mb-1">Relatórios</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Teste: "Preciso do relatório de vendas do mês"
                </p>
                <Button
                  size="sm"
                  onClick={() => handleOpenContextualChat('vendas', 'relatorios')}
                >
                  Testar
                </Button>
              </Card>

              <Card className="p-3">
                <h5 className="text-sm font-medium mb-1">Configurações</h5>
                <p className="text-xs text-muted-foreground mb-2">
                  Teste: "Como configurar notificações?"
                </p>
                <Button
                  size="sm"
                  onClick={() => handleOpenContextualChat('configuracoes', 'geral')}
                >
                  Testar
                </Button>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
              Como Testar
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use o botão flutuante no canto inferior direito</li>
              <li>• Teste diferentes contextos clicando nos botões acima</li>
              <li>• Experimente comandos como "criar", "editar", "deletar"</li>
              <li>• Faça upload de arquivos PDF para teste</li>
              <li>• Observe as sugestões contextuais</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}