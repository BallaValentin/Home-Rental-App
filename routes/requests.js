import express from 'express';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();

router.get(['/hirdetes'], async (req, res) => {
  try {
    const felhasznalo = await db.findAllUsers();
    res.render('hirdetes', { felhasznalok: felhasznalo });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

export default router;
