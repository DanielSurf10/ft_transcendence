# Documentação da API - ft_transcendence

## Autenticação

Todos os endpoints protegidos requerem um token JWT no header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Health Check

#### `GET /ping`
Verifica se o servidor está ativo.

**Resposta:**
```json
{
  "ok": true
}
```

---

## Autenticação

### 2. Registrar Usuário

#### `POST /auth/register`
Cria uma nova conta de usuário permanente.

**Body:**
```json
{
  "name": "João Silva",
  "nick": "joao123",
  "email": "joao@example.com",
  "password": "senha1234"
}
```

**Validações:**
- `name`: mínimo 1 caractere
- `nick`: mínimo 2 caracteres, único
- `email`: formato válido, único
- `password`: mínimo 4 caracteres

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "nick": "joao123",
  "email": "joao@example.com",
  "isAnonymous": false
}
```

**Erros:**
- `400` - Nick já em uso
- `400` - Email já cadastrado

---

### 3. Login

#### `POST /auth/login`
Autentica um usuário usando email ou nick.

**Body:**
```json
{
  "identifier": "joao123",
  "password": "senha1234"
}
```

**Validações:**
- `identifier`: email ou nick (mínimo 2 caracteres)
- `password`: mínimo 4 caracteres

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "nick": "joao123",
    "email": "joao@example.com",
    "isAnonymous": false
  }
}
```

**Erros:**
- `401` - Credenciais inválidas

---

### 4. Login Anônimo

#### `POST /auth/anonymous`
Cria uma sessão anônima temporária. Usuários anônimos são removidos após 5 minutos de inatividade.

**Body (opcional):**
```json
{
  "nick": "visitante"
}
```

**Validações:**
- `nick`: mínimo 2 caracteres (opcional)

**Resposta de Sucesso (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "anonymous_visitante",
    "nick": "anonymous_visitante",
    "isAnonymous": true
  }
}
```

**Notas:**
- Token expira em 2 horas
- Nick recebe prefixo `anonymous_`
- Usuário é removido após 5 minutos de inatividade
- Inatividade reseta a cada requisição autenticada

**Erros:**
- `400` - Nick já está em uso

---

### 5. Obter Usuário Atual

#### `GET /auth/me`
Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**

Usuário registrado:
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "nick": "joao123",
    "email": "joao@example.com",
    "isAnonymous": false
  }
}
```

Usuário anônimo:
```json
{
  "user": {
    "id": 2,
    "name": "anonymous_visitante",
    "nick": "anonymous_visitante",
    "isAnonymous": true
  }
}
```

**Erros:**
- `401` - Token inválido
- `404` - Usuário não encontrado ou sessão expirada

**Notas:**
- Atualiza automaticamente o timestamp de atividade para usuários anônimos

---

### 6. Logout

#### `POST /auth/logout`
Encerra a sessão do usuário. Remove imediatamente usuários anônimos.

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Erros:**
- `401` - Token inválido

**Notas:**
- Usuários anônimos são removidos imediatamente do sistema
- Usuários registrados apenas recebem confirmação (token deve ser descartado no cliente)

---

## Sistema de Limpeza Automática

### Usuários Anônimos

O sistema executa limpeza automática de usuários anônimos inativos:

- **Tempo de inatividade:** 5 minutos
- **Intervalo de verificação:** 1 minuto
- **Critério:** Usuários anônimos que não fizeram requisições autenticadas nos últimos 5 minutos

**Endpoints que atualizam atividade:**
- `GET /auth/me`
- Qualquer endpoint protegido com `onRequest: [app.authenticate]`

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Requisição inválida (validação falhou) |
| 401 | Não autorizado (token inválido ou credenciais incorretas) |
| 404 | Recurso não encontrado |
| 415 | Tipo de mídia não suportado (use `Content-Type: application/json`) |

---

## Exemplos de Uso

### cURL

**Registrar:**
```bash
curl -X POST http://localhost:3333/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "João Silva",
    "nick": "joao123",
    "email": "joao@example.com",
    "password": "senha1234"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3333/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "identifier": "joao123",
    "password": "senha1234"
  }'
```

**Login Anônimo:**
```bash
curl -X POST http://localhost:3333/auth/anonymous \
  -H 'Content-Type: application/json' \
  -d '{"nick": "visitante"}'
```

**Obter Usuário:**
```bash
curl http://localhost:3333/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**Logout:**
```bash
curl -X POST http://localhost:3333/auth/logout \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
JWT_SECRET=sua_chave_secreta_super_segura_aqui
```

**Notas:**
- Use uma chave aleatória e segura em produção
- Nunca commite o arquivo `.env` no git

---

## Segurança

### Senhas
- Armazenadas com bcrypt (hash + salt)
- Custo de 10 rounds

### JWT
- Algoritmo: HS256
- Expiração: 2 horas (apenas anônimos)
- Payload: `{ id, email, nick, isAnonymous }`

### Recomendações
- Use HTTPS em produção
- Valide todos os inputs
- Implemente refresh tokens para sessões longas

---

## Próximos Passos

- [ ] Persistência em banco de dados (PostgreSQL/MongoDB)
- [ ] Sistema de refresh token
- [ ] Validar inputs
- [ ] Fazer testes mais rigorosos
