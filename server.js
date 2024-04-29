import express from 'express';
import { join } from 'path';

const app = express();

app.use((req, resp, next) => {
  const date = new Date();
  console.log(`${date} ${req.method} ${req.url}`);
  // továbbengedjük a hívási láncot
  next();
});

app.post('/submit_advertisement_upload', express.urlencoded({ extended: true }), (request, response) => {
  const message = `A szerver sikeresen megkapta a következő információt:
      Város: ${request.body.city}
      Városnegyed: ${request.body.city_quarter}
      Felszinterület: ${request.body.surface_area}
      Ár: ${request.body.price}
      Szobák száma: ${request.body.number_of_rooms}
      Feltöltés dátuma: ${new Date(request.body.upload_date).toLocaleDateString()}
    `;
  console.log(message);

  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.post('/submit_image_upload', express.urlencoded({ extended: true }), (request, response) => {
  const message = `A szerver sikeresen megkapta a következő információt:
        KépID: ${request.body.advertisement_id_input}
        Kép: ${request.body.image_uploader_input}
      `;
  console.log(message);

  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(message);
});

app.use(express.static(join(process.cwd(), 'public/lab3')));

app.listen(8080, () => {
  console.log('Server listening on http://localhost:8080/ ...');
});
