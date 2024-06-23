import express from 'express';
import { format } from 'date-fns';
import * as db from '../db/db.js';

const app = express();
app.use(express.json());
const router = express.Router();

router.get(['/show_discussions'], async (req, res) => {
  try {
    const userID = req.session.user.id;
    const userDiscussions = await db.findDiscussionsByUserId(userID);
    const latestMessages = await Promise.all(
      userDiscussions.map(async (discussion) => {
        const latestMessage = await db.selectLatestMessageByDiscussionId(discussion.csevegesID);
        let you = null;
        let them = null;
        if (userID === discussion.felh1ID) {
          you = await db.findUserById(discussion.felh1ID);
          them = await db.findUserById(discussion.felh2ID);
        } else {
          you = await db.findUserById(discussion.felh2ID);
          them = await db.findUserById(discussion.felh1ID);
        }
        latestMessage.you = you;
        latestMessage.them = them;
        latestMessage.kuldesiIdo = format(latestMessage.kuldesiIdo, 'yyyy/MM/dd HH:mm:ss');
        return latestMessage;
      }),
    );
    return res.status(200).render('csevegesek', { discussions: latestMessages });
  } catch (err) {
    return res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

router.post(['/send_message'], express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const userID = req.session.user.id;
    const { message, recipientUserID } = req.body;
    if (!recipientUserID || !message) {
      return res.status(400).json({ message: 'Hianyzo form adatok.' });
    }
    if (userID === recipientUserID) {
      return res.status(400).json({ message: 'Nem kuldhetsz magadnak uzenetet.' });
    }
    if (recipientUserID === null) {
      return res.status(400).json({ message: 'Nem letezo felhasznalo.' });
    }
    const newMessage = {
      userID,
      text: message,
    };
    let discussion = await db.checkIfDiscussionExists(userID, recipientUserID);
    if (discussion != null) {
      await db.addNewMessageToDiscussion(discussion.csevegesID, newMessage);
    } else {
      await db.addNewDiscussion(userID, recipientUserID);
      discussion = await db.checkIfDiscussionExists(userID, recipientUserID);
      await db.addNewMessageToDiscussion(discussion.csevegesID, newMessage);
    }
    let messages = await db.findAllMessagesOfDiscussion(discussion.csevegesID);
    messages = messages.map((msg) => ({
      ...msg,
      kuldesiIdo: format(msg.kuldesiIdo, 'yyyy/MM/dd HH:mm:ss'),
    }));
    return res.status(200).json({ type: 'ok', messages, you: userID, them: recipientUserID });
  } catch (err) {
    return res.status(500).json({ type: 'error', message: `Selection unsuccessful: ${err.message}` });
  }
});

router.get(['/show_discussion'], async (req, res) => {
  try {
    const { user1ID, user2ID } = req.query;
    const you = await db.findUserById(user1ID);
    const them = await db.findUserById(user2ID);
    if (you === null || them === null || you.felhID !== req.session.user.id) {
      return res.status(400).json({ message: 'Nem letezo felhasznalok' });
    }
    const discussion = await db.checkIfDiscussionExists(user1ID, user2ID);
    if (discussion === null) {
      await db.addNewDiscussion(user1ID, user2ID);
      return res.status(200).render('cseveges', { messages: [], you, them });
    }
    let messages = await db.findAllMessagesOfDiscussion(discussion.csevegesID);
    messages = messages.map((message) => ({
      ...message,
      kuldesiIdo: format(message.kuldesiIdo, 'yyyy/MM/dd HH:mm:ss'),
    }));
    return res.status(200).render('cseveges', { messages, you, them });
  } catch (err) {
    return res.status(500).render('error', { message: `Selection unsuccessful: ${err.message}` });
  }
});

export default router;
