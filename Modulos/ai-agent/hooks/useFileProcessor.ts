import { useCallback } from 'react';
import { FileAttachment } from '../types/ai.types';

export function useFileProcessor() {
  const uploadFile = useCallback(async (file: File): Promise<FileAttachment> => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/json'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de arquivo não suportado: ${file.type}`);
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // For PDFs, simulate text extraction
    let extractedContent = '';
    if (file.type === 'application/pdf') {
      extractedContent = await extractPdfContent(file);
    } else if (file.type === 'text/plain') {
      extractedContent = await file.text();
    }

    // Create mock URL (in real implementation, this would be from storage)
    const mockUrl = URL.createObjectURL(file);

    return {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: mockUrl,
      status: 'success',
    };
  }, []);

  const extractPdfContent = useCallback(async (file: File): Promise<string> => {
    // Simulate PDF text extraction
    // In a real implementation, you would use a library like pdf-parse or PDF.js
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `Conteúdo extraído do PDF "${file.name}":\n\nEste é um exemplo de texto extraído de um documento PDF. Em uma implementação real, o conteúdo real do PDF seria extraído e processado aqui.`;
  }, []);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/json'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não suportado: ${file.type}. Tipos permitidos: PDF, TXT, JSON`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 10MB',
      };
    }

    return { valid: true };
  }, []);

  const getFileIcon = useCallback((fileType: string): string => {
    switch (fileType) {
      case 'application/pdf':
        return '📄';
      case 'text/plain':
        return '📝';
      case 'application/json':
        return '📋';
      default:
        return '📎';
    }
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    uploadFile,
    extractPdfContent,
    validateFile,
    getFileIcon,
    formatFileSize,
  };
}