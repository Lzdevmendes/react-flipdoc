-- FlipDoc Database Schema
-- Tabela para armazenar jobs de conversão de documentos

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela principal de jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  target_format VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'failed')),
  download_path VARCHAR(512),
  download_name VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_id_status ON jobs(id, status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas colunas (documentação)
COMMENT ON TABLE jobs IS 'Tabela de jobs de conversão de documentos';
COMMENT ON COLUMN jobs.id IS 'ID único do job (UUID)';
COMMENT ON COLUMN jobs.original_name IS 'Nome original do arquivo enviado';
COMMENT ON COLUMN jobs.file_path IS 'Caminho do arquivo original no servidor';
COMMENT ON COLUMN jobs.target_format IS 'Formato de destino da conversão (pdf, docx, etc)';
COMMENT ON COLUMN jobs.status IS 'Status do job: pending, processing, done, failed';
COMMENT ON COLUMN jobs.download_path IS 'Caminho do arquivo convertido';
COMMENT ON COLUMN jobs.download_name IS 'Nome do arquivo para download';
COMMENT ON COLUMN jobs.error_message IS 'Mensagem de erro caso o job falhe';
COMMENT ON COLUMN jobs.created_at IS 'Data de criação do job';
COMMENT ON COLUMN jobs.updated_at IS 'Data da última atualização';
