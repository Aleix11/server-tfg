let express = require('express');
let router = express.Router();

let userScripts = require('../controllers/userScript');

/* GET users listing. */

/* POST users listing. */
router.post('/login', userScripts.login);
router.post('/register', userScripts.register);
// router.post('/createWallet', userScripts.createWallet);
// router.post('/loadWallet', userScripts.loadWallet);

router.post('/getUserFromId', userScripts.getUserFromId);
router.post('/getUserFromUsername', userScripts.getUserFromUsername);
router.post('/getNumberTokens', userScripts.getNumberTokens);
router.post('/editUser', userScripts.editUser);
router.post('/editFavouriteSummoner', userScripts.editFavouriteSummoner);

router.post('/search', userScripts.searchUser);

router.post('/friends/add', userScripts.addFriend);
router.post('/friends/delete', userScripts.deleteFriend);

router.post('/buyTokensPassTokens', userScripts.buyTokensPassTokens);
router.post('/sellTokensPassEthers', userScripts.sellTokensPassEthers);

module.exports = router;
