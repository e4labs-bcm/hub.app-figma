

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_new_tenant"("p_nome_empresa" "text", "p_cnpj" "text" DEFAULT NULL::"text", "p_email_empresa" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  user_email TEXT;
BEGIN
  -- Verificar se usuário já tem empresa
  IF EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Usuário já possui uma empresa vinculada';
  END IF;

  -- Validar dados
  IF LENGTH(TRIM(p_nome_empresa)) < 2 THEN
    RAISE EXCEPTION 'Nome da empresa deve ter pelo menos 2 caracteres';
  END IF;

  -- Obter dados do usuário
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  user_name := COALESCE(SPLIT_PART(user_email, '@', 1), 'Administrador');

  -- Criar tenant
  INSERT INTO tenants (
    nome_empresa, 
    cnpj, 
    email_empresa, 
    status, 
    trial_ends_at
  )
  VALUES (
    TRIM(p_nome_empresa), 
    p_cnpj, 
    COALESCE(p_email_empresa, user_email),
    'trial',
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO new_tenant_id;

  -- Criar perfil admin
  INSERT INTO perfis (id, tenant_id, role, nome_completo)
  VALUES (auth.uid(), new_tenant_id, 'admin_empresa', user_name);

  -- Instalar módulos gratuitos
  INSERT INTO tenants_modulos (tenant_id, modulo_id, status)
  SELECT new_tenant_id, id, 'active'
  FROM modulos
  WHERE is_free = true AND status = 'active';

  -- Conceder permissões básicas
  INSERT INTO perfil_permissoes (perfil_id, permissao_id, concedida_por)
  SELECT auth.uid(), p.id, auth.uid()
  FROM permissoes p
  JOIN modulos m ON p.modulo_id = m.id
  JOIN tenants_modulos tm ON tm.modulo_id = m.id
  WHERE tm.tenant_id = new_tenant_id
  AND tm.status = 'active'
  ON CONFLICT (perfil_id, permissao_id) DO NOTHING;

  -- Log de auditoria
  INSERT INTO audit_log (tenant_id, user_id, acao, entidade, detalhes)
  VALUES (
    new_tenant_id,
    auth.uid(),
    'CREATE',
    'tenant',
    json_build_object(
      'tenant_name', p_nome_empresa,
      'trial_ends', NOW() + INTERVAL '30 days'
    )
  );

  RETURN json_build_object(
    'success', true,
    'tenant_id', new_tenant_id,
    'trial_ends_at', NOW() + INTERVAL '30 days',
    'message', 'Empresa criada com sucesso'
  );
END;
$$;


ALTER FUNCTION "public"."create_new_tenant"("p_nome_empresa" "text", "p_cnpj" "text", "p_email_empresa" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_tenant_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  tenant_id UUID;
BEGIN
  SELECT p.tenant_id INTO tenant_id
  FROM perfis p
  WHERE p.id = auth.uid() AND p.deleted_at IS NULL;
  
  RETURN tenant_id;
END;
$$;


ALTER FUNCTION "public"."get_my_tenant_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_module"("p_nome" "text", "p_descricao" "text", "p_icone_url" "text", "p_link_destino" "text", "p_is_free" boolean DEFAULT true, "p_preco_mensal" numeric DEFAULT NULL::numeric, "p_categoria" "text" DEFAULT 'outros'::"text", "p_manifest" "jsonb" DEFAULT '{}'::"jsonb") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_module_id UUID;
  module_slug TEXT;
BEGIN
  -- Validar dados
  IF LENGTH(TRIM(p_nome)) < 2 THEN
    RAISE EXCEPTION 'Nome do módulo deve ter pelo menos 2 caracteres';
  END IF;

  -- Gerar slug único
  module_slug := lower(regexp_replace(trim(p_nome), '[^a-zA-Z0-9]+', '-', 'g'));
  module_slug := trim(module_slug, '-');
  
  IF EXISTS (SELECT 1 FROM modulos WHERE slug = module_slug) THEN
    module_slug := module_slug || '-' || extract(epoch from now())::integer;
  END IF;

  -- Criar módulo
  INSERT INTO modulos (
    nome, 
    slug,
    descricao, 
    icone_url, 
    link_destino, 
    is_free, 
    preco_mensal, 
    categoria, 
    manifest,
    status
  )
  VALUES (
    TRIM(p_nome), 
    module_slug,
    p_descricao, 
    p_icone_url, 
    p_link_destino, 
    p_is_free, 
    p_preco_mensal, 
    p_categoria, 
    p_manifest,
    'active'
  )
  RETURNING id INTO new_module_id;

  -- Log de auditoria
  INSERT INTO audit_log (tenant_id, acao, entidade, entidade_id, detalhes)
  VALUES (
    NULL,
    'REGISTER',
    'module',
    new_module_id,
    json_build_object(
      'module_name', p_nome,
      'is_free', p_is_free,
      'categoria', p_categoria
    )
  );

  RETURN json_build_object(
    'success', true,
    'module_id', new_module_id,
    'slug', module_slug,
    'message', 'Módulo registrado com sucesso'
  );
END;
$$;


ALTER FUNCTION "public"."register_module"("p_nome" "text", "p_descricao" "text", "p_icone_url" "text", "p_link_destino" "text", "p_is_free" boolean, "p_preco_mensal" numeric, "p_categoria" "text", "p_manifest" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."register_module_permissions"("p_module_name" "text", "p_permissions" "jsonb") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  module_id UUID;
  permission JSONB;
  permissions_created INT := 0;
  permission_code TEXT;
BEGIN
  -- Buscar módulo
  SELECT id INTO module_id FROM modulos WHERE nome = p_module_name AND status = 'active';
  
  IF module_id IS NULL THEN
    RAISE EXCEPTION 'Módulo não encontrado ou inativo: %', p_module_name;
  END IF;

  -- Validar formato
  IF NOT jsonb_typeof(p_permissions) = 'array' THEN
    RAISE EXCEPTION 'Permissões devem ser fornecidas como array JSON';
  END IF;

  -- Processar cada permissão
  FOR permission IN SELECT * FROM jsonb_array_elements(p_permissions)
  LOOP
    IF NOT (permission ? 'codigo' AND permission ? 'nome') THEN
      RAISE EXCEPTION 'Cada permissão deve ter os campos "codigo" e "nome"';
    END IF;

    permission_code := p_module_name || '.' || (permission->>'codigo');

    INSERT INTO permissoes (modulo_id, codigo, nome, descricao, categoria, grupo)
    VALUES (
      module_id,
      permission_code,
      permission->>'nome',
      permission->>'descricao',
      COALESCE(permission->>'categoria', 'basic'),
      permission->>'grupo'
    )
    ON CONFLICT (modulo_id, codigo) DO UPDATE SET
      nome = EXCLUDED.nome,
      descricao = EXCLUDED.descricao,
      categoria = EXCLUDED.categoria,
      grupo = EXCLUDED.grupo;
    
    permissions_created := permissions_created + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'module_id', module_id,
    'permissions_created', permissions_created,
    'message', 'Permissões registradas com sucesso'
  );
END;
$$;


ALTER FUNCTION "public"."register_module_permissions"("p_module_name" "text", "p_permissions" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_permission"("permission_code" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM perfil_permissoes pp
    JOIN permissoes p ON pp.permissao_id = p.id
    JOIN perfis pf ON pp.perfil_id = pf.id
    WHERE pf.id = auth.uid()
    AND p.codigo = permission_code
    AND pf.deleted_at IS NULL
    AND pf.status = 'active'
    AND (pp.data_expiracao IS NULL OR pp.data_expiracao > NOW())
  ) OR EXISTS (
    SELECT 1 FROM perfis 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND deleted_at IS NULL
  );
END;
$$;


ALTER FUNCTION "public"."user_has_permission"("permission_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_module_token"("p_token" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  token_info RECORD;
  tenant_info RECORD;
  module_info RECORD;
BEGIN
  -- Buscar token ativo
  SELECT * INTO token_info
  FROM module_tokens mt
  WHERE mt.token = p_token
  AND mt.is_active = true
  AND (mt.expires_at IS NULL OR mt.expires_at > NOW());

  IF token_info IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Token inválido ou expirado'
    );
  END IF;

  -- Verificar tenant ativo
  SELECT * INTO tenant_info
  FROM tenants t
  WHERE t.id = token_info.tenant_id
  AND t.deleted_at IS NULL
  AND t.status IN ('active', 'trial');

  IF tenant_info IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Empresa não está ativa'
    );
  END IF;

  -- Verificar módulo ativo
  SELECT * INTO module_info
  FROM modulos m
  WHERE m.id = token_info.modulo_id
  AND m.status = 'active';

  IF module_info IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Módulo não está ativo'
    );
  END IF;

  -- Verificar instalação do módulo
  IF NOT EXISTS (
    SELECT 1 FROM tenants_modulos tm
    WHERE tm.tenant_id = token_info.tenant_id
    AND tm.modulo_id = token_info.modulo_id
    AND tm.status IN ('active', 'trial')
    AND (tm.data_expiracao IS NULL OR tm.data_expiracao > NOW())
  ) THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Módulo não está instalado ou expirado para esta empresa'
    );
  END IF;

  -- Atualizar estatísticas do token
  UPDATE module_tokens
  SET last_used_at = NOW(), usage_count = usage_count + 1
  WHERE id = token_info.id;

  RETURN json_build_object(
    'valid', true,
    'tenant_id', token_info.tenant_id,
    'tenant_name', tenant_info.nome_empresa,
    'module_id', token_info.modulo_id,
    'module_name', module_info.nome,
    'permissions', COALESCE(token_info.permissions, ARRAY[]::TEXT[]),
    'token_name', token_info.token_name
  );
END;
$$;


ALTER FUNCTION "public"."validate_module_token"("p_token" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "user_id" "uuid",
    "modulo" "text",
    "acao" "text" NOT NULL,
    "entidade" "text",
    "entidade_id" "uuid",
    "detalhes" "jsonb" DEFAULT '{}'::"jsonb",
    "dados_antigos" "jsonb",
    "dados_novos" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "sessao_id" "text",
    "nivel" "text" DEFAULT 'info'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "audit_log_acao_check" CHECK (("length"("acao") >= 2)),
    CONSTRAINT "audit_log_nivel_check" CHECK (("nivel" = ANY (ARRAY['debug'::"text", 'info'::"text", 'warn'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."convites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "email_convidado" "text" NOT NULL,
    "role_convidado" "text" NOT NULL,
    "token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'base64url'::"text") NOT NULL,
    "status" "text" DEFAULT 'pendente'::"text",
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval) NOT NULL,
    "enviado_por" "uuid",
    "aceito_por" "uuid",
    "aceito_at" timestamp with time zone,
    "mensagem_personalizada" "text",
    "tentativas_envio" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "convites_role_convidado_check" CHECK (("role_convidado" = ANY (ARRAY['admin_empresa'::"text", 'funcionario'::"text", 'cliente'::"text"]))),
    CONSTRAINT "convites_status_check" CHECK (("status" = ANY (ARRAY['pendente'::"text", 'aceito'::"text", 'expirado'::"text", 'cancelado'::"text"])))
);


ALTER TABLE "public"."convites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."kv_store_d3150113" (
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL
);


ALTER TABLE "public"."kv_store_d3150113" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."module_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "modulo_id" "uuid" NOT NULL,
    "token" "text" DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'base64url'::"text") NOT NULL,
    "token_name" "text",
    "expires_at" timestamp with time zone,
    "last_used_at" timestamp with time zone,
    "usage_count" integer DEFAULT 0,
    "ip_whitelist" "inet"[],
    "permissions" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."module_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."modulos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "descricao" "text",
    "descricao_longa" "text",
    "icone_url" "text",
    "screenshots" "text"[],
    "link_destino" "text" NOT NULL,
    "is_free" boolean DEFAULT false,
    "preco_mensal" numeric(10,2),
    "categoria" "text" DEFAULT 'outros'::"text",
    "tags" "text"[],
    "versao" "text" DEFAULT '1.0.0'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "manifest" "jsonb" DEFAULT '{}'::"jsonb",
    "requisitos_minimos" "jsonb" DEFAULT '{}'::"jsonb",
    "desenvolvedor" "text",
    "site_desenvolvedor" "text",
    "suporte_email" "text",
    "avaliacao_media" numeric(2,1),
    "total_instalacoes" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "modulos_avaliacao_media_check" CHECK ((("avaliacao_media" IS NULL) OR (("avaliacao_media" >= (0)::numeric) AND ("avaliacao_media" <= (5)::numeric)))),
    CONSTRAINT "modulos_categoria_check" CHECK (("categoria" = ANY (ARRAY['vendas'::"text", 'financeiro'::"text", 'produtividade'::"text", 'comunicacao'::"text", 'marketing'::"text", 'recursos_humanos'::"text", 'outros'::"text"]))),
    CONSTRAINT "modulos_nome_check" CHECK (("length"("nome") >= 2)),
    CONSTRAINT "modulos_preco_mensal_check" CHECK ((("preco_mensal" IS NULL) OR ("preco_mensal" >= (0)::numeric))),
    CONSTRAINT "modulos_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'deprecated'::"text", 'beta'::"text", 'coming_soon'::"text"])))
);


ALTER TABLE "public"."modulos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants_modulos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "modulo_id" "uuid",
    "data_instalacao" timestamp with time zone DEFAULT "now"(),
    "data_expiracao" timestamp with time zone,
    "configuracoes" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "subscription_item_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "tenants_modulos_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'trial'::"text", 'expired'::"text", 'suspended'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."tenants_modulos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."my_active_modules" AS
 SELECT "m"."id",
    "m"."nome",
    "m"."slug",
    "m"."descricao",
    "m"."icone_url",
    "m"."link_destino",
    "m"."categoria",
    "m"."manifest",
    "tm"."status" AS "installation_status",
    "tm"."data_expiracao",
    "tm"."configuracoes",
        CASE
            WHEN ("tm"."data_expiracao" IS NULL) THEN true
            WHEN ("tm"."data_expiracao" > "now"()) THEN true
            ELSE false
        END AS "is_active"
   FROM ("public"."modulos" "m"
     JOIN "public"."tenants_modulos" "tm" ON (("m"."id" = "tm"."modulo_id")))
  WHERE (("tm"."tenant_id" = "public"."get_my_tenant_id"()) AND ("tm"."status" = ANY (ARRAY['active'::"text", 'trial'::"text"])) AND ("m"."status" = 'active'::"text"));


ALTER VIEW "public"."my_active_modules" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."my_modules" AS
 SELECT "m"."id",
    "m"."nome",
    "m"."slug",
    "m"."descricao",
    "m"."descricao_longa",
    "m"."link_destino",
    "m"."is_free",
    "m"."preco_mensal",
    "m"."categoria",
    "m"."status",
    "m"."desenvolvedor",
    "m"."manifest",
    "m"."avaliacao_media",
    "tm"."data_instalacao",
    "tm"."status" AS "installation_status",
        CASE
            WHEN (("tm"."status" = 'active'::"text") AND ("m"."status" = 'active'::"text")) THEN true
            ELSE false
        END AS "is_active"
   FROM ("public"."modulos" "m"
     JOIN "public"."tenants_modulos" "tm" ON (("m"."id" = "tm"."modulo_id")))
  WHERE (("tm"."tenant_id" = "public"."get_my_tenant_id"()) AND ("tm"."status" = ANY (ARRAY['active'::"text", 'trial'::"text"])) AND ("m"."status" = 'active'::"text"));


ALTER VIEW "public"."my_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfil_permissoes" (
    "perfil_id" "uuid" NOT NULL,
    "permissao_id" "uuid" NOT NULL,
    "concedida_por" "uuid",
    "data_expiracao" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."perfil_permissoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "modulo_id" "uuid" NOT NULL,
    "codigo" "text" NOT NULL,
    "nome" "text" NOT NULL,
    "descricao" "text",
    "categoria" "text" DEFAULT 'basic'::"text",
    "grupo" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "permissoes_categoria_check" CHECK (("categoria" = ANY (ARRAY['basic'::"text", 'advanced'::"text", 'admin'::"text"]))),
    CONSTRAINT "permissoes_codigo_check" CHECK (("length"("codigo") >= 2)),
    CONSTRAINT "permissoes_nome_check" CHECK (("length"("nome") >= 2))
);


ALTER TABLE "public"."permissoes" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."my_permissions" AS
 SELECT "p"."id",
    "p"."modulo_id",
    "p"."codigo",
    "p"."nome",
    "p"."descricao",
    "p"."categoria",
    "m"."nome" AS "modulo_nome"
   FROM (("public"."permissoes" "p"
     JOIN "public"."modulos" "m" ON (("p"."modulo_id" = "m"."id")))
     JOIN "public"."perfil_permissoes" "pp" ON (("p"."id" = "pp"."permissao_id")))
  WHERE (("pp"."perfil_id" = "auth"."uid"()) AND (("pp"."data_expiracao" IS NULL) OR ("pp"."data_expiracao" > "now"())));


ALTER VIEW "public"."my_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notificacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "tenant_id" "uuid",
    "user_id" "uuid",
    "titulo" "text" NOT NULL,
    "mensagem" "text" NOT NULL,
    "tipo" "text" DEFAULT 'info'::"text",
    "acao_url" "text",
    "acao_texto" "text",
    "lida" boolean DEFAULT false,
    "lida_em" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notificacoes_tipo_check" CHECK (("tipo" = ANY (ARRAY['info'::"text", 'success'::"text", 'warning'::"text", 'error'::"text"]))),
    CONSTRAINT "notificacoes_titulo_check" CHECK (("length"("titulo") >= 1))
);


ALTER TABLE "public"."notificacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfis" (
    "id" "uuid" NOT NULL,
    "tenant_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'funcionario'::"text" NOT NULL,
    "nome_completo" "text" NOT NULL,
    "avatar_url" "text",
    "configuracoes_pessoais" "jsonb" DEFAULT '{}'::"jsonb",
    "preferencias_dashboard" "jsonb" DEFAULT '{}'::"jsonb",
    "ultimo_acesso" timestamp with time zone,
    "timezone" "text" DEFAULT 'America/Sao_Paulo'::"text",
    "locale" "text" DEFAULT 'pt_BR'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "perfis_nome_completo_check" CHECK (("length"("nome_completo") >= 2)),
    CONSTRAINT "perfis_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin_empresa'::"text", 'funcionario'::"text", 'cliente'::"text"]))),
    CONSTRAINT "perfis_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'suspended'::"text", 'pending_verification'::"text"])))
);


ALTER TABLE "public"."perfis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome_empresa" "text" NOT NULL,
    "cnpj" "text",
    "email_empresa" "text",
    "telefone" "text",
    "endereco" "jsonb" DEFAULT '{}'::"jsonb",
    "configuracoes" "jsonb" DEFAULT '{}'::"jsonb",
    "plano" "text" DEFAULT 'free'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "trial_ends_at" timestamp with time zone,
    "subscription_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "max_usuarios" integer DEFAULT 5,
    CONSTRAINT "tenants_nome_empresa_check" CHECK (("length"("nome_empresa") >= 2)),
    CONSTRAINT "tenants_plano_check" CHECK (("plano" = ANY (ARRAY['free'::"text", 'starter'::"text", 'pro'::"text", 'enterprise'::"text"]))),
    CONSTRAINT "tenants_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'cancelled'::"text", 'trial'::"text"])))
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."kv_store_d3150113"
    ADD CONSTRAINT "kv_store_d3150113_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."module_tokens"
    ADD CONSTRAINT "module_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_tokens"
    ADD CONSTRAINT "module_tokens_tenant_id_modulo_id_token_name_key" UNIQUE ("tenant_id", "modulo_id", "token_name");



ALTER TABLE ONLY "public"."module_tokens"
    ADD CONSTRAINT "module_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."modulos"
    ADD CONSTRAINT "modulos_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."modulos"
    ADD CONSTRAINT "modulos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."modulos"
    ADD CONSTRAINT "modulos_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfil_permissoes"
    ADD CONSTRAINT "perfil_permissoes_pkey" PRIMARY KEY ("perfil_id", "permissao_id");



ALTER TABLE ONLY "public"."perfis"
    ADD CONSTRAINT "perfis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_modulo_id_codigo_key" UNIQUE ("modulo_id", "codigo");



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."tenants_modulos"
    ADD CONSTRAINT "tenants_modulos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants_modulos"
    ADD CONSTRAINT "tenants_modulos_tenant_id_modulo_id_key" UNIQUE ("tenant_id", "modulo_id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_audit_log_tenant_date" ON "public"."audit_log" USING "btree" ("tenant_id", "created_at" DESC);



CREATE INDEX "idx_audit_log_user_date" ON "public"."audit_log" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_convites_email" ON "public"."convites" USING "btree" ("email_convidado");



CREATE INDEX "idx_convites_token" ON "public"."convites" USING "btree" ("token") WHERE ("status" = 'pendente'::"text");



CREATE INDEX "idx_module_tokens_tenant" ON "public"."module_tokens" USING "btree" ("tenant_id", "modulo_id") WHERE ("is_active" = true);



CREATE INDEX "idx_module_tokens_token" ON "public"."module_tokens" USING "btree" ("token") WHERE ("is_active" = true);



CREATE INDEX "idx_modulos_categoria" ON "public"."modulos" USING "btree" ("categoria") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_modulos_slug" ON "public"."modulos" USING "btree" ("slug") WHERE ("status" = 'active'::"text");



CREATE INDEX "idx_notificacoes_user_lida" ON "public"."notificacoes" USING "btree" ("user_id", "lida", "created_at" DESC);



CREATE INDEX "idx_perfil_permissoes_perfil" ON "public"."perfil_permissoes" USING "btree" ("perfil_id");



CREATE INDEX "idx_perfis_role" ON "public"."perfis" USING "btree" ("role") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_perfis_tenant_id" ON "public"."perfis" USING "btree" ("tenant_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_permissoes_modulo" ON "public"."permissoes" USING "btree" ("modulo_id");



CREATE INDEX "idx_tenants_cnpj" ON "public"."tenants" USING "btree" ("cnpj") WHERE ("cnpj" IS NOT NULL);



CREATE INDEX "idx_tenants_modulos_modulo" ON "public"."tenants_modulos" USING "btree" ("modulo_id", "status");



CREATE INDEX "idx_tenants_modulos_tenant" ON "public"."tenants_modulos" USING "btree" ("tenant_id", "status");



CREATE INDEX "idx_tenants_status" ON "public"."tenants" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "kv_store_d3150113_key_idx" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx1" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx2" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx3" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx4" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx5" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx6" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE INDEX "kv_store_d3150113_key_idx7" ON "public"."kv_store_d3150113" USING "btree" ("key" "text_pattern_ops");



CREATE OR REPLACE TRIGGER "update_convites_updated_at" BEFORE UPDATE ON "public"."convites" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_modulos_updated_at" BEFORE UPDATE ON "public"."modulos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_perfis_updated_at" BEFORE UPDATE ON "public"."perfis" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tenants_modulos_updated_at" BEFORE UPDATE ON "public"."tenants_modulos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tenants_updated_at" BEFORE UPDATE ON "public"."tenants" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id");



ALTER TABLE ONLY "public"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_aceito_por_fkey" FOREIGN KEY ("aceito_por") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_enviado_por_fkey" FOREIGN KEY ("enviado_por") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."module_tokens"
    ADD CONSTRAINT "module_tokens_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."module_tokens"
    ADD CONSTRAINT "module_tokens_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."module_tokens"
    ADD CONSTRAINT "module_tokens_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacoes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."perfis"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfil_permissoes"
    ADD CONSTRAINT "perfil_permissoes_concedida_por_fkey" FOREIGN KEY ("concedida_por") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."perfil_permissoes"
    ADD CONSTRAINT "perfil_permissoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfis"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfil_permissoes"
    ADD CONSTRAINT "perfil_permissoes_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "public"."permissoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfis"
    ADD CONSTRAINT "perfis_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."perfis"
    ADD CONSTRAINT "perfis_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenants_modulos"
    ADD CONSTRAINT "tenants_modulos_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tenants_modulos"
    ADD CONSTRAINT "tenants_modulos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE;



ALTER TABLE "public"."audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "audit_log_tenant_access" ON "public"."audit_log" FOR SELECT USING (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."convites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "convites_tenant_access" ON "public"."convites" USING (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."kv_store_d3150113" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_tokens" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "module_tokens_tenant_access" ON "public"."module_tokens" USING (("tenant_id" = "public"."get_my_tenant_id"()));



CREATE POLICY "modulo_public_read" ON "public"."modulos" FOR SELECT USING (("status" = 'active'::"text"));



ALTER TABLE "public"."modulos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notificacoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "notificacoes_user_access" ON "public"."notificacoes" USING ((("user_id" = "auth"."uid"()) OR ("tenant_id" = "public"."get_my_tenant_id"())));



ALTER TABLE "public"."perfil_permissoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "perfil_permissoes_tenant_access" ON "public"."perfil_permissoes" USING ((EXISTS ( SELECT 1
   FROM "public"."perfis" "p"
  WHERE (("p"."id" = "perfil_permissoes"."perfil_id") AND ("p"."tenant_id" = "public"."get_my_tenant_id"()) AND ("p"."deleted_at" IS NULL)))));



CREATE POLICY "perfil_select" ON "public"."perfis" FOR SELECT USING (((("tenant_id" = "public"."get_my_tenant_id"()) AND ("deleted_at" IS NULL)) OR ("id" = "auth"."uid"())));



CREATE POLICY "perfil_update_own" ON "public"."perfis" FOR UPDATE USING ((("id" = "auth"."uid"()) AND ("deleted_at" IS NULL)));



ALTER TABLE "public"."perfis" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "permissao_public_read" ON "public"."permissoes" FOR SELECT USING (true);



ALTER TABLE "public"."permissoes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tenant_access" ON "public"."tenants" USING ((("id" = "public"."get_my_tenant_id"()) AND ("deleted_at" IS NULL)));



CREATE POLICY "tenant_modulo_access" ON "public"."tenants_modulos" USING (("tenant_id" = "public"."get_my_tenant_id"()));



ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants_modulos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_new_tenant"("p_nome_empresa" "text", "p_cnpj" "text", "p_email_empresa" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_tenant"("p_nome_empresa" "text", "p_cnpj" "text", "p_email_empresa" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_tenant"("p_nome_empresa" "text", "p_cnpj" "text", "p_email_empresa" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_tenant_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."register_module"("p_nome" "text", "p_descricao" "text", "p_icone_url" "text", "p_link_destino" "text", "p_is_free" boolean, "p_preco_mensal" numeric, "p_categoria" "text", "p_manifest" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."register_module"("p_nome" "text", "p_descricao" "text", "p_icone_url" "text", "p_link_destino" "text", "p_is_free" boolean, "p_preco_mensal" numeric, "p_categoria" "text", "p_manifest" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_module"("p_nome" "text", "p_descricao" "text", "p_icone_url" "text", "p_link_destino" "text", "p_is_free" boolean, "p_preco_mensal" numeric, "p_categoria" "text", "p_manifest" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."register_module_permissions"("p_module_name" "text", "p_permissions" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."register_module_permissions"("p_module_name" "text", "p_permissions" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."register_module_permissions"("p_module_name" "text", "p_permissions" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_permission"("permission_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_permission"("permission_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_permission"("permission_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_module_token"("p_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_module_token"("p_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_module_token"("p_token" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."audit_log" TO "anon";
GRANT ALL ON TABLE "public"."audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."convites" TO "anon";
GRANT ALL ON TABLE "public"."convites" TO "authenticated";
GRANT ALL ON TABLE "public"."convites" TO "service_role";



GRANT ALL ON TABLE "public"."kv_store_d3150113" TO "anon";
GRANT ALL ON TABLE "public"."kv_store_d3150113" TO "authenticated";
GRANT ALL ON TABLE "public"."kv_store_d3150113" TO "service_role";



GRANT ALL ON TABLE "public"."module_tokens" TO "anon";
GRANT ALL ON TABLE "public"."module_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."module_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."modulos" TO "anon";
GRANT ALL ON TABLE "public"."modulos" TO "authenticated";
GRANT ALL ON TABLE "public"."modulos" TO "service_role";



GRANT ALL ON TABLE "public"."tenants_modulos" TO "anon";
GRANT ALL ON TABLE "public"."tenants_modulos" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants_modulos" TO "service_role";



GRANT ALL ON TABLE "public"."my_active_modules" TO "anon";
GRANT ALL ON TABLE "public"."my_active_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."my_active_modules" TO "service_role";



GRANT ALL ON TABLE "public"."my_modules" TO "anon";
GRANT ALL ON TABLE "public"."my_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."my_modules" TO "service_role";



GRANT ALL ON TABLE "public"."perfil_permissoes" TO "anon";
GRANT ALL ON TABLE "public"."perfil_permissoes" TO "authenticated";
GRANT ALL ON TABLE "public"."perfil_permissoes" TO "service_role";



GRANT ALL ON TABLE "public"."permissoes" TO "anon";
GRANT ALL ON TABLE "public"."permissoes" TO "authenticated";
GRANT ALL ON TABLE "public"."permissoes" TO "service_role";



GRANT ALL ON TABLE "public"."my_permissions" TO "anon";
GRANT ALL ON TABLE "public"."my_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."my_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."notificacoes" TO "anon";
GRANT ALL ON TABLE "public"."notificacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."notificacoes" TO "service_role";



GRANT ALL ON TABLE "public"."perfis" TO "anon";
GRANT ALL ON TABLE "public"."perfis" TO "authenticated";
GRANT ALL ON TABLE "public"."perfis" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
