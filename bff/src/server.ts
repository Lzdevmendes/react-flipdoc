import express from 'express'
import cors from 'cors'
import convertRoutes from './routes/convert'
import path from 'path'
import { testConnection, initializeDatabase } from './db/client'

const app = express()

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/api', convertRoutes)

app.use('/files', express.static(path.join(__dirname, '..', '..', 'storage')))

const PORT = process.env.PORT || 4000

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com PostgreSQL
    console.log('🔄 Testando conexão com PostgreSQL...')
    const connected = await testConnection()

    if (!connected) {
      console.warn('⚠️  PostgreSQL não conectado. Servidor iniciará sem banco de dados.')
      console.warn('⚠️  Configure as variáveis de ambiente POSTGRES_* para habilitar persistência.')
    } else {
      // Inicializar schema do banco
      console.log('🔄 Inicializando schema do banco de dados...')
      await initializeDatabase()
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 BFF listening on http://localhost:${PORT}`)
      console.log(`📁 Uploads dir: ${path.join(__dirname, '..', 'uploads')}`)
    })
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...')
  process.exit(0)
})

startServer()