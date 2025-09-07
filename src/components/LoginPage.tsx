import { motion } from 'framer-motion';
import { useState } from 'react';
import { LogIn, Shield, Users, Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../hooks/useAuth';
import backgroundImage from '../assets/99ca56e4a7a1b2eb866bf3a55721ef0f2f4d2b5c.png';

export function LoginPage() {
  const { loginWithGoogle, loginWithPassword, signUpWithPassword, isLoading, error, clearError } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      return;
    }

    try {
      if (isSignupMode) {
        await signUpWithPassword(loginData.email, loginData.password);
      } else {
        await loginWithPassword(loginData.email, loginData.password);
      }
    } catch (error) {
      console.error('Erro no login/cadastro:', error);
    }
  };

  const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Limpar erros quando usuário começar a digitar
    if (localError) {
      setLocalError(null);
    }
    if (error) {
      clearError();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full md:px-8 px-[17px] py-[1px] mx-[0px] my-[32px]">
        {/* Logo/Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.h1 
            className="text-white text-6xl md:text-7xl font-light tracking-wider italic mb-5"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            Hub.App
          </motion.h1>
          <motion.p 
            className="text-white/80 text-lg md:text-xl font-light tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            O seu Hub de Aplicativos
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            {/* Features List */}
            <div className="mb-8 space-y-4">
              <motion.div 
                className="flex items-center gap-3 text-white/90"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium">Tenha Controle do seu negócio</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-white/90"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-medium">Acesso seguro e privado</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3 text-white/90"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
              >
                <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-sm font-medium">Soluções integradas</span>
              </motion.div>
            </div>

            {/* Email/Password Login Form */}
            <motion.form
              onSubmit={handleEmailLogin}
              className="space-y-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 text-sm font-medium">
                  Email ou usuário
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleInputChange('email')}
                    placeholder="seu@email.com"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={handleInputChange('password')}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl h-12 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading || !loginData.email || !loginData.password}
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white border-0 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>{isSignupMode ? 'Criando conta...' : 'Entrando...'}</span>
                  </div>
                ) : (
                  <span className="font-medium">
                    {isSignupMode ? 'Criar Conta' : 'Entrar'}
                  </span>
                )}
              </Button>
            </motion.form>

            {/* Divider */}
            <motion.div 
              className="flex items-center gap-4 my-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-white/60 text-sm">ou</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </motion.div>

            {/* Google Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 border-0 rounded-xl shadow-lg transition-all duration-300 group relative overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                />
                
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="font-medium">Conectando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="font-medium">Continuar com Google</span>
                    </>
                  )}
                </div>
              </Button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.7 }}
            >
              <p className="text-white/70 text-sm">
                {isSignupMode ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                <button
                  onClick={() => {
                    setIsSignupMode(!isSignupMode);
                    setLocalError(null); // Limpar erros locais ao trocar de modo
                    clearError(); // Limpar erros do hook
                  }}
                  className="text-blue-400 hover:text-blue-300 underline transition-colors font-medium"
                  disabled={isLoading}
                >
                  {isSignupMode ? 'Fazer login' : 'Criar conta'}
                </button>
              </p>
            </motion.div>

            {/* Error Message */}
            {(error || localError) && (
              <motion.div 
                className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-red-200 text-sm text-center">{error || localError}</p>
              </motion.div>
            )}

            {/* Sign Up Mode Info */}
            {isSignupMode && !error && !localError && (
              <motion.div
                className="mt-4 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-blue-200 text-sm text-center leading-relaxed">
                  🚀 <strong>Bem-vindo!</strong> Crie sua conta e configure sua empresa.
                  <br />
                  Você também pode usar o <strong>Google</strong> para acelerar o processo.
                </p>
              </motion.div>
            )}

            {/* Privacy Note */}
            <motion.p 
              className="text-white/60 text-xs text-center mt-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
            >
              Ao continuar, você concorda com nossos termos de uso. 
              Seus dados estão seguros e protegidos.
            </motion.p>
          </div>
        </motion.div>

        {/* Bottom Decoration */}
        <motion.div 
          className="mt-12 flex items-center gap-2 text-white/40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <div className="w-8 h-0.5 bg-white/20 rounded-full" />
          <LogIn className="w-4 h-4" />
          <div className="w-8 h-0.5 bg-white/20 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}