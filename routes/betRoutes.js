let express = require('express');
let router = express.Router();

let betScripts = require('../controllers/betScript');

/* GET users listing. */

/* POST users listing. */
router.post('/create', betScripts.createBet);
router.post('/accept', betScripts.acceptBet);
router.post('/closeFromPending', betScripts.closeFromPending);
router.post('/search', betScripts.searchBet);
router.post('/pendingBets', betScripts.getPendingBets);
router.post('/getBet', betScripts.getBet);
router.post('/getBetsFromUser', betScripts.getBetsFromUser);
router.post('/getBetsPendingFromUser', betScripts.getBetsPendingFromUser);
router.post('/getBetsOpenFromUser', betScripts.getBetsOpenFromUser);

router.post('/tokens/transfer', betScripts.transferTokens);
router.post('/tokens/getFromAddress', betScripts.getTokensFromAddress);

module.exports = router;
