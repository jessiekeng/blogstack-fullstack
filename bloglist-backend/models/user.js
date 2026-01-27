const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    minlength: 3 // Added validation for exercise 4.16
  },
  name: String,
  passwordHash: String, 
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // Important: never reveal the password hash in the API response
    delete returnedObject.passwordHash
  }
})

module.exports = mongoose.model('User', userSchema)