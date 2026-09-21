// Vercel entry point for the Express API.
//
// The API implementation lives in server/index.js (routes, validation, error
// handling, and the DB_DRIVER-based Neon/SQLite backend selection). Vercel
// requires its Serverless Functions to live under the api/ directory, so this
// file simply re-exports the configured Express app as the request handler.
//
// server/index.js already skips app.listen() when process.env.VERCEL === '1',
// so no port is bound when this module runs as a serverless function.

import app from '../server/index.js';

export default app;