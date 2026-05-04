import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Disable fast refresh warnings
      fastRefresh: false
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

plugins: [react()],
  server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
        changeOrigin: true,
          secure: false,
      }
  }
}
})