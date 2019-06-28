let express = require('express');
let router = express.Router();

let chatScript = require('../controllers/chatScript');

/* GET users listing. */

/* POST users listing. */
router.post('/getRoom', chatScript.getChatRoom);
router.post('/getRoomById', chatScript.getChatRoomById);
router.post('/getMessages', chatScript.getMessages);
router.post('/messagesNotSeen', chatScript.getMessagesNotSeen);
router.post('/lastView', chatScript.lastView);
router.post('/getChats', chatScript.getChats);
router.post('/newChat', chatScript.createChat);

module.exports = router;
