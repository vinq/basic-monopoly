db = new function() {
  'use strict';

  var testdb1 = new PouchDB('testdb1');

  // checks if var exists
  this.exist = function(key, cb){
    this.getKeys(function(err, doc){
      if (doc && doc.rows.length > 0) {
        for(var row of doc.rows){
          if (row.key == key){
            cb(true);
          }
        }
        cb(false);
      }
      cb(false);
    })
  }

  // sets var
  this.set = function(key, value, cb) {
    var self = this;
    this.exist(key, function(exist){
      if (exist) {
        self.update(key, value, cb)
      } else {
        self.put(key, value, cb);
      }
    })
  }
  
  // puts document in db
  this.put = function(key, value, cb){
    var document1 = {
      '_id': key,
      'value': value
    };
    testdb1.put(document1, function callback(err, result) {      
        if (!err) {
          console.log('Successfully posted a document!');
          cb(result);
        }
    });
  };   

  // gets document from db
  this.get = function(key, cb){
    testdb1.get(key, function(err, doc) {
      if (err) {
        cb(err);
      } else {
        cb(null, doc);
      }
    });
  }; 

  // gets all keys from special db
  this.getKeys = function(cb){
    testdb1.allDocs({}, function(err, docs) {
      if (err) {
        cb(err);
      } else {
        cb(null, docs);
      }
    });
  }; 

  // updates var
  this.update = function(key, value, cb){
    testdb1.get(key, function(err, doc) {
      var doc = {
        value: value,
        _id: key, 
        _rev: doc._rev
      };
      testdb1.put(doc, function(err, response) {
        if(err) {
          cb(null)
        } else {
          cb(response)
        }
      });
    });
  };  
};