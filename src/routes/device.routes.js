import { Router } from 'express';
import { display, hit, register, test } from '../controllers/device.controller';
import {
  devicesContextUpdate,
  displayUpdate,
  targetHit,
  targetUpdate,
} from '../middlewares/socket.io/device';

// Express route
const router = Router();

// Post a JSON payload to see what the server received. For debugging only.
router.post('/test', test);

// Register a device with all its configuration information.
// Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
// Server WebSocket asynchronously emits TARGET_UPDATE event.
// 2.1 ) Smart target device sends a REGISTRATION event
// POST /api/v1/register
router.post('/register', register, [devicesContextUpdate, targetUpdate]);

// Post a device hit event.
// Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
// Server WebSocket asynchronously emits TARGET_HIT event.
router.post('/hit', hit, [devicesContextUpdate, targetHit]);

// Report display changes from a device.
// Server WebSocket asynchronously emits DEVICES_CONTEXT_UPDATE event.
router.post('/display', display, [devicesContextUpdate, displayUpdate]);

export default router;
