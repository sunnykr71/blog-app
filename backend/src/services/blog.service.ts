import { PrismaClient, ContentType } from '@prisma/client'

const prisma = new PrismaClient()

export interface CreateBlogData {
  title: string
  coverImage?: string
  metaTitle?: string
  metaDescription?: string
  readTime?: number
  content?: CreateContentData[]
  tags?: string[]
}

export interface CreateContentData {
  type: ContentType
  order: number
  title?: string
  description?: string
  images?: CreateContentImageData[]
  videos?: CreateContentVideoData[]
}

export interface CreateContentImageData {
  url: string
  altText?: string
  caption?: string
  order?: number
}

export interface CreateContentVideoData {
  url: string
  thumbnailUrl?: string
  title?: string
  duration?: number
  order?: number
}

export interface UpdateBlogData {
  title?: string
  coverImage?: string
  metaTitle?: string
  metaDescription?: string
  readTime?: number
}

export interface BlogFilters {
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'viewCount' | 'title'
  sortOrder?: 'asc' | 'desc'
}

async function createBlog(data: CreateBlogData) {
  const { content, tags, ...blogData } = data

  return await prisma.$transaction(async tx => {
    // Create the blog
    const blog = await tx.blog.create({
      data: blogData
    })

    // Create content if provided
    if (content && content.length > 0) {
      for (const contentItem of content) {
        const { images, videos, ...contentData } = contentItem

        const createdContent = await tx.content.create({
          data: {
            ...contentData,
            blogId: blog.id
          }
        })

        // Create images if provided
        if (images && images.length > 0) {
          await tx.contentImage.createMany({
            data: images.map(img => ({
              ...img,
              contentId: createdContent.id
            }))
          })
        }

        // Create videos if provided
        if (videos && videos.length > 0) {
          await tx.contentVideo.createMany({
            data: videos.map(vid => ({
              ...vid,
              contentId: createdContent.id
            }))
          })
        }
      }
    }

    // Create tags if provided
    if (tags && tags.length > 0) {
      // First, upsert all tags
      for (const tagName of tags) {
        await tx.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName }
        })
      }

      // Then create blog-tag relationships
      await tx.blogTag.createMany({
        data: tags.map(tagName => ({
          blogId: blog.id,
          tagName
        }))
      })
    }

    return tx.blog.findUnique({
      where: { id: blog.id },
      include: {
        content: {
          include: {
            images: true,
            videos: true
          }
        },
        tags: {
          select: { tagName: true }
        }
      }
    })
  })
}

// Get all blogs with filters
async function getBlogs(filters?: BlogFilters) {
  const {
    tags,
    search,
    limit = 10,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = filters || {}

  const where: any = {}

  // Filter by tags
  if (tags && tags.length > 0) {
    where.tags = {
      some: {
        tagName: {
          in: tags
        }
      }
    }
  }

  // Search in title and meta fields
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { metaTitle: { contains: search, mode: 'insensitive' } },
      { metaDescription: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        content: {
          orderBy: { order: 'asc' },
          include: {
            images: {
              orderBy: { order: 'asc' }
            },
            videos: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset
    }),
    prisma.blog.count({ where })
  ])

  return {
    blogs,
    total,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit)
  }
}

// Get blog by ID
async function getBlogById(id: string) {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      content: {
        orderBy: { order: 'asc' },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          videos: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!blog) {
    throw new Error('Blog not found')
  }

  return blog
}

// Update blog
async function updateBlog(id: string, data: UpdateBlogData) {
  const blog = await prisma.blog.update({
    where: { id },
    data,
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      content: {
        orderBy: { order: 'asc' },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          videos: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  return blog
}

// Delete blog
async function deleteBlog(id: string) {
  await prisma.blog.delete({
    where: { id }
  })
}

// Increment view count
async function incrementViewCount(id: string) {
  const blog = await prisma.blog.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1
      }
    }
  })

  return blog
}

// Add tags to blog
async function addTagsToBlog(blogId: string, tagNames: string[]) {
  return await prisma.$transaction(async tx => {
    // First, upsert all tags
    for (const tagName of tagNames) {
      await tx.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName }
      })
    }

    // Then create blog-tag relationships (skip if already exists)
    const existingTags = await tx.blogTag.findMany({
      where: {
        blogId,
        tagName: { in: tagNames }
      }
    })

    const existingTagNames = existingTags.map(bt => bt.tagName)
    const newTagNames = tagNames.filter(name => !existingTagNames.includes(name))

    if (newTagNames.length > 0) {
      await tx.blogTag.createMany({
        data: newTagNames.map(tagName => ({
          blogId,
          tagName
        }))
      })
    }

    return await tx.blog.findUnique({
      where: { id: blogId },
      include: {
        tags: {
          include: {
            tag: true
          }
        }
      }
    })
  })
}

// Remove tags from blog
async function removeTagsFromBlog(blogId: string, tagNames: string[]) {
  await prisma.blogTag.deleteMany({
    where: {
      blogId,
      tagName: { in: tagNames }
    }
  })

  return await prisma.blog.findUnique({
    where: { id: blogId },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  })
}

// Get all tags
async function getAllTags() {
  return await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          blogs: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })
}

// Add content to blog
async function addContentToBlog(blogId: string, contentData: CreateContentData) {
  const { images, videos, ...data } = contentData

  return await prisma.$transaction(async tx => {
    const content = await tx.content.create({
      data: {
        ...data,
        blogId
      }
    })

    // Create images if provided
    if (images && images.length > 0) {
      await tx.contentImage.createMany({
        data: images.map(img => ({
          ...img,
          contentId: content.id
        }))
      })
    }

    // Create videos if provided
    if (videos && videos.length > 0) {
      await tx.contentVideo.createMany({
        data: videos.map(vid => ({
          ...vid,
          contentId: content.id
        }))
      })
    }

    return await tx.content.findUnique({
      where: { id: content.id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        videos: {
          orderBy: { order: 'asc' }
        }
      }
    })
  })
}

// Update content
async function updateContent(contentId: string, data: Partial<CreateContentData>) {
  const { images, videos, ...contentData } = data

  return await prisma.content.update({
    where: { id: contentId },
    data: contentData,
    include: {
      images: {
        orderBy: { order: 'asc' }
      },
      videos: {
        orderBy: { order: 'asc' }
      }
    }
  })
}

// Delete content
async function deleteContent(contentId: string) {
  await prisma.content.delete({
    where: { id: contentId }
  })
}

export default {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  incrementViewCount,
  addTagsToBlog,
  removeTagsFromBlog,
  getAllTags,
  addContentToBlog,
  updateContent,
  deleteContent
}
