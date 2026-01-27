const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

describe('most likes', () => {
  const blogs = [
    { author: "Michael Chan", likes: 10 },
    { author: "Edsger W. Dijkstra", likes: 5 },
    { author: "Edsger W. Dijkstra", likes: 12 }, // Dijkstra Total: 17
    { author: "Robert C. Martin", likes: 2 }
  ]

  test('returns the author with most total likes', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {
      author: "Edsger W. Dijkstra",
      likes: 17
    })
  })
})