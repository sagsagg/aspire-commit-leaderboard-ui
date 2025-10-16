# Alternative: Using Vite Proxy to Avoid CORS

If the backend cannot be configured to allow CORS, you can use Vite's built-in proxy feature during development.

## Why Use a Proxy?

- Avoids CORS issues entirely during development
- Backend doesn't need CORS configuration
- Requests appear to come from same origin
- **Note:** Only works in development, not in production

## Implementation

### 1. Update `vite.config.ts`

Add proxy configuration to your Vite config:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // Proxy all requests starting with /api to your backend
      '/api': {
        target: 'https://commit-api-five.vercel.app',
        changeOrigin: true, // Changes the origin header to target
        secure: false, // If you're using self-signed SSL certificates
        rewrite: (path) => path, // Optional: rewrite the path
      },
    },
  },
});
```

### 2. Update Apollo Client Configuration

Change the URI to use the relative path:

```typescript
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const httpLink = new HttpLink({
  // Use relative path - Vite will proxy this to the backend
  uri: '/api/leaderboard',
  // No need for CORS configuration when using proxy
});

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});
```

### 3. Environment Variables

Update your `.env` file:

```env
# Development - uses proxy
VITE_GRAPHQL_ENDPOINT=

# Or set to empty/localhost
VITE_GRAPHQL_ENDPOINT=http://localhost:5173
```

Update `apollo.ts` to handle proxy:

```typescript
const httpLink = new HttpLink({
  uri: import.meta.env.DEV 
    ? '/api/leaderboard' // Development: use proxy
    : `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`, // Production: use full URL
});
```

## Advanced Proxy Configuration

### With Path Rewriting

```typescript
server: {
  proxy: {
    '/graphql': {
      target: 'https://commit-api-five.vercel.app',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/graphql/, '/api/leaderboard'),
    },
  },
}
```

Then use:
```typescript
uri: '/graphql'
```

### Multiple Backend Targets

```typescript
server: {
  proxy: {
    '/api/leaderboard': {
      target: 'https://commit-api-five.vercel.app',
      changeOrigin: true,
    },
    '/api/auth': {
      target: 'https://auth-api.example.com',
      changeOrigin: true,
    },
  },
}
```

### With WebSocket Support

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://commit-api-five.vercel.app',
      changeOrigin: true,
      ws: true, // Enable WebSocket proxying
    },
  },
}
```

## Production Deployment

**Important:** Proxies only work in development. For production, you need to:

1. **Fix CORS on Backend** (recommended)
   ```javascript
   app.use(cors({
     origin: 'https://your-production-domain.com',
     credentials: true,
   }));
   ```

2. **Use a Reverse Proxy** (Nginx, Cloudflare, etc.)
   ```nginx
   location /api {
     proxy_pass https://commit-api-five.vercel.app;
     add_header Access-Control-Allow-Origin *;
   }
   ```

3. **Deploy Backend and Frontend Together**
   - Serve both from same domain
   - No CORS issues

## Complete Example

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://commit-api-five.vercel.app',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          // Log proxy requests for debugging
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> ${options.target}${req.url}`);
          });
        },
      },
    },
  },
});
```

### `src/apollo.ts`
```typescript
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const isDevelopment = import.meta.env.DEV;

const httpLink = new HttpLink({
  uri: isDevelopment
    ? '/api/leaderboard' // Proxied in development
    : `${import.meta.env.VITE_GRAPHQL_ENDPOINT}/api/leaderboard`, // Direct in production
  ...(isDevelopment
    ? {} // No CORS config needed with proxy
    : {
        // CORS config for production
        credentials: 'same-origin',
        fetchOptions: { mode: 'cors' },
        headers: { 'Content-Type': 'application/json' },
      }),
});

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});
```

### `.env.development`
```env
VITE_GRAPHQL_ENDPOINT=
```

### `.env.production`
```env
VITE_GRAPHQL_ENDPOINT=https://commit-api-five.vercel.app
```

## Testing the Proxy

1. **Start dev server:**
   ```bash
   yarn dev
   ```

2. **Check Network tab:**
   - Requests should go to `http://localhost:5173/api/leaderboard`
   - Response should come from backend
   - No CORS errors

3. **Check terminal:**
   - Vite logs proxy requests
   - Look for `[vite] http proxy` messages

## Debugging Proxy Issues

### Enable Verbose Logging

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://commit-api-five.vercel.app',
      changeOrigin: true,
      configure: (proxy) => {
        proxy.on('error', (err, req, res) => {
          console.error('Proxy error:', err);
        });
        proxy.on('proxyReq', (proxyReq, req) => {
          console.log('Proxying request:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req) => {
          console.log('Proxy response:', proxyRes.statusCode, req.url);
        });
      },
    },
  },
}
```

### Common Issues

1. **404 Not Found**
   - Check path rewriting
   - Verify target URL is correct

2. **Timeout**
   - Backend might be slow or down
   - Check target accessibility

3. **SSL/TLS Errors**
   - Set `secure: false` for self-signed certificates

## Pros and Cons

### Pros ✅
- No CORS configuration needed in development
- Simpler frontend code
- Faster development setup
- Works with any backend

### Cons ❌
- Only works in development
- Need separate production configuration
- Can hide CORS issues until deployment
- Adds complexity to build process

## Recommendation

- **Development:** Use proxy if backend can't be configured for CORS
- **Production:** Always fix CORS on backend (recommended) or use reverse proxy
- **Best Practice:** Have same CORS config in dev and prod to catch issues early
