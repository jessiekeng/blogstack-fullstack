const mongoose = require('mongoose')
const Blog = require('../models/blog')
require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)
mongoose.connect(url)

const cleanup = async () => {
    const idsToDelete = [
        '69704b5358da550a67d93d91', // React patterns
        '69704b5358da550a67d93d93'  // Go To Statement...
    ]

    console.log('Deleting blogs:', idsToDelete)
    const result = await Blog.deleteMany({ _id: { $in: idsToDelete } })
    console.log(`Deleted ${result.deletedCount} blogs`)

    mongoose.connection.close()
}

cleanup()
