import express from 'express';
// import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();

router.get(['/login'], (req, res) => {
  try {
    res.render('bejelentkezes');
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.post(['/login-user'], express.urlencoded({ extended: true }), (req, res) => {
  console.log(req.body);
  const user = { nev: req.body.username };
  console.log(user);
  try {
    res.render('index', { user });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

export default router;
