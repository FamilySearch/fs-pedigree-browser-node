var express = require('express');
var router = express.Router();
var fsSession = require('../middleware/fs-session');
var restError = require('../lib/rest-error');
var async = require('async');


router.get('/', fsSession, function(req, res){
  res.redirect('/pedigree/' + req.session.user.personId);
});

router.get('/:personId', fsSession, function(req, res, next) {
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
    
    children: function(callback){
      fs.get(`/platform/tree/persons/${personId}/children`, function(error, response){
        if(error || response.statusCode >= 400){
          return callback(error || restError(response));
        }
        callback(null, response.data ? response.data.persons : []);
      });
    },
    
    portraits: function(ancestry, children, autoCallback){
      var q = async.queue(function(person, queueCallback){
        fs.get('/platform/tree/persons/' + person.id + '/portrait', function(error, response){
          // don't handle errors here because missing the portrait is not fatal
          if(response && response.headers.location){
            person.display.portrait = response.headers.location;
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
      q.push(children);
    }
    
  }, function(error, results){
    if(error){
      next(error);
    } else {
      res.render('pedigree', results);
    }
  });
});

module.exports = router;
