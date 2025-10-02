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
  console.log(`The server has successfully received the following information:
                    file: ${request.file},
                    advertisementID: ${request.body.advertisementID}`);
  const advertisementId = request.body.advertisementID;
  if (request.file) {
    console.log(`picture: ${request.file.originalname}`);
  }
  const owner = await db.findOwnerByAdvertisementId(advertisementId);
  const userID = request.session.user.id;
  if (userID !== owner.userID) {
    return response.status(401).json({ message: 'Unauthorized' });
  }
  if (!request.file) {
    const advertisement = await db.findAdvertisementById(advertisementId);
    const pictures = await db.findPhotosByAdvertisementId(advertisementId);
    return response.status(400).render('details', {
      advertisement,
      pictures,
      message: 'No image has been added.',
      owner: owner.userID,
      canEditAdvertisement: true,
    });
  }

  const filePath = `/pictures/${request.file.filename}`;

  await db.insertPhoto(advertisementId, filePath);
  return response.redirect(`/advertisement/${advertisementId}`);
});

router.delete('/delete_picture', async (request, response) => {
  const pictureId = request.query.pictureID;
  try {
    const owner = await db.findOwnerByPictureId(pictureId);
    const userID = request.session.user.id;
    if (userID !== owner.userID) {
      return response.status(401).json({ message: 'Unauthorized' });
    }
  } catch (err) {
    return response.status(500).json({ err_message: 'Server-side error' });
  }

  try {
    const picture = await db.findPhotoById(pictureId);
    try {
      await db.deletePhoto(pictureId);
    } catch (err) {
      return response.json({ messageType: 'error', err });
    }
    const relPath = picture[0].filePath.replace('/pictures/', '');
    const filePath = join(uploadDir, relPath);
    try {
      console.log('Removing image...');
      fs.unlinkSync(filePath);
      console.log(`${relPath} image has been successfully deleted`);
    } catch (err) {
      console.log(`Failed to delete ${relPath} image`);
    }
    return response.json({ messageType: 'ok', message: 'success' });
  } catch (err) {
    return response.json({ messageType: 'error', err });
  }
});

export default router;
