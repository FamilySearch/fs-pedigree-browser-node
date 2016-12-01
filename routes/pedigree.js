var express = require('express');
var router = express.Router();
var fsSession = require('../middleware/fs-session');
var restError = require('../lib/rest-error');
var async = require('async');

function pedigreeHandler(req, res, next) {
  var fs = req.fs,
      personId = req.params.personId || req.session.user.personId;
  
  async.autoInject({
    
    ancestry: function(callback){
      fs.get('/platform/tree/ancestry?generations=2&person=' + personId, function(error, response){
        if(error || response.statusCode !== 200){
          return callback(error || restError(response));
        }
        var ancestry = {};
        response.data.persons.forEach(function(person){
          ancestry[person.display.ascendancyNumber] = person;
        });
        callback(null, ancestry);
      });
    },
    
    portraits: function(ancestry, autoCallback){
      var q = async.queue(function(person, queueCallback){
        fs.get('/platform/tree/persons/' + person.id + '/portrait', function(error, response){
          // don't handle errors here because missing the portrait is not fatal
          if(response && response.headers.location){
            person.display.portrait = response.headers.location;
          } else {
            console.log(error || response);
          }
          queueCallback();
        });
      });
      q.drain = function(){
        autoCallback();
      };
      for(var a in ancestry){
        q.push(ancestry[a]);
      }
    }
    
  }, function(error, results){
    if(error){
      next(error);
    } else {
      res.render('pedigree', results);
    }
  });
}

router.get('/', fsSession, pedigreeHandler);
router.get('/:personId', fsSession, pedigreeHandler);

module.exports = router;
