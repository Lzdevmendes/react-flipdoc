import { pool } from './client'

// Interface para representar um Job
export interface Job {
  id: string
  original_name: string
  file_path: string
  target_format: string
  status: 'pending' | 'processing' | 'done' | 'failed'
  download_path?: string
  download_name?: string
  error_message?: string
  created_at: Date
  updated_at: Date
}

// DTO para criação de job
export interface CreateJobDto {
  id: string
  original_name: string
  file_path: string
  target_format: string
}

// DTO para atualização de job
export interface UpdateJobDto {
  status?: 'pending' | 'processing' | 'done' | 'failed'
  download_path?: string
  download_name?: string
  error_message?: string
}

// Repository com operações de banco
export class JobsRepository {
  /**
   * Criar um novo job
   */
  async create(data: CreateJobDto): Promise<Job> {
    const query = `
      INSERT INTO jobs (id, original_name, file_path, target_format)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    const values = [data.id, data.original_name, data.file_path, data.target_format]

    const result = await pool.query(query, values)
    return result.rows[0]
  }

  /**
   * Buscar job por ID
   */
  async findById(id: string): Promise<Job | null> {
    const query = 'SELECT * FROM jobs WHERE id = $1'
    const result = await pool.query(query, [id])

    return result.rows[0] || null
  }

  /**
   * Listar todos os jobs (com paginação opcional)
   */
  async findAll(limit = 100, offset = 0): Promise<Job[]> {
    const query = `
      SELECT * FROM jobs
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `
    const result = await pool.query(query, [limit, offset])

    return result.rows
  }

  /**
   * Buscar jobs por status
   */
  async findByStatus(status: Job['status']): Promise<Job[]> {
    const query = `
      SELECT * FROM jobs
      WHERE status = $1
      ORDER BY created_at DESC
    `
    const result = await pool.query(query, [status])

    return result.rows
  }

  /**
   * Atualizar um job
   */
  async update(id: string, data: UpdateJobDto): Promise<Job | null> {
    // Construir query dinâmica baseada nos campos fornecidos
    const fields: string[] = []
    const values: (string | undefined)[] = []
    let paramIndex = 1

    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`)
      values.push(data.status)
    }

    if (data.download_path !== undefined) {
      fields.push(`download_path = $${paramIndex++}`)
      values.push(data.download_path)
    }

    if (data.download_name !== undefined) {
      fields.push(`download_name = $${paramIndex++}`)
      values.push(data.download_name)
    }

    if (data.error_message !== undefined) {
      fields.push(`error_message = $${paramIndex++}`)
      values.push(data.error_message)
    }

    if (fields.length === 0) {
      // Nada para atualizar
      return this.findById(id)
    }

    values.push(id) // ID é o último parâmetro

    const query = `
      UPDATE jobs
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await pool.query(query, values)
    return result.rows[0] || null
  }

  /**
   * Deletar um job
   */
  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM jobs WHERE id = $1 RETURNING id'
    const result = await pool.query(query, [id])

    return result.rowCount !== null && result.rowCount > 0
  }

  /**
   * Contar total de jobs
   */
  async count(): Promise<number> {
    const query = 'SELECT COUNT(*) as total FROM jobs'
    const result = await pool.query(query)

    return parseInt(result.rows[0].total, 10)
  }

  /**
   * Contar jobs por status
   */
  async countByStatus(status: Job['status']): Promise<number> {
    const query = 'SELECT COUNT(*) as total FROM jobs WHERE status = $1'
    const result = await pool.query(query, [status])

    return parseInt(result.rows[0].total, 10)
  }
}

// Exportar instância singleton do repository
export const jobsRepository = new JobsRepository()
