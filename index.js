import express from 'express';
import path from 'path';
import { engine } from 'express-handlebars';
import session from 'express-session';
import Handlebars from 'handlebars';
import advertisementRoutes from './routes/advertisements.js';
import pictureRouter from './routes/pictures.js';
import userRouter from './routes/users.js';
import messageRouter from './routes/messages.js';
import checkAuth from './middleware/checkauth.js';
import userSession from './middleware/userSession.js';

const app = express();

Handlebars.registerHelper('eq', (a, b) => a === b);

// static files (pl. CSS/client-side JS)
app.use(express.static(path.join(process.cwd(), 'static')));
app.use('/pictures', express.static(path.join(process.cwd(), 'pictures')));
app.use(
  session({
    secret: 'f8d3a06c15544bd4b24daccad6c14a04',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 60 * 60 * 1000,
    },
  }),
);

app.use('/submit_advertisement_upload', checkAuth);
app.use('/upload_picture', checkAuth);
app.use('/delete_picture', checkAuth);
app.use('/show_discussions', checkAuth);
app.use('/send_message', checkAuth);
app.use('/show_discussion', checkAuth);
app.use('/show_users', checkAuth);
app.use('/search_users', checkAuth);
app.use('/delete_advertisement', checkAuth);

app.use('/advertisement', userSession);
app.use('/details', userSession);
app.use('/discussion', userSession);
app.use('/discussions', userSession);
app.use('/index', userSession);
app.use('/show_users', userSession);
app.use('/show_discussion', userSession);

// beállítjuk a handlebars-t, mint sablonmotor
app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'));
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultView: 'main',
    partialsDir: path.join(process.cwd(), 'views/partials'),
    layoutsDir: path.join(process.cwd(), 'views/layouts'),
  }),
);

// kössük be a külső modulban megírt route-okat
app.use('/', advertisementRoutes);
app.use('/', pictureRouter);
app.use('/', userRouter);
app.use('/', messageRouter);

app.get('/index', (req, res) => {
  res.render('index');
});

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
