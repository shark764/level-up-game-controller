import 'dotenv/config';
import { Server } from 'socket.io';
import { getRoomByClientType, log, socketServerPath } from '../utils';
import { whiteList } from '../utils/consts';
import { EVENTS } from './events';

const port = process.env.IO_PORT || 3012;
const isDevEnvironment = process.env.NODE_ENV === 'development';

/**
 * Restricting access to server using a whitelist
 */
const corsOptions = {
  origin: whiteList,
  optionsSuccessStatus: 200, // For legacy browser support
};

const socketServer = new Server(port, {
  path: socketServerPath,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  // cors: {
  //   ...corsOptions,
  //   methods: ['GET', 'POST'],
  //   allowedHeaders: ['levelup-token-header'],
  //   credentials: true,
  // },
});

const run = () => {
  // if (isDevEnvironment) {
  log(
    'success',
    `\nSocket.IO Server accepting connections at port ${port} ....`,
    `\nStarting timestamp: ${new Date()}`
  );
  // }

  socketServer.on('connection', (socket) => {
    if (isDevEnvironment) {
      log('info', `Client connected [id=${socket.id}]`);
    }

    const { type } = socket.handshake.query;
    const room = getRoomByClientType(type);
    if (room) {
      socket.join(room);
      if (isDevEnvironment) {
        log('default', `Client joined room ${room} [id=${socket.id}]`);
      }
    }

    /**
     * 1.2 - REST Service for Smart Target / Display Devices
     * Sender: Device
     */
    // Post a JSON payload to see what the server received. For debugging only.
    socket.on(EVENTS.DEVICE.TEST, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.DEVICE.TEST}`
        );
      }
      try {
        socket.emit(EVENTS.DEVICE.TEST_SUCCEEDED, data);
      } catch (error) {
        socket.emit(EVENTS.DEVICE.TEST_FAILED, data);
      }
    });

    // Register a device with all its configuration information.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    // Server WebSocket asynchronously emits TARGET_UPDATE event.
    // 2.1 ) Smart target device sends a REGISTRATION event
    // POST /api/v1/register
    socket.on(EVENTS.DEVICE.REGISTER, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.DEVICE.REGISTER}`
        );
      }
      try {
        // 2.1 ) Smart target device sends a REGISTRATION event
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE, data);
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.TARGET_UPDATE, data);

        // 200 - OK
        socket.emit(EVENTS.DEVICE.REGISTER_SUCCEEDED, data);
      } catch (error) {
        // 500 - Server Error
        socket.emit(EVENTS.DEVICE.REGISTER_FAILED, data);
      }
    });

    // Post a device hit event.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    // Server WebSocket asynchronously emits TARGET_HIT event.
    // 2.2 ) Smart target device sends a HIT event
    // POST /api/v1/hit
    socket.on(EVENTS.DEVICE.HIT, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.DEVICE.HIT}`
        );
      }
      try {
        // 2.2 ) Smart target device sends a HIT event
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE, data);
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.TARGET_HIT, data);

        socket.emit(EVENTS.DEVICE.HIT_SUCCEEDED, data);
      } catch (error) {
        socket.emit(EVENTS.DEVICE.HIT_FAILED, data);
      }
    });

    // Report display changes from a device.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    // 2.3 ) Smart target device sends a DISPLAY event
    // POST /api/v1/display
    socket.on(EVENTS.DEVICE.DISPLAY, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.DEVICE.DISPLAY}`
        );
      }
      try {
        // 2.3 ) Smart target device sends a DISPLAY event
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE, data);
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.DISPLAY_UPDATE, data);

        socket.emit(EVENTS.DEVICE.DISPLAY_SUCCEEDED, data);
      } catch (error) {
        socket.emit(EVENTS.DEVICE.DISPLAY_FAILED, data);
      }
    });

    /**
     * 1.3 ) WebSocket Service Commands
     * Commands comming from reporting server through gateway
     */
    // Delete all device and event log data in the server database.
    socket.on(EVENTS.GATEWAY_CLIENT.RESET_DATA, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.RESET_DATA}`
        );
      }
    });
    // Clear the event log in the server database.
    socket.on(EVENTS.GATEWAY_CLIENT.CLEAR_LOG, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.CLEAR_LOG}`
        );
      }
    });
    // Send a GET /status to a registered device to get latest context.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    socket.on(EVENTS.GATEWAY_CLIENT.PING, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.PING}`
        );
      }

      try {
        // POST /status
        socketServer.to('devices').emit(EVENTS.DEVICE.STATUS, data);
      } catch (error) {
        if (isDevEnvironment) {
          log('error', EVENTS.GATEWAY_CLIENT.PING, error);
        }
      }
    });
    // Send a GET /status to all registered devices to get all context updates.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    socket.on(EVENTS.GATEWAY_CLIENT.PING_ALL, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.PING_ALL}`
        );
      }
    });
    // Send a POST /config to a registered device to set configuration.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    socket.on(EVENTS.GATEWAY_CLIENT.SET_DEVICE_CONFIG, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.SET_DEVICE_CONFIG}`
        );
      }

      try {
        // POST /config
        socketServer.to('devices').emit(EVENTS.DEVICE.SET_DEVICE_CONFIG, data);
      } catch (error) {
        if (isDevEnvironment) {
          log('error', EVENTS.GATEWAY_CLIENT.SET_DEVICE_CONFIG, error);
        }
      }
    });
    socket.on(EVENTS.DEVICE.SET_DEVICE_CONFIG_COMPLETED, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.DEVICE.SET_DEVICE_CONFIG_COMPLETED}`
        );
      }

      try {
        // WS EVENT DEVICES_CONTEXT_UPDATE
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE, data);
      } catch (error) {
        if (isDevEnvironment) {
          log('error', EVENTS.GATEWAY_CLIENT.SET_DEVICE_CONFIG, error);
        }
      }
    });
    // Send a POST /mode to a registered device to set game mode.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    socket.on(EVENTS.GATEWAY_CLIENT.SET_DEVICE_MODE, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.SET_DEVICE_MODE}`
        );
      }

      try {
        // POST /mode
        socketServer.to('devices').emit(EVENTS.DEVICE.SET_DEVICE_MODE, data);
      } catch (error) {
        if (isDevEnvironment) {
          log('error', EVENTS.GATEWAY_CLIENT.SET_DEVICE_MODE, error);
        }
      }
    });
    socket.on(EVENTS.DEVICE.SET_DEVICE_MODE_COMPLETED, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.DEVICE.SET_DEVICE_MODE_COMPLETED}`
        );
      }

      try {
        // WS EVENT DEVICES_CONTEXT_UPDATE
        socketServer
          .to('gateway-servers')
          .emit(EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE, data);
      } catch (error) {
        if (isDevEnvironment) {
          log('error', EVENTS.GATEWAY_CLIENT.SET_DEVICE_MODE, error);
        }
      }
    });
    // Send a POST /start to a registered device to start game.
    // Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
    socket.on(EVENTS.GATEWAY_CLIENT.START_DEVICE, (data) => {
      if (isDevEnvironment) {
        log(
          'info',
          `Client [id=${socket.id}] emitted event ${EVENTS.GATEWAY_CLIENT.START_DEVICE}`
        );
      }

      try {
        // POST /start
        socketServer.to('devices').emit(EVENTS.DEVICE.START_DEVICE, data);
      } catch (error) {
        if (isDevEnvironment) {
          log('error', EVENTS.GATEWAY_CLIENT.START_DEVICE, error);
        }
      }
    });

    socket.on('disconnecting', () => {
      log(
        'default',
        `Client will be disconnect [id=${socket.id}]`,
        socket.rooms
      );
    });

    /**
     * When socket disconnects, remove it from the list:
     */
    socket.on('disconnect', (reason) => {
      log('warning', `Client gone [id=${socket.id}]`, reason, socket.rooms);
    });
  });
};

export default { socketServer, run };
