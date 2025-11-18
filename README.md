# FlipDoc - Document Converter

Sistema de conversão de documentos entre múltiplos formatos (PDF, DOCX, Markdown, etc).

## 🏗️ Arquitetura

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   React     │─────▶│   Express   │─────▶│  PostgreSQL  │
│  Frontend   │      │     BFF     │      │   Database   │
│  (Vite)     │      │ (TypeScript)│      └──────────────┘
└─────────────┘      └─────────────┘
     :5173                :4000               :5432
```

## 📦 Tecnologias

### Frontend
- **React 18.2** com TypeScript
- **Vite 5.3** - Build tool
- **Material-UI 5.14** - Design System
- **React Query 4.39** - Cache e estado de servidor
- **React Router 7.9** - Roteamento

### Backend (BFF)
- **Express 4.21** com TypeScript
- **PostgreSQL** - Banco de dados
- **Multer** - Upload de arquivos
- **pg** - Driver PostgreSQL
- **tsx** - TypeScript runtime

### Bibliotecas de Conversão
- **pdf-parse** - Extração de texto de PDF
- **pdf-lib** - Manipulação e criação de PDF
- **docx** - Criação de arquivos DOCX
- **mammoth** - DOCX para HTML/texto
- **html-pdf-node** - HTML para PDF
- **sharp** - Processamento de imagens
- **marked** - Markdown para HTML
- **turndown** - HTML para Markdown

## 🚀 Instalação Local

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+ (ou Docker)
- npm ou pnpm

### 1. Clonar repositório
```bash
git clone <repo-url>
cd React_FlipDoc
```

### 2. Instalar dependências

#### Frontend
```bash
cd frontend
npm install
```

#### BFF
```bash
cd bff
npm install
```

### 3. Configurar PostgreSQL

#### Opção A: PostgreSQL local
```bash
# Criar banco de dados
createdb flipdoc

# Configurar variáveis de ambiente
cd bff
cp .env.example .env
# Editar .env com suas credenciais
```

#### Opção B: Docker Compose
```bash
# Na raiz do projeto
docker-compose up postgres -d

# Verificar se está rodando
docker ps
```

### 4. Iniciar servidores

#### Terminal 1 - Frontend
```bash
cd frontend
npm run dev
```

#### Terminal 2 - BFF
```bash
cd bff
npm run dev
```

#### Terminal 3 - Worker de Conversão (OBRIGATÓRIO)

**Worker com Conversão Real:**
```bash
cd bff
npm run dev:worker:simple
```

**Características:**
- ✅ Funciona sem PostgreSQL (usa memória)
- ✅ Funciona sem Redis (polling)
- ✅ **Converte arquivos REALMENTE** usando:
  - `pdf-parse` + `docx` para PDF → TXT/DOCX/MD
  - `mammoth` + `html-pdf-node` para DOCX → PDF/TXT/MD
  - `sharp` + `pdf-lib` para Imagens → PDF
  - `marked` + `turndown` para Markdown ↔ HTML/PDF/DOCX
  - Conversões completas entre TXT, PDF, DOCX, MD
- 🔄 Verifica jobs a cada 2 segundos

**Conversões Suportadas:**

**PDF:**
- PDF → TXT, DOCX, DOC, MD

**DOCX/DOC:**
- DOCX/DOC → PDF, TXT, MD

**TXT:**
- TXT → PDF, DOCX, DOC, MD

**Markdown:**
- MD → PDF, DOCX, DOC, HTML, TXT

**Imagens:**
- JPG/PNG/WEBP/GIF/BMP → PDF

**⚠️ IMPORTANTE:** O worker é necessário para processar as conversões de arquivos. Sem ele, os jobs ficarão em status "pending" indefinidamente.

### 5. Acessar aplicação
- **Frontend:** http://localhost:5173
- **BFF API:** http://localhost:4000

## 🐳 Rodando com Docker

### Iniciar todos os serviços
```bash
docker-compose up
```

### Iniciar serviços específicos
```bash
# Apenas banco de dados
docker-compose up postgres redis -d

# Frontend e BFF
docker-compose up frontend bff
```

### Parar serviços
```bash
docker-compose down

# Remover volumes (CUIDADO: apaga dados do banco)
docker-compose down -v
```

## 📊 Estrutura do Banco de Dados

### Tabela `jobs`
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  target_format VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  download_path VARCHAR(512),
  download_name VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status possíveis:**
- `pending` - Aguardando processamento
- `processing` - Em conversão
- `done` - Concluído
- `failed` - Falhou

## 🔧 Variáveis de Ambiente

### BFF (.env)
```env
PORT=4000
NODE_ENV=development

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=flipdoc

REDIS_HOST=localhost
REDIS_PORT=6379

CORS_ORIGIN=http://localhost:5173
```

## 📡 API Endpoints

### POST /api/convert
Upload e criação de job de conversão

**Request:**
```bash
curl -X POST http://localhost:4000/api/convert \
  -F "file=@document.pdf" \
  -F "target=docx"
```

**Response:**
```json
{
  "jobId": "uuid-here"
}
```

### GET /api/jobs/:id/status
Consultar status do job

**Response:**
```json
{
  "status": "done",
  "downloadUrl": "/api/jobs/uuid/download"
}
```

### GET /api/jobs
Listar todos os jobs

**Query params:**
- `limit` (default: 100)
- `offset` (default: 0)

**Response:**
```json
{
  "jobs": [...],
  "total": 10,
  "limit": 100,
  "offset": 0
}
```

### GET /api/jobs/:id/download
Download do arquivo convertido

### PATCH /api/jobs/:id
Atualizar job (usado internamente pelo worker)

## 🧪 Testes

### Frontend
```bash
cd frontend
npm run test
```

### BFF
```bash
cd bff
npm run build  # Verificar erros de TypeScript
```

## 📝 Scripts Disponíveis

### Frontend
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview do build
- `npm run test` - Rodar testes
- `npm run lint` - Linter

### BFF
- `npm run dev` - Servidor de desenvolvimento (hot reload)
- `npm run dev:worker` - Worker de conversão (desenvolvimento)
- `npm run build` - Compilar TypeScript
- `npm start` - Rodar versão compilada
- `npm start:worker` - Worker de conversão (produção)

## 🗺️ Roadmap

### ✅ Completo (Semana 1)
- [x] Design System com Material-UI
- [x] Navegação moderna com AppBar e Tabs
- [x] DropZone com drag and drop
- [x] Feedback visual de upload

### ✅ Completo (Semana 2)
- [x] Migração para PostgreSQL
- [x] Schema de banco de dados
- [x] Repository pattern
- [x] Docker Compose completo

### ✅ Completo (Semana 3)
- [x] Remover jQuery e LegacyUploader
- [x] Refatorar HistoryPage com MUI Table
- [x] Implementar filtros e busca em tempo real
- [x] Adicionar ordenação de colunas
- [x] Auto-refresh a cada 5s

### 🚧 Em Progresso (Semana 4)
- [x] Worker para processar conversões (LibreOffice)
- [x] Filas com Redis (LPUSH/BRPOP)
- [x] Integração worker + PostgreSQL
- [ ] Seletor de formato de conversão
- [ ] Validação de tipos de arquivo
- [ ] Progress bar em tempo real
- [ ] Toast notifications

### 🔜 Futuro (Semana 5+)
- [ ] Suporte a múltiplos formatos (MD, TXT, imagens)
- [ ] Preview de documentos no navegador
- [ ] Conversão em lote
- [ ] Autenticação de usuários

## 🐛 Troubleshooting

### Erro: "Cannot connect to PostgreSQL"
1. Verificar se PostgreSQL está rodando:
```bash
docker-compose ps
# ou
pg_isctl status
```

2. Verificar variáveis de ambiente no `.env`

3. Verificar logs:
```bash
docker-compose logs postgres
```

### Erro: "Port 5173 already in use"
```bash
# Matar processo na porta
lsof -ti:5173 | xargs kill -9  # Unix/Mac
netstat -ano | findstr :5173   # Windows
```

### Frontend não conecta no BFF
1. Verificar CORS no `bff/src/server.ts`
2. Verificar proxy no `frontend/vite.config.ts`
3. Verificar se BFF está rodando na porta 4000

### Jobs ficam em "pending" ou "processing" infinitamente
**Causa:** Worker de conversão não está rodando.

**Solução:**
```bash
cd bff
npm run dev:worker:simple
```

**Verificar:**
- Deve aparecer: "🚀 Worker de Conversão Iniciado"
- Deve aparecer: "⚠️ Worker usando armazenamento em memória"
- Ao fazer upload, deve aparecer: "📬 X job(s) pendente(s)"
- Durante conversão: "🔄 [jobId] Convertendo: arquivo.docx (docx → pdf)"
- Após conversão: "✅ [jobId] Conversão concluída: arquivo.pdf"

**⚠️ IMPORTANTE:** O worker usa conversão REAL com bibliotecas especializadas:
- `pdf-parse` + `docx` para PDF → TXT/DOCX/MD
- `mammoth` + `html-pdf-node` + `turndown` para DOCX ↔ PDF/TXT/MD
- `sharp` + `pdf-lib` para imagens → PDF
- `marked` para Markdown → HTML/PDF/DOCX
- Suporta conversões bidirecionais entre TXT, PDF, DOCX e Markdown

## 📄 Licença

ISC

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas e issues, abra uma issue no GitHub.
