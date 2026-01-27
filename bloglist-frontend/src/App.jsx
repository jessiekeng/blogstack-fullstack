import { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
    }
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    const response = await axios.get('/api/blogs')
    setBlogs(response.data)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const response = await axios.post('/api/login', { username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(response.data))
      setUser(response.data)
      setUsername('')
      setPassword('')
    } catch (e) { alert('Wrong credentials') }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const handleCreateBlog = async (event) => {
    event.preventDefault()
    const config = { headers: { Authorization: `Bearer ${user.token}` } }
    try {
      const response = await axios.post('/api/blogs', newBlog, config)
      setBlogs(blogs.concat(response.data))
      setNewBlog({ title: '', author: '', url: '' })
    } catch (e) { alert('Failed to create blog') }
  }

  // --- LIKE FUNCTION: PUBLIC/ANY USER - No authentication required ---
  const handleLike = async (blog) => {
    const updatedBlog = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1
    }

    try {
      const response = await axios.put(`/api/blogs/${blog.id}`, updatedBlog)
      
      setBlogs(blogs.map(b => 
        b.id === blog.id 
          ? { ...response.data, user: blog.user } 
          : b
      ))
    } catch (e) { 
      alert('Failed to update likes') 
    }
  }

  const handleDelete = async (blog) => {
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } }
      try {
        await axios.delete(`/api/blogs/${blog.id}`, config)
        setBlogs(blogs.filter(b => b.id !== blog.id))
      } catch (e) { alert('Unauthorized deletion') }
    }
  }

  if (user === null) {
    return (
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <div>
          Username: 
          <input 
            value={username} 
            placeholder="Username"
            onChange={({target}) => setUsername(target.value)} 
          />
        </div>
        <div>
          Password: 
          <input 
            type="password" 
            value={password} 
            placeholder="Password"
            onChange={({target}) => setPassword(target.value)} 
          />
        </div>
        <button type="submit">login</button>
      </form>
    )
  }

  return (
    <div>
      <h2>Blogs</h2>
      <p>{user.name} logged in <button onClick={handleLogout}>logout</button></p>
      
      <form onSubmit={handleCreateBlog}>
        <h3>Create New</h3>
        <input value={newBlog.title} placeholder="title" onChange={({target}) => setNewBlog({...newBlog, title: target.value})} />
        <input value={newBlog.author} placeholder="author" onChange={({target}) => setNewBlog({...newBlog, author: target.value})} />
        <input value={newBlog.url} placeholder="url" onChange={({target}) => setNewBlog({...newBlog, url: target.value})} />
        <button type="submit">create</button>
      </form>

      {blogs.map(blog => (
        <div key={blog.id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
          <strong>{blog.title}</strong> {blog.author} <br />
          Likes: {blog.likes} <button onClick={() => handleLike(blog)}>like</button> <br />
          {blog.url} <br />
          {blog.user && (blog.user.username === user.username || blog.user === user.id) && (
            <button onClick={() => handleDelete(blog)} style={{ backgroundColor: 'red', color: 'white' }}>remove</button>
          )}
        </div>
      ))}
    </div>
  )
}

export default App