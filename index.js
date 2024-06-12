import express from 'express';
import path from 'path';
import { engine } from 'express-handlebars';
import session from 'express-session';
import advertisementRoutes from './routes/advertisements.js';
import pictureRouter from './routes/pictures.js';
import userRouter from './routes/users.js';
import checkAuth from './middleware/checkauth.js';

const app = express();

// statikus állományok (pl. CSS/kliensoldali JS)
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
app.use('/hirdetes', checkAuth);
app.use('/upload_picture', checkAuth);
app.use('/delete_picture', checkAuth);

// beállítjuk a handlebars-t, mint sablonmotor
app.set('view engine', 'hbs');
app.set('views', path.join(process.cwd(), 'views'));
app.engine(
  'hbs',
  engine({
    extname: 'hbs',
    defaultView: 'main',
    layoutsDir: path.join(process.cwd(), 'views/layouts'),
    partialsDir: path.join(process.cwd(), 'views/partials'),
  }),
);

// kössük be a külső modulban megírt route-okat
app.use('/', advertisementRoutes);
app.use('/', pictureRouter);
app.use('/', userRouter);

app.get('/index', (req, res) => {
  res.render('index');
});

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
