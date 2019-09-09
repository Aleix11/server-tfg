let express = require('express');
let router = express.Router();

let betScripts = require('../controllers/betScript');
let md_auth = require('../controllers/middlewares/authenticated');

/* GET users listing. */

/* POST users listing. */


router.post('/create', md_auth.ensureAuth, betScripts.createBet);
router.post('/accept', md_auth.ensureAuth, betScripts.acceptBet);
router.post('/closeFromPending', md_auth.ensureAuth, betScripts.closeFromPending);
router.post('/search', md_auth.ensureAuth, betScripts.searchBet);
router.post('/pendingBets', md_auth.ensureAuth, betScripts.getPendingBets);
router.post('/getBet', md_auth.ensureAuth, betScripts.getBet);
router.post('/getBetsFromUser', md_auth.ensureAuth, betScripts.getBetsFromUser);
router.post('/getBetsPendingFromUser', md_auth.ensureAuth, betScripts.getBetsPendingFromUser);
router.post('/getBetsOpenFromUser', md_auth.ensureAuth, betScripts.getBetsOpenFromUser);

router.post('/tokens/transfer', md_auth.ensureAuth, betScripts.transferTokens);
router.post('/tokens/getFromAddress', md_auth.ensureAuth, betScripts.getTokensFromAddress);

module.exports = router;
