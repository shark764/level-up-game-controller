import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import addRequestId from 'express-request-id';
import { generateHit, log } from './utils';

const port = process.env.SOCKET_IO_PORT || 8001;
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(addRequestId());

/**
 * Restricting access to server using a whitelist
 */
const corsOptions = {
  origin: [
    /(localhost|127.0.0.1)./,
    'https://react-socket-io-client-1.herokuapp.com',
    'https://react-socket-io-client-1.netlify.app',
  ],
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
  path: '/game-controller-socket.io',
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

const connectedSocketClients = new Map();

ioServer.on('connection', (socket) => {
  log('info', `Client connected [id=${socket.id}]`);
  // console.log('headers', socket.handshake.headers); // levelup-token-header
  const { type } = socket.handshake.query;
  connectedSocketClients.set(socket.id, {
    type,
    socket,
  });

  /**
   * Handle when socket client sends data
   */
  socket.on('_game_running-test-data', (data) => {
    console.log('_game_running-test-data', data);
    socket.emit('_game_event-hit', { data });
  });

  /**
   * Handle when a new game starts
   */
  socket.on('__device_::_game_event::_new-game', () => {
    log('info', `Client [id=${socket.id}] started a new game`);
    for (const [id, client] of connectedSocketClients.entries()) {
      if (client.type === 'server') {
        const message = {
          game: { name: 'Round #1000' },
          player: { name: 'Farid' },
        };
        client.socket.emit(
          '__game_controller_::_game_event::_start',
          { client: id, ...message },
          (data) => {
            socket.emit('__reporting_bff_::_game_event::_started', data);
          }
        );
      }
    }
  });

  /**
   * Handle when a target is hit
   */
  socket.on('__device_::_game_event::_target-hit', (data) => {
    log('success', `Client [id=${socket.id}] sent a hit`);
    for (const [id, client] of connectedSocketClients.entries()) {
      const hit = generateHit(id, data.gameId);
      if (client.type === 'server') {
        client.socket.emit(
          '__game_controller_::_game_event::_target-hit',
          { client: id, hit },
          (data) => {
            socket.emit('__reporting_bff_::_game_event::_target-hit', data);
          }
        );
      }
    }
  });

  /**
   * Handle when a game has finished
   */
  socket.on('__device_::_game_event::_end-game', (data) => {
    log('default', `Client [id=${socket.id}] finalized a game`);
    const { gameId } = data;
    for (const [id, client] of connectedSocketClients.entries()) {
      if (client.type === 'server') {
        client.socket.emit(
          '__game_controller_::_game_event::_finish',
          { id, gameId },
          (data) => {
            socket.emit('__reporting_bff_::_game_event::_finished', data);
          }
        );
      }
    }
  });

  /**
   * When socket disconnects, remove it from the list:
   */
  socket.on('disconnect', (reason) => {
    connectedSocketClients.delete(socket.id);
    log('warning', `Client gone [id=${socket.id}]`, reason);
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
    `\n\tStart date: ${new Date()}`
  );
});
