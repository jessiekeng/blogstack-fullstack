const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware') // Added import

/**
 * @openapi
 * /api/blogs:
 * get:
 * summary: Retrieve all blogs
 */
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

/**
 * @openapi
 * /api/blogs:
 * post:
 * summary: Create a new blog
 */
// UPDATED: Added userExtractor here
blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = request.user 

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!title || !url) {
    return response.status(400).end()
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    user: user._id 
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

/**
 * @openapi
 * /api/blogs/{id}:
 * delete:
 * summary: Delete a blog
 */
// UPDATED: Added userExtractor here
blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user 
  if (!user) return response.status(401).json({ error: 'token missing or invalid' })

  const blog = await Blog.findById(request.params.id)
  if (!blog) return response.status(404).json({ error: 'blog not found' })

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'unauthorized' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

/**
 * @openapi
 * /api/blogs/{id}:
 * put:
 * summary: Update a blog
 */
// PUBLIC: No userExtractor, allowing public likes
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const blog = { title, author, url, likes }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  updatedBlog ? response.json(updatedBlog) : response.status(404).end()
})

module.exports = blogsRouter