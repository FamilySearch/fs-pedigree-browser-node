var express = require('express');
var router = express.Router();
var fsSession = require('../middleware/fs-session');
var restError = require('../lib/rest-error');

router.get('/', fsSession, function(req, res, next) {
  var url = '/platform/tree/ancestry?generations=2&person=' + req.session.user.personId;
  req.fs.get(url, function(error, ancestryResponse){
    if(error || ancestryResponse.statusCode !== 200){
      return next(error || restError(ancestryResponse));
    }
    var ancestry = {};
    ancestryResponse.data.persons.forEach(function(person){
      ancestry[person.display.ascendancyNumber] = person;
    });
    res.render('pedigree', {
      ancestry: ancestry
    });
  });
});

module.exports = router;
