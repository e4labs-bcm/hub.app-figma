# 🌐 Estrutura de API Backend

Esta documentação descreve os endpoints necessários para integrar o frontend com seu backend.

## 🔐 Autenticação

### POST `/api/auth/login`
Realizar login do usuário.

**Request:**
```json
{
  "email": "maria@familia.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Maria Silva",
    "email": "maria@familia.com",
    "familyName": "Família Silva",
    "profileImage": "https://exemplo.com/avatar.jpg",
    "role": "admin"
  },
  "token": "jwt_token_aqui",
  "refreshToken": "refresh_token_aqui"
}
```

### POST `/api/auth/validate`
Validar token de autenticação.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Maria Silva",
  "email": "maria@familia.com",
  "familyName": "Família Silva",
  "profileImage": "https://exemplo.com/avatar.jpg",
  "role": "admin"
}
```

### POST `/api/auth/logout`
Fazer logout (invalidar token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

## 📱 Aplicativos da Família

### GET `/api/family/apps`
Listar aplicativos da família.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Fotos",
    "description": "Galeria de fotos da família",
    "icon": "📸",
    "color": "bg-blue-500",
    "url": "/photos",
    "category": "social",
    "isActive": true,
    "order": 1,
    "lastUsed": "2024-01-15T10:30:00Z",
    "usageCount": 25
  }
]
```

### POST `/api/family/apps`
Criar novo aplicativo (apenas admins).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Novo App",
  "description": "Descrição do app",
  "icon": "🎮",
  "color": "bg-purple-500",
  "url": "/novo-app",
  "category": "entertainment",
  "order": 13
}
```

### PUT `/api/family/apps/:id`
Atualizar aplicativo.

### DELETE `/api/family/apps/:id`
Remover aplicativo.

## 📅 Eventos

### GET `/api/family/events/current`
Obter evento atual e próximos eventos.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "current": {
    "id": "uuid",
    "title": "CELEBRAÇÃO",
    "description": "Reunião semanal da família",
    "location": {
      "address": "Rua 19 de Fevereiro, 96",
      "coordinates": {
        "lat": -22.9068,
        "lng": -43.1729
      }
    },
    "dateTime": {
      "start": "2024-01-21T18:30:00Z",
      "end": "2024-01-21T20:30:00Z"
    },
    "type": "celebration",
    "priority": "high",
    "isActive": true,
    "attendees": ["user1", "user2"],
    "createdBy": "admin_user_id"
  },
  "upcoming": [
    {
      "id": "uuid2",
      "title": "Aniversário João",
      "dateTime": {
        "start": "2024-01-25T19:00:00Z"
      }
    }
  ]
}
```

### POST `/api/family/events`
Criar novo evento.

**Request:**
```json
{
  "title": "Jantar de Família",
  "description": "Jantar mensal da família",
  "location": {
    "address": "Casa da Vovó",
    "coordinates": {
      "lat": -22.9068,
      "lng": -43.1729
    }
  },
  "dateTime": {
    "start": "2024-02-15T19:00:00Z",
    "end": "2024-02-15T22:00:00Z"
  },
  "type": "meeting",
  "priority": "medium"
}
```

### PUT `/api/family/events/:id`
Atualizar evento.

### DELETE `/api/family/events/:id`
Remover evento.

## 📊 Analytics (Opcional)

### POST `/api/analytics/app-usage`
Registrar uso de aplicativo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "appId": "uuid",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "source": "desktop",
    "sessionId": "session_uuid"
  }
}
```

### GET `/api/analytics/dashboard`
Obter dados do dashboard.

## 👥 Membros da Família

### GET `/api/family/members`
Listar membros da família.

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Maria Silva",
    "email": "maria@familia.com",
    "role": "admin",
    "profileImage": "https://exemplo.com/avatar.jpg",
    "lastSeen": "2024-01-15T10:30:00Z",
    "isActive": true
  }
]
```

### POST `/api/family/members/invite`
Convidar novo membro.

## 📁 Arquivos e Mídia

### POST `/api/upload/avatar`
Upload de avatar do usuário.

### POST `/api/upload/app-icon`
Upload de ícone personalizado para app.

### GET `/api/media/:id`
Baixar arquivo de mídia.

## 🔧 Configurações

### GET `/api/family/settings`
Obter configurações da família.

### PUT `/api/family/settings`
Atualizar configurações.

---

## 🏗️ Estrutura de Banco de Dados Sugerida

### Tabela: `users`
```sql
id (UUID, PK)
email (VARCHAR, UNIQUE)
password_hash (VARCHAR)
name (VARCHAR)
profile_image (VARCHAR)
role (ENUM: 'admin', 'member')
family_id (UUID, FK)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
last_seen (TIMESTAMP)
is_active (BOOLEAN)
```

### Tabela: `families`
```sql
id (UUID, PK)
name (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
settings (JSON)
```

### Tabela: `apps`
```sql
id (UUID, PK)
family_id (UUID, FK)
name (VARCHAR)
description (TEXT)
icon (VARCHAR)
color (VARCHAR)
url (VARCHAR)
category (ENUM)
is_active (BOOLEAN)
order_position (INTEGER)
created_by (UUID, FK)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Tabela: `events`
```sql
id (UUID, PK)
family_id (UUID, FK)
title (VARCHAR)
description (TEXT)
location_address (VARCHAR)
location_lat (DECIMAL)
location_lng (DECIMAL)
start_datetime (TIMESTAMP)
end_datetime (TIMESTAMP)
type (ENUM)
priority (ENUM)
is_active (BOOLEAN)
created_by (UUID, FK)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Tabela: `app_usage` (Analytics)
```sql
id (UUID, PK)
user_id (UUID, FK)
app_id (UUID, FK)
timestamp (TIMESTAMP)
session_id (VARCHAR)
metadata (JSON)
```

---

## 🐳 Docker Compose de Exemplo

```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/familia
      - JWT_SECRET=seu_jwt_secret_aqui
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=familia
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:3001/api

volumes:
  postgres_data:
```

Esta estrutura fornece uma base sólida para integrar o frontend com qualquer backend de sua escolha!