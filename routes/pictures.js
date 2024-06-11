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
    const owner = await db.findOwnerByAdvertisementId(advertisementId);
    return response
      .status(400)
      .render('reszletek', { advertisement, pictures, message: 'Nincs kép megadva.', owner: owner.felhID });
  }
  const owner = await db.findOwnerByAdvertisementId(advertisementId);
  const userID = request.session.user.id;
  if (userID !== owner.felhID) {
    return response.status(401).json({ message: 'Nincs jogosultságod ehhez' });
  }

  const filePath = `/pictures/${request.file.filename}`;

  await db.insertPhoto(advertisementId, filePath);
  return response.redirect(`/advertisement/${advertisementId}`);
});

router.delete('/delete_picture', async (request, response) => {
  const pictureId = request.query.pictureID;
  console.log(`query ${request.query.pictureID}`);

  try {
    const owner = await db.findOwnerByPictureId(pictureId);
    const userID = request.session.user.id;
    console.log(`owner ${owner} userID ${userID}`);
    if (userID !== owner.felhID) {
      return response.status(401).json({ message: 'Nincs jogosultságod ehhez' });
    }
  } catch (err) {
    return response.status(500).json({ err_message: 'Szerveroldali hiba' });
  }

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
