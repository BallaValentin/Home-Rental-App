import express from 'express';
import multer from 'multer';
import { join } from 'path';
import fs, { existsSync, mkdirSync } from 'fs';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();

const uploadDir = join(process.cwd(), 'pictures');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}
app.use('/pictures', express.static(uploadDir));

const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

router.get(['/hirdetes'], async (req, res) => {
  try {
    const felhasznalo = await db.findAllUsers();
    res.render('hirdetes', { users: felhasznalo });
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get(['/index'], async (req, res) => {
  try {
    const hirdetes = await db.getAllAdvertisements();
    res.render('index', { advertisements: hirdetes });
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
  const advertisements = await db.getAllAdvertisements();
  return response.status(200).render('index', { advertisements, message: 'Új lakáshirdetés sikeresen feltöltve.' });
});

router.get('/advertisement_search', express.urlencoded({ extended: true }), async (request, response) => {
  console.log(`A szerver sikeresen megkapta a következő információt:
    city_name: ${request.query.city_name}
    city_quarter_name: ${request.query.city_quarter_name}
    min_price: ${request.query.min_price}
    max_price: ${request.query.max_price}`);
  const searchParameters = {
    city_name: request.query.city_name,
    city_quarter_name: request.query.city_quarter_name,
    min_price: request.query.min_price,
    max_price: request.query.max_price,
  };
  const advertisements = await db.searchAdvertisements(searchParameters);
  return response.status(200).render('index', { advertisements });
});

router.get('/advertisement/:id', async (request, response) => {
  const advertisementId = request.params.id;
  const advertisement = await db.findAdvertisementById(advertisementId);
  const pictures = await db.findPhotosByAdvertisementId(advertisementId);
  return response.status(200).render('reszletek', { advertisement, pictures });
});

router.get('/advertisement_detailed', async (request, response) => {
  const advertisementId = request.query.advertisementID;
  try {
    const advertisement = await db.findAdvertisementById(advertisementId);
    return response.json({ messageType: 'ok', advertisement });
  } catch (err) {
    return response.json({ messageType: 'error', err });
  }
});

router.post('/upload_picture', multerUpload.single('picture'), async (request, response) => {
  console.log(`A szerver sikeresen megkapta a következő információt:
                  file: ${request.file},
                  advertisementID: ${request.body.advertisementID}`);
  const advertisementId = request.body.advertisementID;
  if (request.file) {
    console.log(`picture: ${request.file.originalname}`);
  }
  if (!request.file) {
    const advertisement = await db.findAdvertisementById(advertisementId);
    const pictures = await db.findPhotosByAdvertisementId(advertisementId);
    return response.status(400).render('reszletek', { advertisement, pictures, message: 'Nincs kép megadva.' });
  }

  const filePath = `/pictures/${request.file.filename}`;

  await db.insertPhoto(advertisementId, filePath);
  return response.redirect(`/advertisement/${advertisementId}`);
});

router.delete('/delete_picture', async (request, response) => {
  const pictureId = request.query.pictureID;
  try {
    const picture = await db.findPhotoById(pictureId);
    try {
      await db.deletePhoto(pictureId);
    } catch (err) {
      return response.json({ messageType: 'error', err });
    }
    const relUtvonal = picture[0].elUtvonal.replace('/pictures/', '');
    const filePath = join(uploadDir, relUtvonal);
    try {
      fs.unlinkSync(filePath);
      console.log(`A ${relUtvonal} kep sikeresen torolve lett`);
    } catch (err) {
      console.log(`A ${relUtvonal} kep torlese nem sikerult`);
    }

    return response.json({ messageType: 'ok', message: 'success' });
  } catch (err) {
    return response.json({ messageType: 'error', err });
  }
});

export default router;
