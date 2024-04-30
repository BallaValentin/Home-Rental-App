import express from 'express';
import { join } from 'path';
import fs from 'fs';

const app = express();

app.use((req, resp, next) => {
  const date = new Date();
  console.log(`${date} ${req.method} ${req.url}`);
  next();
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

// eslint-disable-next-line complexity
app.post('/submit_advertisement_upload', express.urlencoded({ extended: true }), (request, response) => {
  if (
    !request.body.city ||
    !request.body.city_quarter ||
    !request.body.surface_area ||
    !request.body.price ||
    !request.body.number_of_rooms ||
    !request.body.upload_date
  ) {
    response.status(400).send('Nincs minden mező kitöltve.');
  } else if (
    !Number.isInteger(Number(request.body.surface_area)) ||
    !Number.isInteger(Number(request.body.price)) ||
    !Number.isInteger(Number(request.body.number_of_rooms))
  ) {
    response.status(400).send('Helytelen mezők.');
  } else {
    // const message = 'Az uj lakáshirdetés sikeresen beszúrva';
    const data = readDataFromFile('advertisements.json');
    const newID = generateNewId(data);
    const newAdvertisement = {
      id: newID,
      city: request.body.city,
      city_quarter: request.body.city_quarter,
      surface_area: parseInt(request.body.surface_area, 10),
      price: parseInt(request.body.price, 10),
      number_of_rooms: parseInt(request.body.number_of_rooms, 10),
      upload_date: new Date(request.body.upload_date).toLocaleDateString(),
    };
    data.push(newAdvertisement);
    writeDataToFile('advertisements.json', data);
    response.json(newAdvertisement);
    // response.set('Content-Type', 'text/plain;charset=utf-8');
    // response.end(message);
  }
});

app.post('/submit_image_upload', express.urlencoded({ extended: true }), (request, response) => {
  if (!request.body.advertisement_id_input || !request.body.image_uploader_input) {
    response.status(400).send('Nincs minden mező kitöltve.');
  } else {
    const message = `A szerver sikeresen megkapta a következő információt:
        KépID: ${request.body.advertisement_id_input}
        Kép: ${request.body.image_uploader_input}
      `;
    console.log(message);

    response.set('Content-Type', 'text/plain;charset=utf-8');
    response.end(message);
  }
});

app.use(express.static(join(process.cwd(), 'public/lab3')));

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
