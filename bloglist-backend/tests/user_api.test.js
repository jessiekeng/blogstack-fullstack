const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const newUser = new User({
      username: 'root',
      passwordHash: 'secretpasswordhash', // In reality, use a real hash if needed
    })

    await newUser.save()
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await User.find({})
    
    const newUser = {
      username: 'tester',
      name: 'Test User',
      password: '12' // Invalid: too short
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.error, 'password must be at least 3 characters long')

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if username is too short', async () => {
    const usersAtStart = await User.find({})
    
    const newUser = {
      username: 'te', // Invalid: too short
      name: 'Test User',
      password: 'validpassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    // This message comes from your controller if check
    assert.strictEqual(result.body.error, 'username must be at least 3 characters long')

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('creation fails if username is not unique', async () => {
    const usersAtStart = await User.find({})
    
    const newUser = {
      username: 'root', // Already exists in beforeEach
      name: 'Superuser',
      password: 'validpassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert.ok(result.body.error.includes('unique'))

    const usersAtEnd = await User.find({})
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})