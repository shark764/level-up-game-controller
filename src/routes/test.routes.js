import 'dotenv/config';
import path from 'path';
import { Router } from 'express';

// Express route
const router = Router();

/**
 * Define the first route
 */
router.get('/hello', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});
/**
 * Simple GET route
 */
router.get('/greeting', (req, res) => {
  res.json({ message: 'Hola mundo!' });
});
/**
 * Test Socket IO
 */
router.get('/ioclient', (req, res) => {
  res.sendFile(path.join(process.cwd() + '/public/testioclient.html'));
});

export default router;
