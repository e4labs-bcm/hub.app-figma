# 🚀 Deploy Hub.App Online

Guia completo para deixar o Hub.App acessível online para qualquer pessoa.

## 🎯 Opções de Deploy Disponíveis

### 1. Vercel (Recomendado) ⚡
**Vantagens**: Grátis, fácil, optimizado para React/Vite, CDN global

**Passos**:
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Click "Add New Project"
4. Conecte o repositório: `https://github.com/e4labs-bcm/hub.app-figma`
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

**Resultado**: Seu app estará em `https://hub-app-figma.vercel.app`

### 2. Netlify 🌐
**Vantagens**: Grátis, deploy automático via Git

**Passos**:
1. Acesse [netlify.com](https://netlify.com)
2. Login com GitHub
3. "New site from Git" > Conectar GitHub
4. Selecione: `e4labs-bcm/hub.app-figma`
5. Build settings (já configurado no `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Configure Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

**Resultado**: Seu app estará em `https://hub-app-figma.netlify.app`

### 3. GitHub Pages (Básico) 📄
**Limitações**: Apenas sites estáticos, sem server-side features

**Deploy automático**: Já configurado no repositório
- Acesse: Settings > Pages > Source: GitHub Actions

## 🔧 Configuração Necessária

### Variáveis de Ambiente
```bash
# No painel do serviço escolhido (Vercel/Netlify):
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### URLs de Exemplo
- **Vercel**: `https://hub-app-figma.vercel.app`
- **Netlify**: `https://hub-app-figma.netlify.app`
- **Custom Domain**: Configure no painel do serviço

## ⚡ Deploy Mais Rápido (Vercel CLI)

Se tiver o Vercel CLI instalado localmente:

```bash
# 1. Login (abre o browser)
vercel login

# 2. Deploy
vercel --prod

# 3. Configure as environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# 4. Redeploy
vercel --prod
```

## 🌍 Como Acessar Online

Após o deploy, qualquer pessoa poderá acessar:

1. **URL do deploy** (ex: hub-app-figma.vercel.app)
2. **Criar conta** ou fazer login
3. **Criar empresa** (primeiro acesso)
4. **Usar o Hub.App** completo

## 🔒 Configuração do Supabase para Produção

### 1. URLs Autorizadas
No Supabase Dashboard > Authentication > URL Configuration:

```
Site URL: https://hub-app-figma.vercel.app
Additional redirect URLs:
- https://hub-app-figma.vercel.app
- https://hub-app-figma.netlify.app
- http://localhost:3000 (para desenvolvimento)
```

### 2. CORS Policy
No Supabase, adicione o domínio de produção à política CORS.

## 🚨 Checklist Antes do Deploy

- [ ] Supabase configurado com schema completo
- [ ] Variáveis de ambiente definidas
- [ ] URLs do Supabase atualizadas
- [ ] Código commitado no GitHub
- [ ] Build local testado (`npm run build`)

## 📱 Teste de Produção

1. Acesse a URL de produção
2. Teste em mobile e desktop
3. Crie uma conta teste
4. Configure uma empresa
5. Teste os módulos principais
6. Verificar performance

## 🔄 Deploy Automático

Uma vez configurado, qualquer `git push` para a branch `main` ativa automaticamente um novo deploy!

## 🆘 Troubleshooting

### Build Error
```bash
# Teste local primeiro
npm run build
npm run preview
```

### Environment Variables
- Certifique-se que todas as variáveis estão definidas
- Variáveis devem começar com `VITE_`
- Não incluir espaços ou quebras de linha

### Supabase Connection
- Verificar se URL e Key estão corretos
- URL deve terminar com `.supabase.co`
- Key deve ser a ANON key, não a service_role

---

## 🎉 Resultado Final

Seu Hub.App estará **100% online e acessível** para qualquer pessoa no mundo!

**URL de exemplo**: https://hub-app-figma.vercel.app
**Acesso**: Qualquer pessoa pode criar conta e usar
**Performance**: CDN global, carregamento rápido
**Funcionalidades**: Todas funcionando (auth, modules, multi-tenant)