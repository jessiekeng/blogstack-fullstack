const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

// GET all users
usersRouter.get('/', async (request, response) => {
  const users = await User
  .find({})
  .populate('blogs', { title: 1, author: 1, url: 1 })
  response.json(users)
})

// POST a new user
usersRouter.post('/', async (request, response) => {
  const { username, name, password, role } = request.body

  // Password validation (Done in controller)
  if (!password || password.length < 3) {
    return response.status(400).json({ 
      error: 'password must be at least 3 characters long' 
    })
  }

  // Username validation (Basic check, uniqueness is handled by Mongoose)
  if (!username || username.length < 3) {
    return response.status(400).json({ 
      error: 'username must be at least 3 characters long' 
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
    role: role || 'user'
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter