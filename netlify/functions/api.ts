import serverless from 'serverless-http';
// This path is crucial. It tells the function where to find the compiled server code
// after Netlify has run the build step.
import app from '../../backend/dist/server.js';

// When a CommonJS module (like our compiled Express app) is imported into an
// ES module context (which Netlify's functions use), the actual app is often
// on the `default` property. This line handles that case gracefully.
const expressApp = (app as any).default || app;

export const handler = serverless(expressApp);
