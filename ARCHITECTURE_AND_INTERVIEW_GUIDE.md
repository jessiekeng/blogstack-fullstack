# BlogList Application: Architecture & Interview Guide

## Project Overview
BlogList is a full-stack web application that allows users to create, view, and manage blog posts. It consists of a Node.js/Express backend API and a React frontend with user authentication and authorization.

---

## BACKEND ARCHITECTURE

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Testing**: Node built-in test runner
- **Documentation**: Swagger/OpenAPI

### Backend File Structure & Purposes

#### **Root Level Files**

| File | Purpose |
|------|---------|
| `index.js` | Server entry point. Starts Express server on configured PORT |
| `app.js` | Express application configuration. Sets up middlewares, routes, DB connection, CORS, static file serving |
| `package.json` | Project dependencies and NPM scripts |

#### **Controllers** (`/controllers`)
Handle HTTP request logic and route handlers.

| File | Purpose |
|------|---------|
| `blogs.js` | Blog CRUD operations. GET all blogs (public), POST new blog (authenticated), PUT to update likes/details (authenticated), DELETE blog (owner only) |
| `users.js` | User management. GET all users, POST create new user with password hashing, DELETE user (admin only) |
| `login.js` | Authentication. POST endpoint to verify credentials and return JWT token with user info |

#### **Models** (`/models`)
Mongoose schemas that define database structure and validation.

| File | Purpose |
|------|---------|
| `blog.js` | Blog schema with fields: title, author, url, likes, user (reference). Custom JSON transformation to return `id` instead of `_id` |
| `user.js` | User schema with fields: username (unique), name, passwordHash, role (user/admin), blogs array. Returns clean JSON without passwordHash |

#### **Utils** (`/utils`)
Helper functions and configuration.

| File | Purpose |
|------|---------|
| `config.js` | Environment configuration. Reads PORT, MONGODB_URI, SECRET from .env based on NODE_ENV |
| `logger.js` | Logging utility. Logs info/errors with timestamps to console |
| `middleware.js` | Custom Express middlewares: requestLogger (logs all requests), unknownEndpoint (404 handler), errorHandler (centralized error handling), tokenExtractor (extracts JWT from headers), userExtractor (verifies JWT and attaches user to request), adminCheck (verifies user is admin role) |
| `swagger.js` | Swagger/OpenAPI configuration for API documentation served at `/api-docs` |

#### **Tests** (`/tests`)
Jest/Node test files for API endpoints.

| File | Purpose |
|------|---------|
| `blog_api.test.js` | Tests blog endpoints (GET, POST, PUT, DELETE) with various scenarios |
| `user_api.test.js` | Tests user endpoints and validation |
| `favorite_blog.test.js` | Helper function test to find blog with most likes |
| `most_blogs.test.js` | Helper function test to find author with most blogs |
| `most_likes.test.js` | Helper function test to find author with most total likes |
| `total_likes.test.js` | Helper function test to sum all blog likes |
| `dummy.test.js` | Simple test file example |
| `test_helper.js` | Utility functions for tests: DB setup/teardown, test data |

### Key Backend Concepts

**Authentication Flow:**
1. User POSTs credentials to `/api/login`
2. Server validates against hashed password in DB
3. Server generates JWT with user id and username
4. Client stores JWT in localStorage
5. Client sends JWT in `Authorization: Bearer <token>` header on protected requests
6. Server extracts and verifies token, attaches user to request object

**Authorization:**
- Public endpoints: GET `/api/blogs` (anyone)
- Authenticated: POST `/api/blogs`, PUT blogs, DELETE blogs (token required)
- Admin-only: DELETE users

**Error Handling:**
- Centralized error handler middleware catches all errors
- Specific handling for: validation errors, MongoDB errors, JWT errors, CastErrors
- Returns appropriate HTTP status codes and error messages

---

## FRONTEND ARCHITECTURE

### Technology Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: CSS
- **Storage**: Browser localStorage for JWT persistence

### Frontend File Structure & Purposes

#### **Root Level Files**

| File | Purpose |
|------|---------|
| `main.jsx` | React entry point. Renders App component into root DOM element |
| `App.jsx` | Main application component. Manages state for blogs, users, authentication. Contains all major UI sections |
| `index.html` | HTML template. Single page with root div for React mounting |
| `index.css` | Global styles |
| `App.css` | Component-specific styles |
| `vite.config.js` | Vite build configuration. Sets up React plugin, dev server proxy |
| `eslint.config.js` | ESLint configuration for code quality |
| `package.json` | Dependencies (React, Axios, Vite) and build scripts |

#### **Key Features in App.jsx**

| Feature | Implementation |
|---------|-----------------|
| **Blog Fetching** | `useEffect` hook calls `/api/blogs` on mount, stores in state |
| **User Login** | Form submission POSTs credentials to `/api/login`, stores token in localStorage |
| **Token Persistence** | On mount, checks localStorage for saved token, restores user session |
| **Blog Creation** | Authenticated POST to `/api/blogs` with Bearer token, adds new blog to state |
| **Blog Like/Unlike** | PUT request to update blog likes on server, updates local state |
| **Blog Deletion** | DELETE request for blog (owner only), removes from state |
| **Logout** | Removes token from localStorage, clears user state |

### Frontend Component Structure

The application is currently a **monolithic App.jsx** containing:
- State management (blogs, user, login credentials, new blog form)
- Login form UI
- Blog creation form UI (conditional - only shown if logged in)
- Blog list display with like/delete buttons (if owner)

### Frontend Key Concepts

**Local State Management:**
```javascript
- blogs: Array of blog objects
- user: Current logged-in user (null if not authenticated)
- username, password: Form inputs for login
- newBlog: Form inputs for creating new blog
```

**HTTP Interceptors:**
- Axios used directly with Bearer token passed in headers for authenticated requests
- No global interceptor; token manually added to each request config

**Authentication:**
- Token stored in `window.localStorage.loggedBlogappUser`
- Token sent in `Authorization: Bearer <token>` header
- Frontend trusts token validity (server validates on each request)

---

## COMMON INTERVIEW QUESTIONS & ANSWERS

### Backend Architecture Questions

**Q1: How does the authentication system work?**
- JWT-based authentication. User sends credentials to `/api/login`, which verifies password using bcrypt against stored hash
- Server creates JWT token containing user id and username
- Token sent to client in response
- Client stores in localStorage and includes in `Authorization: Bearer <token>` header on protected requests
- Server extracts token via `tokenExtractor` middleware, verifies signature, and attaches user to request

**Q2: How is password security handled?**
- Passwords are never stored in database
- Only passwordHash is stored (bcrypt hash with salt rounds = 10)
- When user registers, password is hashed using bcrypt.hash() before DB insertion
- When user logs in, submitted password is compared to hash using bcrypt.compare()
- bcrypt uses salts to prevent rainbow table attacks
- passwordHash is never returned to client in API responses

**Q3: What's the purpose of each middleware?**
- `requestLogger`: Logs HTTP method, path, body for debugging
- `tokenExtractor`: Globally parses JWT from Authorization header into request.token
- `userExtractor`: Verifies JWT is valid, decodes it, fetches user from DB, attaches to request.user
- `adminCheck`: Verifies request.user exists and has role === 'admin'
- `unknownEndpoint`: Returns 404 for undefined routes
- `errorHandler`: Catches all errors, determines type, returns appropriate status and message

**Q4: How does the Blog-User relationship work?**
- One user has many blogs; one blog belongs to one user
- Blog model has `user` field (ObjectId reference to User)
- User model has `blogs` array (ObjectIds of all their blogs)
- When blog is created, the blog's user field is set to creator's id
- User's blogs array is updated to include new blog id
- `.populate('user')` in GET /blogs fetches full user details instead of just ObjectId
- `.populate('blogs')` in GET /users fetches full blog details

**Q5: How does error handling work across the application?**
- All async errors in routes are caught by Express (async-await compatibility)
- Errors bubble up to centralized `errorHandler` middleware
- Handler checks error.name and returns appropriate status/message:
  - ValidationError → 400 (bad request)
  - CastError → 400 (malformed id)
  - E11000 duplicate key → 400 (unique constraint violation)
  - JsonWebTokenError → 401 (invalid token)
  - TokenExpiredError → 401 (expired token)

**Q6: Why separate tokenExtractor and userExtractor middlewares?**
- `tokenExtractor` runs on all requests; extracts token if present but doesn't verify
- `userExtractor` only runs on protected routes; validates token and fetches user
- This separation allows public endpoints to exist without JWT processing
- GET /api/blogs is public (uses tokenExtractor only)
- POST /api/blogs is protected (uses both tokenExtractor and userExtractor)

**Q7: How would you handle role-based authorization?**
- User model has `role` field with enum ['user', 'admin']
- `adminCheck` middleware verifies `request.user.role === 'admin'`
- Routes can use: `router.delete('/:id', middleware.userExtractor, middleware.adminCheck, handler)`
- Example: Only admins can delete users

**Q8: What is MongoDB population and why is it needed?**
- MongoDB stores references (ObjectIds) not embedded documents
- `.populate('fieldName')` tells Mongoose to replace ObjectId with actual document from referenced collection
- Example: Blog has user: ObjectId("..."), .populate('user') replaces with full user object {username: "john", name: "John", ...}
- Reduces network calls (one query) vs multiple queries
- Only works with defined ref schemas

**Q9: Why use Mongoose instead of raw MongoDB driver?**
- Schema validation: Defines structure, types, requirements upfront
- Middleware hooks: Run code before/after save (e.g., password hashing)
- Population: Easier foreign key relationships
- Query helpers: Cleaner syntax than raw MongoDB commands
- Timestamps: Automatic createdAt/updatedAt
- Virtuals: Computed fields (e.g., id computed from _id)

### Frontend Architecture Questions

**Q10: How does the frontend handle authentication state?**
- Token stored in localStorage
- On app mount, useEffect checks localStorage for saved token
- If found, user object is restored to state
- User object contains: token, username, name, role
- Token included in Authorization header for all protected requests
- No middleware library; axios used directly with config object

**Q11: What happens when a user logs out?**
- removeItem('loggedBlogappUser') deletes token from localStorage
- setUser(null) clears user from state
- User returns to login form
- All previous API calls will fail (401) because no token in header

**Q12: How does the app ensure blogs are associated with correct user?**
- Backend handles association: blog.user = request.user._id
- Frontend only sends title, author, url
- Server automatically attaches user id from JWT
- This prevents users from creating blogs as another user
- Only owner can delete (checked server-side)

**Q13: Why use localStorage instead of session/cookies?**
- localStorage persists across browser sessions
- Simple API (getItem, setItem, removeItem)
- Works well with SPA (single page app)
- Downside: vulnerable to XSS; ideally use httpOnly cookies for production

**Q14: How would you improve the current frontend architecture?**
- Break App.jsx into smaller components (LoginForm, BlogList, BlogForm, BlogItem)
- Create custom hooks (useFetch, useLocalStorage, useAuth)
- Centralize API calls in a service file (blogService.js)
- Add error boundaries for better error handling
- Use Context API or state management library for auth state
- Add loading states and conditional rendering
- Implement form validation on client-side

**Q15: What is the data flow for creating a blog?**
1. User fills form (title, author, url) → newBlog state
2. Form submit calls handleCreateBlog
3. POST request sent to /api/blogs with Authorization header containing token
4. Server validates token, extracts user id, validates blog data
5. Server creates blog with user id reference, saves to DB
6. Server returns saved blog (with id from _id transformation)
7. Frontend receives response, adds blog to blogs state
8. Blog list re-renders with new blog
9. Form inputs cleared

**Q16: How would you add a loading state?**
- Add `loading` state: `const [loading, setLoading] = useState(false)`
- Set to true before API call, false after (in finally block)
- Conditionally render spinner/disable button while loading
- Show "Loading..." message instead of blank screen

**Q17: What's the difference between useState and useEffect hooks?**
- `useState`: Manages component state. Returns [value, setter]. Re-renders on update
- `useEffect`: Side effects (data fetching, subscriptions). Runs after render. Dependencies array controls when it runs
- Empty deps [] = run once on mount
- No deps = run after every render
- [variable] = run when variable changes

---

## API Endpoints Summary

### Public Endpoints
```
GET /api/blogs                    - Fetch all blogs
POST /api/login                   - User login
POST /api/users                   - User registration
GET /api/users                    - Fetch all users
GET /api-docs                     - Swagger documentation
```

### Authenticated Endpoints (token required)
```
POST /api/blogs                   - Create blog
PUT /api/blogs/:id                - Update blog (like/unlike)
DELETE /api/blogs/:id             - Delete blog (owner only)
```

### Admin Endpoints (admin role required)
```
DELETE /api/users/:id             - Delete user
```

---

## Testing Strategy

The project includes test files covering:
- **Integration tests**: Full API endpoint testing with real database
- **Unit tests**: Helper functions (list_helper.js)
- **Test patterns**: Setup/teardown, fixtures, mocking (supertest for HTTP)

### Key Testing Concepts
- Test database separate from production
- Helper functions for DB reset between tests
- Supertest for HTTP assertions
- Mock data in test_helper.js

---

## Environment Configuration

The app uses `.env` file with:
```
PORT=3003
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog?...
SECRET=secret-key-for-jwt-signing
NODE_ENV=development|test|production
```

Different configurations loaded based on NODE_ENV.

---

## Deployment Considerations

**Frontend:**
- `npm run build` creates optimized dist folder
- Static files served from `public/` directory
- Can be deployed to: Vercel, Netlify, GitHub Pages

**Backend:**
- Serves frontend static files from `dist/` folder
- Single server handles both API and frontend
- Can be deployed to: Heroku, Railway, Fly.io, AWS

**Database:**
- MongoDB Atlas (cloud hosted)
- Connection string in environment variables
- Automatic backups and scalability

---

## Security Best Practices Implemented

✅ Passwords hashed with bcrypt  
✅ JWT tokens for stateless auth  
✅ Token extracted from headers (not cookies - vulnerable to CSRF but demonstrates flexibility)  
✅ Unique username constraint in DB  
✅ Password validation (minimum length)  
✅ Authorization checks on protected routes  
✅ Error messages don't leak sensitive info  
✅ CORS enabled (configurable)  
✅ Request logging for audits  

**Could be improved:**
- Use httpOnly cookies instead of localStorage
- Add rate limiting on login endpoint
- Implement refresh tokens
- Add CSRF protection
- Input sanitization/validation
- HTTPS in production only

