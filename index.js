/*
Példa egy full stack alkalmazásra, mely:
- elmenti a bárhova érkezett HTTP kérések információit adatbázisba
- Handlebars segítségével viewt generál korábbi kérésekkel
- hibaoldalra irányít hibás működés esetén
- morgan segítségével naplózik
*/

import express from 'express';
import path from 'path';
// import morgan from 'morgan';
import { engine } from 'express-handlebars';
// import requestLoggerMiddleware from './middleware/requestlogger.js';
// import errorMiddleware from './middleware/error.js';
import requestRoutes from './routes/requests.js';

const app = express();

// statikus állományok (pl. CSS/kliensoldali JS)
app.use(express.static(path.join(process.cwd(), 'public/lab3')));

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

// naplózás (globális)
// app.use(morgan('tiny'));
// kössük be a middleware-t, amely minden hívást DB-be szúr
// app.use(requestLoggerMiddleware);
// kössük be a külső modulban megírt route-okat
app.use('/requests', requestRoutes);

// utolsóként kössük be a hibaoldalkezelőt globálisan
// app.use(errorMiddleware);
app.get('/index', (req, res) => {
  console.log('Im here');
  res.render('index');
});

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
