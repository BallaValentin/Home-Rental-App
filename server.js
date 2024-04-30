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
  let ok = true;
  for (let i = 0; i < formFields.length; i++) {
    if (!formFields[i]) {
      ok = false;
      break;
    }
  }
  if (!ok) {
    return -1;
  }
  for (let i = 2; i < 5; i++) {
    if (
      !Number.isInteger(Number(formFields[i])) ||
      parseInt(formFields[i], 10) <= 0 ||
      parseInt(formFields[i], 10) > 1000000000
    ) {
      ok = false;
    }
  }
  if (!ok) {
    return -2;
  }
  return 1;
}

// eslint-disable-next-line complexity
app.post('/submit_advertisement_upload', express.urlencoded({ extended: true }), (request, response) => {
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
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.post('/submit_image_upload', multerUpload.single('image_uploader_input'), (request, response) => {
  const imageFile = request.file;
  console.log(request.file);
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
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.use(express.static(join(process.cwd(), 'public/lab3')));

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
