import express from 'express';
import crypto from 'crypto';
import * as db from '../db/db.js';

const saltSize = 30;

const app = express();
app.use(express.json());
const router = express.Router();

router.get(['/login'], (req, res) => {
  try {
    res.render('login');
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get(['/logout'], (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    return res.redirect('/index');
  });
});

router.get(['/registration'], (req, res) => {
  try {
    res.render('registration');
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.post(['/login-user'], express.urlencoded({ extended: true }), async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.findUserByName(username);
    if (!user) {
      return res.status(400).render('login', { err_message: 'Invalid username or password' });
    }
    const salt = Buffer.from(user.salt, 'base64');
    const hash = crypto.createHash('sha512').update(password).update(salt).digest().toString('base64');
    if (hash !== user.hash) {
      return res.status(400).render('login', { err_message: 'Invalid username or password' });
    }
    req.session.user = {
      id: user.userID,
      nev: user.name,
      szerep: user.role,
    };
    return res.redirect('index');
  } catch (err) {
    return res.status(500).json({ message: `Failed to login: ${err.message}` });
  }
});

router.post(['/registration-user'], express.urlencoded({ extended: true }), async (req, res) => {
  const { username, password1, password2 } = req.body;
  if (!username || !password1 || !password2) {
    return res.status(400).render('registration', { message: 'Error: All fields must be filled' });
  }
  const salt = crypto.randomBytes(saltSize);
  const hash1 = crypto.createHash('sha512').update(password1).update(salt).digest();
  const hash2 = crypto.createHash('sha512').update(password2).update(salt).digest();
  if (!hash1.equals(hash2)) {
    return res.status(400).render('regisztracio', { message: 'Error: passwords don`t match' });
  }
  const user = {
    username,
    hash: hash1.toString('base64'),
    salt: salt.toString('base64'),
  };
  try {
    const userExists = await db.findUserByName(username);
    if (userExists) {
      return res.status(400).render('registration', { message: 'Error: The username is already taken' });
    }
    await db.insertUser(user);
    return res.render('login', { ok_message: 'New user signed up successfully!' });
  } catch (err) {
    return res.status(500).render('error', { message: `Failed to sign up new user: ${err.message}` });
  }
});

router.get(['/show_users'], async (req, res) => {
  try {
    const userID = req.session.user.id;
    const user = await db.findUserById(userID);
    if (user.role !== 'admin') {
      return res.status(401).json({ message: 'You have no authorization for this page' });
    }
    const users = await db.findAllUsers();
    return res.status(200).render('users', { userID, users });
  } catch (err) {
    return res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.post(['/update_role'], express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const userID = req.session.user.id;
    const userToPromote = req.body.userID;
    const user = await db.findUserById(userID);
    if (user.role !== 'admin' || String(userID) === String(userToPromote)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { newRole } = req.body;
    if ((await db.findUserById(userToPromote)) == null) {
      return res.status(400).json({ type: 'error', message: 'User not found' });
    }
    if (newRole !== 'user' && newRole !== 'admin') {
      return res.status(400).json({ type: 'error', message: 'Invalid role' });
    }
    await db.updateUserRole(userToPromote, newRole);
    return res.status(200).json({ type: 'ok', message: 'The role of user has been updated' });
  } catch (err) {
    return res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get(['/search_users'], async (req, res) => {
  try {
    const userID = req.session.user.id;
    const user = await db.findUserById(userID);
    if (user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { pattern } = req.query;
    const users = await db.findUsersByPattern(pattern);
    return res.status(200).json({ type: 'ok', users });
  } catch (err) {
    return res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

export default router;
