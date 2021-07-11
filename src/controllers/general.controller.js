import { log } from '../utils';

export function timeLog(req, res, next) {
  log('info', 'Time: ', new Date());
  next();
}

export function authorization(req, res, next) {
  log('warning', "I will let you pass, don't worry...");
  next();
}
