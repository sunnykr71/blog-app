import { Request, Response, NextFunction } from 'express'
import blogService, { BlogFilters, CreateBlogData, UpdateBlogData } from '../services/blog.service'
import HttpError from '../utils/http-error'

async function createBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const blogData: CreateBlogData = req.body

    if (!blogData.title) {
      throw new HttpError(400, 'Title is required')
    }

    const blog = await blogService.createBlog(blogData)

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    })
  } catch (error) {
    next(error)
  }
}

// Get all blogs with filters
async function getBlogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { tags, search, limit, offset, page, sortBy, sortOrder } = req.query

    const filters: BlogFilters = {}

    // Parse tags
    if (tags) {
      filters.tags = Array.isArray(tags) ? (tags as string[]) : [tags as string]
    }

    // Parse search
    if (search) {
      filters.search = search as string
    }

    // Parse pagination
    if (limit) {
      filters.limit = parseInt(limit as string)
    }

    if (page) {
      const pageNum = parseInt(page as string)
      const limitNum = filters.limit || 10
      filters.offset = (pageNum - 1) * limitNum
    } else if (offset) {
      filters.offset = parseInt(offset as string)
    }

    // Parse sorting
    if (sortBy && ['createdAt', 'updatedAt', 'viewCount', 'title'].includes(sortBy as string)) {
      filters.sortBy = sortBy as 'createdAt' | 'updatedAt' | 'viewCount' | 'title'
    }

    if (sortOrder && ['asc', 'desc'].includes(sortOrder as string)) {
      filters.sortOrder = sortOrder as 'asc' | 'desc'
    }

    const result = await blogService.getBlogs(filters)

    res.status(200).json({
      success: true,
      message: 'Blogs retrieved successfully',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Get blog by ID
async function getBlogById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    const blog = await blogService.getBlogById(id)

    if (!blog) {
      throw new HttpError(404, 'Blog not found')
    }

    res.status(200).json({
      success: true,
      message: 'Blog retrieved successfully',
      data: blog
    })
  } catch (error) {
    next(error)
  }
}

// Update blog
async function updateBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params
    const updateData: UpdateBlogData = req.body

    const blog = await blogService.updateBlog(id, updateData)

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    })
  } catch (error) {
    next(error)
  }
}

// Delete blog
async function deleteBlog(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params

    await blogService.deleteBlog(id)

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

export default {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
}
