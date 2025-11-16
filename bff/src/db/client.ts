import { Pool, PoolConfig } from 'pg'

// Configuração do pool de conexões PostgreSQL
const poolConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'flipdoc',
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo máximo de conexão ociosa
  connectionTimeoutMillis: 2000, // Timeout para obter conexão
}

// Pool de conexões (singleton)
export const pool = new Pool(poolConfig)

// Event listeners para monitoramento
pool.on('connect', () => {
  console.log('✅ PostgreSQL: Nova conexão estabelecida')
})

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL: Erro inesperado no pool:', err)
})

// Função para testar conexão
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('✅ PostgreSQL conectado:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar no PostgreSQL:', error)
    return false
  }
}

// Função para inicializar o schema (criar tabelas se não existirem)
export async function initializeDatabase(): Promise<void> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSql = await fs.readFile(schemaPath, 'utf-8')

    await pool.query(schemaSql)
    console.log('✅ Schema do banco de dados inicializado')
  } catch (error) {
    console.error('❌ Erro ao inicializar schema:', error)
    throw error
  }
}

// Função para fechar o pool (útil em testes e shutdown)
export async function closePool(): Promise<void> {
  await pool.end()
  console.log('✅ Pool do PostgreSQL fechado')
}
