import express from 'express';
import { join } from 'path';
import fs, { existsSync, mkdirSync } from 'fs';
import multer from 'multer';

const app = express();

app.use((req, resp, next) => {
  const date = new Date();
  console.log(`${date} ${req.method} ${req.url}`);
  next();
});

const uploadDir = join(process.cwd(), 'uploaded_pictures');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

const multerUpload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

function readDataFromFile(filename) {
  try {
    const jsonData = fs.readFileSync(filename, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    fs.writeFileSync(filename, '[]', 'utf8');
    return [];
  }
}

function writeDataToFile(filename, data) {
  fs.writeFileSync(filename, JSON.stringify(data, null, 1), 'utf8');
}

function generateNewId(data) {
  if (data.length === 0) {
    return 1;
  }
  let maxID = 0;
  data.forEach((element) => {
    if (parseInt(element.id, 10) > maxID) {
      maxID = parseInt(element.id, 10);
    }
  });
  return maxID + 1;
}

function formValidation(formFields) {
  for (let i = 0; i < formFields.length; i++) {
    if (!formFields[i]) {
      return -1;
    }
  }
  for (let i = 2; i < 5; i++) {
    if (
      !Number.isInteger(Number(formFields[i])) ||
      parseInt(formFields[i], 10) <= 0 ||
      parseInt(formFields[i], 10) > 1000000000
    ) {
      return -2;
    }
  }
  return 1;
}

app.post('/submit_advertisement_upload', express.urlencoded({ extended: true }), (request, response) => {
  console.log(`A szerver sikeresen megkapta a következő információkat:
              city: ${request.body.city},
              city_quarter: ${request.body.city_quarter},
              surface_area: ${request.body.surface_area},
              price: ${request.body.price},
              number_of_rooms: ${request.body.number_of_rooms},
              upload_date: ${new Date(request.body.upload_date).toLocaleDateString()},`);
  const formFields = [
    request.body.city,
    request.body.city_quarter,
    request.body.surface_area,
    request.body.price,
    request.body.number_of_rooms,
    request.body.upload_date,
  ];

  const returnValue = formValidation(formFields);
  if (returnValue === -1) {
    response.status(400).send('Hiba(400): Nincs minden mező kitöltve.');
    return;
  }
  if (returnValue === -2) {
    response.status(400).send('Hiba(400): Helytelen mezők.');
    return;
  }
  const data = readDataFromFile('advertisements.json');
  const newID = generateNewId(data);
  const newAdvertisement = {
    id: newID,
    pictures: [],
    city: request.body.city,
    city_quarter: request.body.city_quarter,
    surface_area: parseInt(request.body.surface_area, 10),
    price: parseInt(request.body.price, 10),
    number_of_rooms: parseInt(request.body.number_of_rooms, 10),
    upload_date: new Date(request.body.upload_date).toLocaleDateString(),
  };
  data.push(newAdvertisement);
  writeDataToFile('advertisements.json', data);
  const message = `OK(200): Az uj hirdetes sikeresen letrehozva!
                      ID: ${newAdvertisement.id}
                      city: ${newAdvertisement.city}
                      city_quarter: ${newAdvertisement.city_quarter}
                      surface_area ${newAdvertisement.surface_area}
                      price: ${newAdvertisement.price}
                      number_of_rooms: ${newAdvertisement.number_of_rooms}
                      upload_date: ${newAdvertisement.upload_date}`;
  console.log(message);
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.post('/submit_image_upload', multerUpload.single('image_uploader_input'), (request, response) => {
  const imageFile = request.file;
  console.log(`A szerver sikeresen megkapta a következő információt:
    advertisement_id_input: ${request.body.advertisement_id_input}
    picture: ${request.file.originalname}`);
  if (!request.body.advertisement_id_input || !request.file) {
    response.status(400).send('Hiba(400): Nincs minden mező kitöltve.');
    return;
  }
  if (
    !Number.isInteger(Number(request.body.advertisement_id_input)) ||
    parseInt(request.body.advertisement_id_input, 10) <= 0 ||
    parseInt(request.body.advertisement_id_input, 10) > 1000000000
  ) {
    response.status(400).send('Hiba(400): Helytelen mezők.');
    return;
  }
  let foundID = -1;
  let index = -1;
  const data = readDataFromFile('advertisements.json');
  for (let i = 0; i < data.length; i++) {
    if (data[i].id === parseInt(request.body.advertisement_id_input, 10)) {
      foundID = data[i].id;
      index = i;
      break;
    }
  }
  if (foundID === -1) {
    response.status(400).send('Hiba(400): Nincs ilyen ID-jú lakáshirdetés.');
    return;
  }
  data[index].pictures.push(imageFile.originalname);
  writeDataToFile('advertisements.json', data);

  const message = `OK(200): Sikerült képet beszúrni az ${foundID} ID-jú hirdetéshez.
                    allomanynev: ${imageFile.originalname}
                    nev a szerveren: ${imageFile.path}
                    meret: ${imageFile.size}
                    mime-tipus: ${imageFile.mimetype}`;
  console.log(message);
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.get('/advertisement_search', express.urlencoded({ extended: true }), (request, response) => {
  console.log(`A szerver sikeresen megkapta a következő információt:
    city_name: ${request.query.city_name}
    city_quarter_name: ${request.query.city_quarter_name}
    min_price: ${request.query.min_price}
    max_price: ${request.query.max_price}`);
  const data = readDataFromFile('advertisements.json');
  let message = 'A következő hirdetéseket sikerült találni a megadott paraméterekkel: \n';
  for (let i = 0; i < data.length; i++) {
    if (
      (!request.query.city_name || data[i].city === request.query.city_name) &&
      (!request.query.city_quarter_name || data[i].city_quarter === request.query.city_quarter_name) &&
      (!request.query.min_price || data[i].price >= parseInt(request.query.min_price, 10)) &&
      (!request.query.max_price || data[i].price <= parseInt(request.query.max_price, 10))
    ) {
      message += `
                  city: ${data[i].city}
                  city_quarter: ${data[i].city_quarter}
                  surface_area: ${data[i].surface_area}
                  price: ${data[i].price}
                  number_of_rooms: ${data[i].number_of_rooms}
                  upload date: ${data[i].upload_date}`;
      message += '\n';
    }
  }
  console.log(message);
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.use(express.static(join(process.cwd(), 'public/lab3')));

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
