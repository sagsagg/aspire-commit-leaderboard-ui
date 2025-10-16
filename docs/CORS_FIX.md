# CORS Configuration Fix for Apollo Client

## Problem

When making GraphQL requests from a frontend application to a backend API on a different domain (cross-origin), browsers enforce CORS (Cross-Origin Resource Sharing) policies. Without proper configuration, requests will fail with a CORS error.

## Solution

Configure Apollo Client's `HttpLink` with proper CORS settings.

## Implementation

### Current Configuration (Fixed)

```typescript
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`,
  // CORS configuration for cross-origin requests
  credentials: 'same-origin', // or 'include' if you need to send cookies
  fetchOptions: {
    mode: 'cors', // Explicitly enable CORS
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});
```

## Configuration Options

### 1. `credentials` Option

Controls whether cookies and authentication headers are sent with cross-origin requests:

- **`'same-origin'`** (default): Send credentials only for same-origin requests
  ```typescript
  credentials: 'same-origin'
  ```

- **`'include'`**: Always send credentials (cookies, HTTP auth) even for cross-origin
  ```typescript
  credentials: 'include'
  ```

- **`'omit'`**: Never send credentials
  ```typescript
  credentials: 'omit'
  ```

**When to use `'include'`:**
- Your API requires authentication cookies
- You're implementing session-based authentication
- Your backend expects credentials

**Backend requirements for `credentials: 'include'`:**
```javascript
// Backend must explicitly allow credentials
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // REQUIRED for credentials: 'include'
};
app.use(cors(corsOptions));
```

### 2. `fetchOptions` Configuration

Additional options passed to the underlying `fetch` API:

```typescript
fetchOptions: {
  mode: 'cors',           // Enable CORS
  cache: 'no-cache',      // Optional: Control caching
  redirect: 'follow',     // Optional: Handle redirects
}
```

**Available `mode` values:**
- `'cors'`: Enable cross-origin requests (default for cross-origin)
- `'no-cors'`: Make requests but can't read response (limited)
- `'same-origin'`: Only allow same-origin requests

### 3. `headers` Configuration

Custom headers for all requests:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}
```

## Advanced: Dynamic Headers with Authentication

If you need to add authentication tokens dynamically:

```typescript
import { ApolloClient, HttpLink, InMemoryCache, ApolloLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`,
  credentials: 'include',
  fetchOptions: {
    mode: 'cors',
  },
});

// Middleware to add auth token to every request
const authLink = new SetContextLink((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

## Backend CORS Configuration

Your backend must be properly configured to accept CORS requests. Example for Node.js/Express:

### Basic CORS Setup

```javascript
const cors = require('cors');

// Allow all origins (development only)
app.use(cors());
```

### Production CORS Setup

```javascript
const cors = require('cors');

const corsOptions = {
  origin: process.env.FRONTEND_URL, // e.g., 'https://myapp.com'
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
```

### Multiple Origins

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://myapp.com',
  'https://www.myapp.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
```

## Troubleshooting

### Error: "Access-Control-Allow-Origin" header

**Problem:** Backend doesn't allow your frontend origin.

**Solution:** 
- Check backend CORS configuration
- Ensure your frontend URL is in the allowed origins list
- Verify the backend is sending proper CORS headers

### Error: "Access-Control-Allow-Credentials" header

**Problem:** Using `credentials: 'include'` but backend doesn't allow credentials.

**Solution:**
```javascript
// Backend must have
credentials: true
```

### Preflight Requests Failing

**Problem:** OPTIONS requests failing before actual queries.

**Solution:**
```javascript
// Backend must handle OPTIONS requests
app.options('*', cors(corsOptions));
```

### Development vs Production

**Development:**
```typescript
credentials: 'same-origin'
fetchOptions: { mode: 'cors' }
```

**Production with authentication:**
```typescript
credentials: 'include'
fetchOptions: { mode: 'cors' }
```

## Testing the Fix

1. **Check browser console** - CORS errors should be gone
2. **Check Network tab** - Request headers should include:
   - `Origin: http://localhost:5173`
   - Response should have `Access-Control-Allow-Origin` header
3. **Verify queries work** - GraphQL queries should execute successfully

## Common CORS Headers (Backend Response)

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## References

- [Apollo Client HttpLink Documentation](https://www.apollographql.com/docs/react/networking/basic-http-networking/)
- [Apollo Client Authentication](https://www.apollographql.com/docs/react/networking/authentication/)
- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
