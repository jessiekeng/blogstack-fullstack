const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)

const inspect = async () => {
    console.log('--- BLOGS ---')
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    blogs.forEach(b => {
        console.log(`ID: ${b._id} | Title: ${b.title} | Author: ${b.author} | User: ${b.user ? b.user.username : 'NONE'}`)
    })

    console.log('\n--- USERS ---')
    const users = await User.find({})
    users.forEach(u => {
        console.log(`ID: ${u._id} | Username: ${u.username} | Name: ${u.name}`)
    })

    mongoose.connection.close()
}

inspect()
