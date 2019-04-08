let express = require('express');
let router = express.Router();

let betScripts = require('../controllers/betScript');

/* GET users listing. */

/* POST users listing. */
router.post('/create', betScripts.createBet);

router.post('/search', betScripts.searchBet);

module.exports = router;
