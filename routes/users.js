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

router.get(['/logout'], (req, res) => {
  try {
    res.render('index');
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get(['/registration'], (req, res) => {
  try {
    res.render('regisztracio');
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.post(['/login-user'], express.urlencoded({ extended: true }), (req, res) => {
  const user = { nev: req.body.username };
  try {
    res.render('index', { user });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.post(['/registration-user'], express.urlencoded({ extended: true }), (req, res) => {
  try {
    res.render('bejelentkezes', { ok_message: 'Új felhasználó sikeresen regisztrálva!' });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

export default router;
