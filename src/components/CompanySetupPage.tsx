import { motion } from 'framer-motion'
import { useState } from 'react'
import { Building2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import backgroundImage from '../assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';

interface CompanySetupPageProps {
  onCreateCompany: (data: {
    nome: string
    cnpj?: string
    email?: string
  }) => Promise<void>
  isLoading?: boolean
}

export function CompanySetupPage({ onCreateCompany, isLoading = false }: CompanySetupPageProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da empresa é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    // Validação opcional de CNPJ
    if (formData.cnpj && formData.cnpj.length > 0) {
      // Remove caracteres não numéricos
      const cnpjNumbers = formData.cnpj.replace(/\D/g, '')
      if (cnpjNumbers.length !== 14) {
        newErrors.cnpj = 'CNPJ deve ter 14 dígitos'
      }
    }

    // Validação opcional de email
    if (formData.email && formData.email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    
    try {
      await onCreateCompany({
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.trim() || undefined,
        email: formData.email.trim() || undefined
      })
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setFormData(prev => ({ ...prev, cnpj: formatted }))
    
    if (errors.cnpj) {
      setErrors(prev => ({ ...prev, cnpj: '' }))
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Building2 className="w-12 h-12 text-blue-400" />
            <h1 className="text-white text-4xl md:text-5xl font-light tracking-wider">
              Configurar Empresa
            </h1>
          </motion.div>
          <motion.p 
            className="text-white/80 text-lg font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Vamos configurar os dados da sua empresa
          </motion.p>
        </motion.div>

        {/* Setup Card */}
        <motion.div 
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-white text-xl">Dados da Empresa</CardTitle>
              <CardDescription className="text-white/70">
                Preencha as informações básicas da sua empresa
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome da Empresa */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.1 }}
                >
                  <Label htmlFor="nome" className="text-white/90 font-medium">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={handleInputChange('nome')}
                    placeholder="Digite o nome da sua empresa"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    disabled={submitting || isLoading}
                  />
                  {errors.nome && (
                    <motion.p 
                      className="text-red-400 text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.nome}
                    </motion.p>
                  )}
                </motion.div>

                {/* CNPJ */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <Label htmlFor="cnpj" className="text-white/90 font-medium">
                    CNPJ (opcional)
                  </Label>
                  <Input
                    id="cnpj"
                    type="text"
                    value={formData.cnpj}
                    onChange={handleCNPJChange}
                    placeholder="00.000.000/0000-00"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    disabled={submitting || isLoading}
                  />
                  {errors.cnpj && (
                    <motion.p 
                      className="text-red-400 text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.cnpj}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email da Empresa */}
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  <Label htmlFor="email" className="text-white/90 font-medium">
                    Email da Empresa (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="contato@empresa.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    disabled={submitting || isLoading}
                  />
                  {errors.email && (
                    <motion.p 
                      className="text-red-400 text-sm flex items-center gap-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <Button
                    type="submit"
                    disabled={submitting || isLoading}
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting || isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <motion.div
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Criando empresa...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Criar Empresa</span>
                      </div>
                    )}
                  </Button>
                </motion.div>
              </form>

              {/* Info */}
              <motion.div
                className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                <p className="text-blue-200 text-sm leading-relaxed">
                  💡 <strong>Dica:</strong> Apenas o nome da empresa é obrigatório. 
                  CNPJ e email podem ser adicionados posteriormente nas configurações.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}