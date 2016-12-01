var express = require('express');
var router = express.Router();
var fsSession = require('../middleware/fsSession');

/* GET home page. */
router.get('/', fsSession, function(req, res, next) {
  res.render('pedigree');
});

module.exports = router;
