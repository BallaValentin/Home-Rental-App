import express from 'express';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();

router.get(['/hirdetes'], async (req, res) => {
  try {
    const felhasznalo = await db.findAllUsers();
    res.render('hirdetes', { users: felhasznalo });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

function formValidation(formFields) {
  if (Object.values(formFields).some((value) => !value)) {
    return -1;
  }
  if (
    Object.values(formFields)
      .slice(3, 6)
      .some((value) => !Number.isInteger(Number(value)) || parseInt(value, 10) <= 0 || parseInt(value, 10) > 1000000000)
  ) {
    return -2;
  }
  return 1;
}

router.post('/submit_advertisement_upload', express.urlencoded({ extended: true }), async (request, response) => {
  console.log(`A szerver sikeresen megkapta a következő információkat:
              users: ${request.body.users},
              city: ${request.body.city},
              city_quarter: ${request.body.city_quarter},
              surface_area: ${request.body.surface_area},
              price: ${request.body.price},
              number_of_rooms: ${request.body.number_of_rooms},
              upload_date: ${new Date(request.body.upload_date).toLocaleDateString()},`);

  const userID = await db.findUserIdByName(request.body.users);
  const formFields = {
    UID: userID,
    city: request.body.city,
    city_quarter: request.body.city_quarter,
    surface_area: request.body.surface_area,
    price: request.body.price,
    number_of_rooms: request.body.number_of_rooms,
    upload_date: request.body.upload_date,
  };

  const felhasznalo = await db.findAllUsers();
  const returnValue = formValidation(formFields);
  if (returnValue === -1) {
    return response.status(400).render('hirdetes', { users: felhasznalo, message: 'Nincs minden mező kitöltve.' });
  }
  if (returnValue === -2) {
    return response.status(400).render('hirdetes', { users: felhasznalo, message: 'Helytelen mezők.' });
  }
  await db.insertAdvertisement(formFields);
  return response.status(200).render('index', { message: 'Minden mezo sikeresen kitoltve.' });
});

export default router;
