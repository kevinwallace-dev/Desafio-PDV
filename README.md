# Desafio - Feature Management & User Settings

Pequeno ecossistema (App + API) que gerencia preferências do usuário (notificações, modo escuro, assinatura de perfil).

## Tecnologias

**Backend:**
- Node.js 20
- TypeScript 5.5
- Express 4.19
- PostgreSQL 16
---

**Frontend:**
- React Native 0.81
- Expo SDK 54
- TypeScript 5.9
---

## Pré-requisitos

- **Docker** e **Docker Compose** 
- **Node.js 20+** 
- **Expo Go** instalado no celular ou VM Android (para testar no dispositivo físico)
- **ngrok** (opcional, para testar em dispositivo físico via tunnel)

---

## Instalação
### 1. Clone o repositório

```bash
git clone https://github.com/kevinwallace-dev/Desafio-PDV
cd Desafio-PDV
```

---

## Como Executar
### Método 1: Docker (Recomendado)
**1. Inicie a API e banco de dados:**

```bash
docker compose up --build
```

A API estará disponível em `http://localhost:3000`
Se for testar em celular fora da mesma rede, exponha a API (ex.: ngrok) e use a URL pública no app/src/api.ts.
**2. Instale as dependências do app:**

```bash
cd app
npm install
```

**3. Inicie o Expo:**

```bash
npm start 
```

**4. Escolha uma opção:**
- Pressione `a` para Android (requer Android Studio + emulador)
- Pressione `w` para web
- Escaneie o QR code com o **Expo Go** no celular.

---

### Método 2: Desenvolvimento Local (sem Docker)

**Backend:**

```bash
cd api
npm install

# Configure DATABASE_URL
export DATABASE_URL="postgresql://pdv:pdv@localhost:5432/pdv"

# Execute o SQL de inicialização
psql $DATABASE_URL -f sql/init.sql

npm run dev
```

**Frontend:**

```bash
cd app
npm install

# Ajuste o IP em src/api.ts se necessário (ex.: 10.0.2.2 no emulador Android). Se o celular não estiver na mesma rede, use a URL do ngrok.
npm start
```

---

## Testando no Dispositivo Físico

Se estiver testando em um celular físico (via Expo Go), você precisa expor a API para a internet usando ngrok ou outro método:

### 1. Instale o ngrok
Windows (winget):
```bash
winget install ngrok
```
Ou baixe em https://ngrok.com/download

### 2. Crie um tunnel para a API

```bash
ngrok http 3000
```

Você verá algo como:

```
Forwarding   https://abc123.ngrok-free.dev -> http://localhost:3000
```

### 3. Atualize a URL no app

Edite `app/src/api.ts`:

```typescript
export const BASE_URL = "https://abc123.ngrok-free.dev";
```

### 4. Execute o Expo em modo tunnel

```bash
cd app
npx expo start --tunnel
```

Escaneie o QR code com o Expo Go e pronto!

---

##  API Endpoints

### Health Check
```http
GET /health
```

### User Settings
```http
GET /v1/users/:userId/settings

Response:
{
  "userId": 1,
  "notificationsEnabled": false,
  "darkModeEnabled": false,
  "enableSignature": true,
  "profileSignature": "Minha assinatura",
  "updatedAt": "2026-01-19T12:34:56.789Z"
}
```

```http
PUT /v1/users/:userId/settings
Content-Type: application/json

{
  "notificationsEnabled": true,
  "darkModeEnabled": false,
  "enableSignature": true,
  "profileSignature": "Minha assinatura"
}

Response: (mesmo formato do GET)
```

## Como Testar

1. **Inicie a API:** `docker compose up`
2. **Inicie o app:** `cd app && npm start`
3. **Teste o fluxo:**
   - Abra o app no celular/emulador
   - Clique em "Configurações"
   - Ative/desative "Receber Notificações"
   - Ative/desative "Modo Dark"
   - Ative o switch "Assinatura do Perfil"
   - Digite uma assinatura e salve
   - Volte para a Home - a assinatura deve aparecer
   - Desative o switch "Assinatura do Perfil" - a assinatura fica oculta mas salva
   - Reative o switch - a assinatura aparece novamente
   - Consulte os logs de auditoria via API:
     ```bash
     curl http://localhost:3000/v1/users/1/audit
     ```

##  Notas Importantes

- O app usa o usuário ID 1 por padrão
- Apenas alterações reais são registradas no audit
- Em emuladores Android, use `http://10.0.2.2:3000` como BASE_URL
- A auditoria registra mudanças por campo (`notificationsEnabled`, `darkModeEnabled`, `profileSignature`)
- Ajuste BASE_URL em app/src/api.ts conforme ambiente (localhost, 10.0.2.2 ou URL do ngrok)
