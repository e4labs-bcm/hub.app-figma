import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { Button } from "../../../src/components/ui/button";
import { useFileProcessor } from "../hooks/useFileProcessor";

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelect,
  maxFiles = 3,
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { validateFile, getFileIcon, formatFileSize } = useFileProcessor();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [disabled]);

  const handleFiles = useCallback((files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check total file count
    if (selectedFiles.length + files.length > maxFiles) {
      newErrors.push(`Máximo de ${maxFiles} arquivos permitidos`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        // Check for duplicates
        const isDuplicate = selectedFiles.some(
          existing => existing.name === file.name && existing.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push(file);
        } else {
          newErrors.push(`Arquivo "${file.name}" já foi selecionado`);
        }
      } else {
        newErrors.push(validation.error!);
      }
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      const newFileList = [...selectedFiles, ...validFiles];
      setSelectedFiles(newFileList);
      onFilesSelect(newFileList);
    }
  }, [selectedFiles, maxFiles, validateFile, onFilesSelect]);

  const removeFile = useCallback((index: number) => {
    const newFileList = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFileList);
    onFilesSelect(newFileList);
    setErrors([]);
  }, [selectedFiles, onFilesSelect]);

  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className={`w-full ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.json"
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop zone */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-border hover:border-primary/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className={`w-8 h-8 mb-2 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          </motion.div>
          <p className="text-sm font-medium mb-1">
            {dragActive ? 'Solte os arquivos aqui' : 'Clique ou arraste arquivos'}
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, TXT, JSON (máx. 10MB cada, {maxFiles} arquivos)
          </p>
        </div>
      </motion.div>

      {/* Error messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-2"
          >
            {selectedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}