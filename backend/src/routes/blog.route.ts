import { Router } from 'express'
import blogController from '../controllers/blog.controller'

const blogRouter = Router()

blogRouter.post('/', blogController.createBlog)
blogRouter.get('/', blogController.getBlogs)
blogRouter.get('/:id', blogController.getBlogById.bind(blogController))
blogRouter.put('/:id', blogController.updateBlog.bind(blogController))
blogRouter.delete('/:id', blogController.deleteBlog.bind(blogController))

export default blogRouter
