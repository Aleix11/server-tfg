let express = require('express');
let router = express.Router();

let betScripts = require('../controllers/betScript');

/* GET users listing. */

/* POST users listing. */
router.post('/create', betScripts.createBet);
router.post('/accept', betScripts.acceptBet);
router.post('/search', betScripts.searchBet);

router.post('/tokens/transfer', betScripts.transferTokens);
router.post('/tokens/getFromAddress', betScripts.getTokensFromAddress);

module.exports = router;
