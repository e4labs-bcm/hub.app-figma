import { PWAInstallInstructions } from './PWAInstallInstructions';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallInstructionsModal() {
  const { showInstructionsModal, closeInstructionsModal } = usePWAInstall();

  return (
    <PWAInstallInstructions 
      isOpen={showInstructionsModal} 
      onClose={closeInstructionsModal} 
    />
  );
}