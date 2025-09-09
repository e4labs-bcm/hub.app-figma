import { usePWAContext } from '../contexts/PWAContext';

export function PWAInstallInstructionsModalSimple() {
  const { showInstructionsModal, closeInstructionsModal, isDesktop, isAndroid, isIOS } = usePWAContext();

  console.log('🔥 SIMPLE DEBUG: PWAInstallInstructionsModalSimple render', {
    showInstructionsModal,
    isDesktop,
    isAndroid,
    isIOS
  });

  if (!showInstructionsModal) {
    console.log('🔥 SIMPLE DEBUG: showInstructionsModal is false, returning null');
    return null;
  }

  console.log('🔥 SIMPLE DEBUG: showInstructionsModal is true, rendering SIMPLE modal');

  const getInstructions = () => {
    if (isIOS) {
      return {
        title: 'Instalar no iOS Safari',
        steps: [
          '1. Toque no ícone de compartilhamento (⬆️) na parte inferior',
          '2. Role para baixo e toque em "Adicionar à Tela de Início"',
          '3. Toque em "Adicionar" para confirmar',
          '4. O Hub.App aparecerá na sua tela inicial!'
        ]
      };
    } else if (isAndroid) {
      return {
        title: 'Instalar no Android',
        steps: [
          '1. Toque no menu do navegador (⋮)',
          '2. Selecione "Instalar app" ou "Adicionar à tela inicial"',
          '3. Confirme a instalação',
          '4. O Hub.App será instalado como um app nativo!'
        ]
      };
    } else {
      return {
        title: 'Instalar no Desktop',
        steps: [
          '1. Procure pelo ícone de instalação na barra de endereços',
          '2. Ou acesse o menu do navegador',
          '3. Procure por "Instalar Hub.App" ou similar',
          '4. Confirme a instalação para ter acesso rápido!'
        ]
      };
    }
  };

  const instructions = getInstructions();

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={closeInstructionsModal}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={closeInstructionsModal}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
            {instructions.title}
          </h2>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Siga os passos abaixo
          </p>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: '20px' }}>
          {instructions.steps.map((step, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              marginBottom: '16px',
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {index + 1}
              </div>
              <p style={{ 
                color: '#374151', 
                fontSize: '14px', 
                lineHeight: '1.5',
                margin: 0
              }}>
                {step.replace(/^\d+\.\s*/, '')}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div style={{
          backgroundColor: '#dbeafe',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#1e40af',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            Benefícios da instalação
          </h3>
          <ul style={{ 
            fontSize: '12px', 
            color: '#1e40af',
            margin: 0,
            paddingLeft: '16px'
          }}>
            <li>Acesso mais rápido sem abrir o navegador</li>
            <li>Funciona offline para algumas funcionalidades</li>
            <li>Experiência nativa como um app real</li>
            <li>Notificações quando disponíveis</li>
          </ul>
        </div>

        {/* Close Button */}
        <button
          onClick={closeInstructionsModal}
          style={{
            width: '100%',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Entendi!
        </button>
      </div>
    </div>
  );
}