let express = require('express');
let router = express.Router();

let chatScript = require('../controllers/chatScript');
let md_auth = require('../controllers/middlewares/authenticated');

/* GET users listing. */

/* POST users listing. */
router.post('/getRoom', md_auth.ensureAuth, chatScript.getChatRoom);
router.post('/getRoomById', md_auth.ensureAuth, chatScript.getChatRoomById);
router.post('/getMessages', md_auth.ensureAuth, chatScript.getMessages);
router.post('/messagesNotSeen', md_auth.ensureAuth, chatScript.getMessagesNotSeen);
router.post('/lastView', md_auth.ensureAuth, chatScript.lastView);
router.post('/getChats', md_auth.ensureAuth, chatScript.getChats);
router.post('/newChat', md_auth.ensureAuth, chatScript.createChat);

module.exports = router;
