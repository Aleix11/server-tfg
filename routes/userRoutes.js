let express = require('express');
let router = express.Router();

let userScripts = require('../controllers/userScript');

/* GET users listing. */

/* POST users listing. */
router.post('/login', userScripts.login);
router.post('/register', userScripts.register);

router.post('/search', userScripts.searchUser);

module.exports = router;
