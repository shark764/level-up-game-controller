import { EVENTS as IO_EVENTS } from '../../socket.io/events';
import { log } from '../../utils';

const isDevEnvironment = process.env.NODE_ENV === 'development';

export const devicesContextUpdate = (req, res, next) => {
  if (isDevEnvironment) {
    log(
      'info',
      `Websocket event type=[${IO_EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE}] is fired as a result of HTTP request`
    );
  }
  try {
    const { socketServer } = req;
    socketServer
      .to('gateway-servers')
      .emit(IO_EVENTS.GATEWAY_CLIENT.DEVICES_CONTEXT_UPDATE, req.body);
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_SUCCEEDED, req.body);
  } catch (error) {
    if (isDevEnvironment) {
      log('error', 'An error ocurred', error);
    }
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_FAILED, req.body);
  }

  next();
};

export const targetUpdate = (req, res, next) => {
  if (isDevEnvironment) {
    log(
      'info',
      `Websocket event type=[${IO_EVENTS.GATEWAY_CLIENT.TARGET_UPDATE}] is fired as a result of HTTP request`
    );
  }
  try {
    const { socketServer } = req;
    socketServer
      .to('gateway-servers')
      .emit(IO_EVENTS.GATEWAY_CLIENT.TARGET_UPDATE, req.body);
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_SUCCEEDED, req.body);
  } catch (error) {
    if (isDevEnvironment) {
      log('error', 'An error ocurred', error);
    }
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_FAILED, req.body);
  }

  next();
};

export const targetHit = (req, res, next) => {
  if (isDevEnvironment) {
    log(
      'info',
      `Websocket event type=[${IO_EVENTS.GATEWAY_CLIENT.TARGET_HIT}] is fired as a result of HTTP request`
    );
  }
  try {
    const { socketServer } = req;
    socketServer
      .to('gateway-servers')
      .emit(IO_EVENTS.GATEWAY_CLIENT.TARGET_HIT, req.body);
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_SUCCEEDED, req.body);
  } catch (error) {
    if (isDevEnvironment) {
      log('error', 'An error ocurred', error);
    }
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_FAILED, req.body);
  }

  next();
};
export const displayUpdate = (req, res, next) => {
  if (isDevEnvironment) {
    log(
      'info',
      `Websocket event type=[${IO_EVENTS.GATEWAY_CLIENT.DISPLAY_UPDATE}] is fired as a result of HTTP request`
    );
  }
  try {
    const { socketServer } = req;
    socketServer
      .to('gateway-servers')
      .emit(IO_EVENTS.GATEWAY_CLIENT.DISPLAY_UPDATE, req.body);
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_SUCCEEDED, req.body);
  } catch (error) {
    if (isDevEnvironment) {
      log('error', 'An error ocurred', error);
    }
    // socketServer.to('devices').emit(IO_EVENTS.DEVICE.HIT_FAILED, req.body);
  }

  next();
};
