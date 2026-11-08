import { defineConfig } from 'vite'

// base './' makes the build work at any path, e.g. https://<user>.github.io/<repo>/
export default defineConfig({
  base: './',
  build: { target: 'es2022' }
})
