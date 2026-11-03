const http = require("http");
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const env = require("./config/env");
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { initSocket } = require("./socket");

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// These two must always be last
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

// Use server.listen (not app.listen) so Socket.IO shares the same HTTP server
server.listen(env.port || 5001, () => {
    console.log(`TeamFlow API running on http://localhost:${env.port || 5001}`);
});