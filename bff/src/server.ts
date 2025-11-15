import express from 'express'
import cors from 'cors'
import convertRoutes from './routes/convert'
import path from 'path'

const app = express()

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/api', convertRoutes)

app.use('/files', express.static(path.join(__dirname, '..', '..', 'storage')))

const PORT = process.env.PORT || 4000
  app.listen(PORT, () => console.log(`BFF listening on ${PORT}`))