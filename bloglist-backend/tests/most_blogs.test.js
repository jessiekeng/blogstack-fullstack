const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('most blogs', () => {
  const blogs = [
    { author: "Michael Chan", likes: 1 },
    { author: "Edsger W. Dijkstra", likes: 1 },
    { author: "Edsger W. Dijkstra", likes: 1 },
    { author: "Robert C. Martin", likes: 1 },
    { author: "Robert C. Martin", likes: 1 },
    { author: "Robert C. Martin", likes: 1 }
  ]

  test('returns the author with most blogs and the count', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {
      author: "Robert C. Martin",
      blogs: 3
    })
  })
})