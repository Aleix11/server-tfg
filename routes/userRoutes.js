let express = require('express');
let router = express.Router();

let userScripts = require('../controllers/userScript');
let md_auth = require('../controllers/middlewares/authenticated');

/* GET users listing. */

/* POST users listing. */

router.post('/login', userScripts.login);
router.post('/register', userScripts.register);

router.post('/getUserFromId', md_auth.ensureAuth, userScripts.getUserFromId);
router.post('/getUserFromUsername', md_auth.ensureAuth, userScripts.getUserFromUsername);
router.post('/getNumberTokens', md_auth.ensureAuth, userScripts.getNumberTokens);
router.post('/editUser', md_auth.ensureAuth, userScripts.editUser);
router.post('/editFavouriteSummoner', md_auth.ensureAuth, userScripts.editFavouriteSummoner);

router.post('/search', md_auth.ensureAuth, userScripts.searchUser);

router.post('/friends/add', md_auth.ensureAuth, userScripts.addFriend);
router.post('/friends/delete', md_auth.ensureAuth, userScripts.deleteFriend);

router.post('/buyTokensPassTokens', md_auth.ensureAuth, userScripts.buyTokensPassTokens);
router.post('/sellTokensPassEthers', md_auth.ensureAuth, userScripts.sellTokensPassEthers);

module.exports = router;
