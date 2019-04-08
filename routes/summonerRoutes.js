let express = require('express');
let router = express.Router();

let summonerScripts = require('../controllers/summonerScript');

/* GET users listing. */


/* POST users listing. */
router.post('/searchSummoner', summonerScripts.searchSummonerBet);


module.exports = router;
