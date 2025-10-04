import express from 'express';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();

router.get(['/', '/index'], async (req, res) => {
  try {
    const advertisements = await db.getAllAdvertisements();
    if (req.query.message === 'expired') {
      const sessionMessage1 = 'Your session has expired.';
      const sessionMessage2 = 'Sign in again';
      res.render('index', {
        advertisements,
        user: req.session.user,
        session1: sessionMessage1,
        session2: sessionMessage2,
      });
    } else {
      res.render('index', { advertisements, user: req.session.user });
    }
  } catch (err) {
    res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get(['/advertisement'], async (req, res) => {
  try {
    const users = await db.findAllUsers();
    res.render('advertisement', { users });
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
  console.log(`The server has successfully received the following informations:
                city: ${request.body.city},
                city_quarter: ${request.body.city_quarter},
                surface_area: ${request.body.surface_area},
                price: ${request.body.price},
                upload_date: ${new Date().toLocaleDateString()},`);

  const userID = request.session.user.id;

  const formFields = {
    UID: userID,
    city: request.body.city,
    city_quarter: request.body.city_quarter,
    surface_area: request.body.surface_area,
    price: request.body.price,
    upload_date: new Date(),
    number_of_rooms: request.body.number_of_rooms,
  };

  const returnValue = formValidation(formFields);
  if (returnValue === -1) {
    return response
      .status(400)
      .render('advertisment', { message: 'All fields must be completed.', user: request.session.user });
  }
  if (returnValue === -2) {
    return response.status(400).render('advertisement', { message: 'Invalid fields.', user: request.session.user });
  }
  await db.insertAdvertisement(formFields);
  const advertisements = await db.getAllAdvertisements();
  return response.status(200).render('index', {
    advertisements,
    message: 'New advertisement uploaded successfully.',
    user: request.session.user,
  });
});

router.get('/advertisement_search', express.urlencoded({ extended: true }), async (request, response) => {
  console.log(`The server has successfully received the following informations:
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
  return response.status(200).render('index', { advertisements, user: request.session.user });
});

router.get('/advertisement/:id', async (request, response) => {
  const advertisementId = request.params.id;
  const advertisement = await db.findAdvertisementById(advertisementId);
  const pictures = await db.findPhotosByAdvertisementId(advertisementId);
  const ownerID = await db.findOwnerByAdvertisementId(advertisementId);
  const owner = await db.findUserById(ownerID.userID);
  if (!request.session.user)
    return response.status(200).render('details', {
      advertisement,
      pictures,
      owner,
      userID: null,
      canSendMessage: false,
      canEditAdvertisement: false,
    });
  const userID = request.session.user.id;
  if (userID === owner.userID)
    return response.status(200).render('details', {
      advertisement,
      pictures,
      owner,
      userID,
      canSendMessage: false,
      canEditAdvertisement: true,
    });
  return response
    .status(200)
    .render('details', { advertisement, pictures, owner, userID, canSendMessage: true, canEditAdvertisement: false });
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

router.delete('/delete_advertisement', async (request, response) => {
  const advertisementId = request.query.advertisementID;
  console.log(request.query);
  try {
    const userID = request.session.user.id;
    const user = await db.findUserById(userID);
    if (user.szerep !== 'admin') {
      return response.status(401).json({ message: 'Unauthorized' });
    }
    const advertisement = db.findAdvertisementById(advertisementId);
    if (advertisement === null) {
      return response.status(400).json({ message: 'Advertisement not found' });
    }
    await db.deletePicturesByAdvertisementID(advertisementId);
    await db.deleteAdvertisementByID(advertisementId);
    return response.status(200).json({ messageType: 'ok', message: 'Advertisement deleted successfully' });
  } catch (err) {
    return response.json({ messageType: 'error', err });
  }
});

router.get('/get_cities', async (request, response) => {
  try {
    const cities = await db.findCities();
    return response.json({ type: 'ok', cities });
  } catch (err) {
    return response.json({ messageType: 'error', err });
  }
});

router.get('/get_city_quarters', async (request, response) => {
  try {
    const quarters = await db.findCityQuarters();
    return response.json({ type: 'ok', quarters });
  } catch (err) {
    return response.json({ messageType: 'error', err });
  }
});

export default router;
