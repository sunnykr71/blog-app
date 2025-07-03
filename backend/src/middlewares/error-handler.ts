import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

export const errorHandler = (
  error: ApiError | Prisma.PrismaClientKnownRequestError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error)

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          success: false,
          message: 'A record with this value already exists',
          error: 'UNIQUE_VIOLATION'
        })

      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          message: 'Record not found',
          error: 'NOT_FOUND'
        })

      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          message: 'Related record not found',
          error: 'FOREIGN_KEY_VIOLATION'
        })

      case 'P2014': // Invalid ID
        return res.status(400).json({
          success: false,
          message: 'Invalid ID provided',
          error: 'INVALID_ID'
        })

      default:
        return res.status(500).json({
          success: false,
          message: 'Database error occurred',
          error: 'DATABASE_ERROR'
        })
    }
  }

  // Handle validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error occurred',
      error: 'VALIDATION_ERROR'
    })
  }

  // Handle custom API errors
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.code || 'API_ERROR'
    })
  }

  // Handle generic errors
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    error: 'INTERNAL_SERVER_ERROR'
  })
}

export const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'NOT_FOUND'
  })
}
