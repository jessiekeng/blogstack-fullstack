const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')
const middleware = require('../utils/middleware')

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

  if (!password || password.length < 3) {
    return response.status(400).json({ 
      error: 'password must be at least 3 characters long' 
    })
  }

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

// DELETE a user (Cleanup - Admin Only)
usersRouter.delete('/:id', middleware.userExtractor, middleware.adminCheck, async (request, response) => {
  const userToDelete = await User.findById(request.params.id)
  
  if (!userToDelete) {
    return response.status(404).json({ error: 'user not found' })
  }

  // Prevent admin from deleting their own current account
  if (userToDelete._id.toString() === request.user._id.toString()) {
    return response.status(400).json({ error: 'cannot delete your own active admin account' })
  }

  await User.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter