const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('favorite blog', () => {
  const blogs = [
    {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    },
    {
      title: "First class algorithms",
      author: "Robert Martin",
      likes: 10
    },
    {
      title: "TDD harms architecture",
      author: "Robert Martin",
      likes: 0
    }
  ]

  test('finds the blog with the most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    
    // We use deepStrictEqual to compare the properties of the objects
    assert.deepStrictEqual(result, {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12
    })
  })
})