import { Job, CreateJobDto, UpdateJobDto } from './jobsRepository'

class InMemoryJobsRepository {
  private jobs = new Map<string, Job>()

  async create(data: CreateJobDto): Promise<Job> {
    const now = new Date()
    const job: Job = {
      id: data.id,
      original_name: data.original_name,
      file_path: data.file_path,
      target_format: data.target_format,
      status: 'pending',
      download_path: undefined,
      download_name: undefined,
      error_message: undefined,
      created_at: now,
      updated_at: now,
    }

    this.jobs.set(job.id, job)
    return job
  }

  async findById(id: string): Promise<Job | null> {
    return this.jobs.get(id) || null
  }

  async findAll(limit = 100, offset = 0): Promise<Job[]> {
    const allJobs = Array.from(this.jobs.values())
    return allJobs
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(offset, offset + limit)
  }

  async update(id: string, data: UpdateJobDto): Promise<Job | null> {
    const job = this.jobs.get(id)
    if (!job) return null

    const updatedJob: Job = {
      ...job,
      ...data,
      updated_at: new Date(),
    }

    this.jobs.set(id, updatedJob)
    return updatedJob
  }

  async delete(id: string): Promise<boolean> {
    return this.jobs.delete(id)
  }

  async count(): Promise<number> {
    return this.jobs.size
  }


}

export const inMemoryJobsRepository = new InMemoryJobsRepository()
