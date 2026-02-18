'use strict';
require('dotenv').config();
const app    = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  await testConnection();          // verify DB before accepting traffic
  app.listen(PORT, () => {
    console.log(`[Organova API] Running on port ${PORT} – env: ${process.env.NODE_ENV}`);
  });
})();
