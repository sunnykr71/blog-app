import express, { Application, ErrorRequestHandler } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import blogRoutes from './routes/blog.route'
import s3Router from './routes/s3.route'

import { errorHandler, notFoundHandler } from './middlewares/error-handler'

const app: Application = express()

app.use(express.static('dist'))
app.use(morgan('dev'))
// Security middleware
app.use(helmet())
app.use(cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  }
})

app.use(limiter)

// Body parsing middleware
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  })
})

// API routes
app.use('/api/v1/blogs', blogRoutes)
app.use('/api/v1/s3', s3Router)

// Error handling middleware (must be last)
app.use(notFoundHandler)
app.use(errorHandler as unknown as ErrorRequestHandler)

export default app
