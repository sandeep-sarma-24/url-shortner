const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { redirect } = require('../controllers/redirectController');


router.post('/shorten', urlController.shortenUrl);
router.get('/:shortUrlId', redirect);


module.exports = router;
