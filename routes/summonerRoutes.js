let express = require('express');
let router = express.Router();

let summonerScripts = require('../controllers/summonerScript');
let md_auth = require('../controllers/middlewares/authenticated');

/* GET users listing. */


/* POST users listing. */
router.post('/searchSummoner', md_auth.ensureAuth, summonerScripts.searchSummonerBet);
router.post('/searchSummonerInfo', md_auth.ensureAuth, summonerScripts.searchSummonerInfo);


module.exports = router;
