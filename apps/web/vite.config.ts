import { defineConfig, loadEnv, searchForWorkspaceRoot } from 'vite';

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; media-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; connect-src 'self' ws://127.0.0.1:5173",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    base: env.VITE_BASE_PATH || '/',
    build: {
      outDir: '../../dist',
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'learning-content',
                test: /content[\\/](?:concepts|challenges)[\\/]seed\.json$/,
              },
              {
                name: 'ui-vendor',
                test: /node_modules[\\/](?:react|react-dom|scheduler|lucide-react)[\\/]/,
              },
              {
                name: 'validation-vendor',
                test: /node_modules[\\/]zod[\\/]/,
              },
            ],
          },
        },
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      headers: securityHeaders,
      fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
      headers: securityHeaders,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test-setup.ts',
      css: true,
    },
  };
});
