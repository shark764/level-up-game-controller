import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import addRequestId from 'express-request-id';
import { log } from './utils';
import { whiteList } from './utils/consts';
import logger from 'morgan';
import ioServer from './socket.io/server';
/**
 * Import routes
 */
import deviceRouter from './routes/device.routes';
import testRouter from './routes/test.routes';

const port = process.env.PORT || 3011;

const app = express();

app.use(addRequestId());
if (process.env.NODE_ENV === 'development') {
  app.use(logger('dev'));
}

/**
 * Restricting access to server using a whitelist
 */
const corsOptions = {
  origin: whiteList,
  optionsSuccessStatus: 200, // For legacy browser support
};

app.use(cors(corsOptions));

/**
 * Parse requests of content-type - application/json
 * Used to parse JSON bodies
 * WARNING!:
 *    body-parser has been deprecated
 */
app.use(express.json());

/**
 * Parse requests of content-type - application/x-www-form-urlencoded
 * Parse URL-encoded bodies
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Use the express-static middleware
 */
app.use(express.static('public'));

const httpServer = createServer(app);

/**
 * Start Socket.IO server
 */
ioServer.run(httpServer);

/**
 * Defining HTTP Endpoint Routes
 */
app.use('/api/v1', deviceRouter);
app.use('/api/v1/tests', testRouter);

/**
 * Set port, listen for requests
 * WARNING!!
 * app.listen(3000); will not work here, as it creates a new HTTP server
 */
httpServer.listen({ port }, () => {
  log(
    'success',
    `\nGame Controller Server listening on port ${port} ....`,
    `\nStarting timestamp: ${new Date()}`
  );
});
