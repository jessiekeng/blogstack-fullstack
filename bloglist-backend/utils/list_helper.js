const dummy = (blogs) => 1

const totalLikes = (blogs) => 
  blogs.length === 0 ? 0 : blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null
  const favorite = blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)
  return { title: favorite.title, author: favorite.author, likes: favorite.likes }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  const authorCounts = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
    return counts
  }, {})
  const topAuthor = Object.keys(authorCounts).reduce((a, b) => authorCounts[a] > authorCounts[b] ? a : b)
  return { author: topAuthor, blogs: authorCounts[topAuthor] }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  const likesCount = blogs.reduce((counts, blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + blog.likes
    return counts
  }, {})
  const topAuthor = Object.keys(likesCount).reduce((a, b) => likesCount[a] > likesCount[b] ? a : b)
  return { author: topAuthor, likes: likesCount[topAuthor] }
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }