import { datatype, date } from 'faker';

export const socketServerPath = '/game-controller-server';

const rooms = {
  'gateway-server': 'gateway-servers',
  'web-client': 'web-clients',
  device: 'devices',
};
export const getRoomByClientType = (type) => rooms[type];

export const generateHit = (clientId, gameId) => ({
  clientId,
  gameId,
  deviceId: datatype.uuid(),
  userId: datatype.uuid(),
  value1: datatype.number(),
  value2: datatype.number(),
  value3: datatype.number(),
  value4: datatype.number(),
  time: date.recent(),
});

export function log(type, msg, ...args) {
  switch (type) {
    case 'info':
      console.log('\x1b[34m%s\x1b[0m', msg, ...args);
      break;
    case 'success':
      console.log('\x1b[35m%s\x1b[0m', msg, ...args);
      break;
    case 'warning':
      console.log('\x1b[33m%s\x1b[0m', msg, ...args);
      break;
    case 'error':
      console.log('\x1b[31m%s\x1b[0m', msg, ...args);
      break;
    default:
      console.log('\x1b[36m%s\x1b[0m', msg, ...args);
      break;
  }
}
