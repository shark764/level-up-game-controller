import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import addRequestId from 'express-request-id';
import { generateHit, getRoomByClientType, log, socketIOPath } from './utils';
import { whiteList } from './utils/consts';
import { EVENTS } from './events';

// const domain = process.env.DOMAIN || 'localhost';
const port = process.env.PORT || 8001;
// const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(addRequestId());

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
 * Define the first route
 */
app.get('/hello', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});
/**
 * Simple GET route
 */
app.get('/greeting', (req, res) => {
  res.json({ message: 'Hola mundo!' });
});

const ioServer = new Server(httpServer, {
  path: socketIOPath,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST'],
    allowedHeaders: ['levelup-token-header'],
    credentials: true,
  },
});

ioServer.on('connection', (socket) => {
  log('info', `Client connected [id=${socket.id}]`);

  const { type } = socket.handshake.query;
  const room = getRoomByClientType(type);
  if (room) {
    socket.join(room);
    log('default', `Client joined room ${room} [id=${socket.id}]`);
  }

  /**
   * Handle when socket client sends data
   */
  socket.on('_game_running-test-data', (data, callback) => {
    console.log('_game_running-test-data', data);
    socket.emit('_game_event-hit', { data });
    callback({
      status: 'ok',
    });
  });

  /**
   * Handle when a new game starts
   */
  socket.on(EVENTS.DEVICE.NEW_GAME, (data, callback) => {
    log('info', `Client [id=${socket.id}] started a new game`);

    const message = {
      socket: socket.id,
      payload: { game: { name: 'Round #1000' }, player: { name: 'Farid' } },
    };
    ioServer
      .to('gateway-servers')
      .emit(EVENTS.GAME_CONTROLLER.START_GAME, message);

    // callback && callback({ status: 'ok' });
  });

  /**
   * Handle when a target is hit
   */
  socket.on(EVENTS.DEVICE.TARGET_HIT, (data, callback) => {
    log('success', `Client [id=${socket.id}] sent a hit`);

    const message = {
      socket: socket.id,
      payload: { hit: generateHit(socket.id, data.gameId) },
    };

    ioServer
      .to('gateway-servers')
      .emit(EVENTS.GAME_CONTROLLER.TARGET_HIT, message);

    // callback && callback({ status: 'ok' });
  });

  /**
   * Handle when a game has finished
   */
  socket.on(EVENTS.DEVICE.END_GAME, (data, callback) => {
    log('default', `Client [id=${socket.id}] finalized a game`);

    const { gameId } = data;
    const message = { socket: socket.id, payload: { gameId } };

    ioServer
      .to('gateway-servers')
      .emit(EVENTS.GAME_CONTROLLER.FINISH_GAME, message);

    // callback && callback({ status: 'ok' });
  });

  /**
   * Messages received from gateway-server
   * These are responses comming from Reporting BFF
   */
  socket.on(EVENTS.GAME_CONTROLLER.GAME_STARTED, (data, callback) => {
    ioServer.to('devices').emit(EVENTS.DEVICE.GAME_ADDED, data);

    // callback && callback({ status: 'ok' });
  });
  socket.on(EVENTS.GAME_CONTROLLER.TARGET_HIT, (data, callback) => {
    ioServer.to('devices').emit(EVENTS.DEVICE.TARGET_HIT, data);

    // callback && callback({ status: 'ok' });
  });
  socket.on(EVENTS.GAME_CONTROLLER.GAME_FINISHED, (data, callback) => {
    ioServer.to('devices').emit(EVENTS.DEVICE.GAME_ENDED, data);

    // callback && callback({ status: 'ok' });
  });

  socket.on('disconnecting', () => {
    log('default', `Client will be disconnect [id=${socket.id}]`, socket.rooms);
  });

  /**
   * When socket disconnects, remove it from the list:
   */
  socket.on('disconnect', (reason) => {
    log('warning', `Client gone [id=${socket.id}]`, reason, socket.rooms);
  });
});

/**
 * Set port, listen for requests
 * WARNING!!
 * app.listen(3000); will not work here, as it creates a new HTTP server
 */
httpServer.listen({ port }, () => {
  log(
    'success',
    `\nGame Controller Server listening on port ${port} ....`,
    `\n\tStarting timestamp: ${new Date()}`
  );
});
