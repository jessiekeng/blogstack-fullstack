const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcryptjs')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

describe('deletion of a blog', () => {
  let token = null
  let user = null

  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    user = new User({ username: 'root', passwordHash })
    await user.save()

    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'root', password: 'secret' })

    token = loginResponse.body.token

    const blogObject = new Blog({
      title: 'First Blog',
      author: 'Author 1',
      url: 'http://url1.com',
      likes: 1,
      user: user._id
    })
    await blogObject.save()
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(r => r.title)
    assert(!titles.includes(blogToDelete.title))
  })

  test('fails with status code 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  test('fails with status code 401 if token is missing', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('fails with status code 401 if user is not the creator', async () => {
    // Create another user
    const passwordHash = await bcrypt.hash('otherpassword', 10)
    const otherUser = new User({ username: 'other', passwordHash })
    await otherUser.save()

    // Login as the other user
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'other', password: 'otherpassword' })

    const otherToken = loginResponse.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    // Try to delete the root user's blog with other user's token
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('succeeds with status code 204 if user is admin', async () => {
    // Create an admin user
    const passwordHash = await bcrypt.hash('adminpassword', 10)
    const adminUser = new User({ username: 'admin', role: 'admin', passwordHash })
    await adminUser.save()

    // Login as the admin
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'admin', password: 'adminpassword' })

    const adminToken = loginResponse.body.token

    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    // Admin should be able to delete any blog
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
