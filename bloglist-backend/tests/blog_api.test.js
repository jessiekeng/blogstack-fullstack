const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs') // <--- MISSING IMPORT FIXED HERE
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {
  let token = null

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    // 1. Create a user document directly to ensure we have the ID
    const passwordHash = await bcrypt.hash('testpassword', 10)
    const user = new User({ 
      username: 'testuser', 
      name: 'Test User',
      passwordHash 
    })
    const savedUser = await user.save()

    // 2. Log in to get a valid token for the tests
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword' })
    
    token = loginResponse.body.token

    // 3. Save initial blogs and link them to our test user
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog({ 
        ...blog, 
        user: savedUser._id 
      })
      await blogObject.save()
    }
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('unique identifier property is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogToIdentify = response.body[0]
    assert.ok(blogToIdentify.id)
    assert.strictEqual(blogToIdentify._id, undefined)
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data and token', async () => {
      const newBlog = {
        title: 'Testing the POST route',
        author: 'Fullstack Open',
        url: 'https://fullstackopen.com/',
        likes: 10
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)
      
      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Testing the POST route'))
    })

    test('fails with 401 Unauthorized if token is not provided', async () => {
      const newBlog = {
        title: 'No Token Blog',
        author: 'Tester',
        url: 'https://test.com/'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })

    test('if likes property is missing, it defaults to 0', async () => {
      const newBlog = {
        title: 'Missing Likes Blog',
        author: 'Tester',
        url: 'https://test.com/'
      }
      
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)

      assert.strictEqual(response.body.likes, 0)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if token is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
      
      const titles = blogsAtEnd.map(r => r.title)
      assert(!titles.includes(blogToDelete.title))
    })
  })

  describe('updating a blog', () => {
    test('succeeds with status code 200 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedInDb = blogsAtEnd.find(b => b.id === blogToUpdate.id)
      assert.strictEqual(updatedInDb.likes, blogToUpdate.likes + 1)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})