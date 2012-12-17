var sys = require('sys');
var connect = require('connect');
var express = require('express');

var persistence = require('persistencejs/persistence').persistence;
var persistenceStore = require('persistencejs/persistence.store.sqlite3');
var persistenceSync = require('persistencejs/persistence.sync.server');

// Database configuration
//persistenceStore.config(persistence, 'localhost', 3306, 'synctest', 'test', 'test');

var dbPath = './sqlite_zebraSync.db';
console.log(dbPath);
persistenceStore.config(persistence, dbPath);


function generateVillageDummyData(session) {
  var d = new Date();
  var p = new village(session, {name: "ivy city", population: "10000", numLatrines: "20", dateMod: d.value });
  session.add(p);
  session.flush();
}

// Switch off query logging:
//persistence.db.log = false;

function log(o) {
  sys.print(sys.inspect(o) + "\n");
}

persistenceSync.config(persistence);



//Village

var village;


var session = persistenceStore.getSession();
session.transaction(function(tx){
  village = persistence.define('village', {
  name: "TEXT",
  population: "INT",
  numLatrines: "INT",
  datMod: "DATE"
  },function(tx) { 
    village.enableSync(function(tx){ 
      session.schemaSync(tx, function() {
        generateVillageDummyData(session);
        session.flush(tx);
      });
    });
  });
});
persistenceSync.config(session);
session.close();


// session.transaction(function(tx){
//   village = persistence.define('village', {
//   name: "TEXT",
//   population: "INT",
//   numLatrines: "INT",
//   datMod: "DATE"
//   });
//   village.enableSync();
//   session.flush(tx);
//   session.schemaSync(tx, function() {
//     generateVillageDummyData(session);
    
//     session.flush(tx);
//   });
// });


//persistence.schemaSync();
//village.enableSync();
//persistence.flush();

//End Village


var app = express(
  connect.logger(), 
  connect.bodyParser(), 
  //connect.staticCache('../browser'),
  function(req, res, next) {
    var end = res.end;

    req.conn = persistenceStore.getSession();
    res.end = function() {
      req.conn.close();
      end.apply(res, arguments);
    };
    req.conn.transaction(function(tx) {
        req.tx = tx;
        next();
      });
  }
);


// Actions
app.get('/reset', function(req, res) {
  req.conn.reset(req.tx, function() {
      req.conn.schemaSync(req.tx, function() {
          generateVillageDummyData(req.conn);
          req.conn.flush(req.tx, function() {
              res.send({status: "ok"});
            });
        });
    });
});

//Village

// app.get('/villageSync',  function(req, res) {
//     console.log('villageSync GET from ' + req.conn);
//     persistenceSync.pushUpdates(req.conn, req.tx, village, req.query.since, function(updates) {
//         //res.header("Access-Control-Allow-Origin", "*");
//         res.send(updates);
//     });
// });

app.get('/villageSync',  function(req, res) {
    console.log('villageSync GET from ' + req.conn);
    persistenceSync.pushUpdates(req.conn, req.tx, village, req.query.since, function(updates) {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(updates);
    });
});

app.post('/villageSync',  function(req, res) {
    console.log('villageSync POST from ' + req.conn);
    persistenceSync.receiveUpdates(persistenceStore.getSession(), req.tx, village, req.body, function(result) {
        res.header("Access-Control-Allow-Origin", "*");
        res.send(result);
    });
});

//End Village

app.get('/markAllDone', function(req, res) {
    Task.all(req.conn).list(req.tx, function(tasks) {
        tasks.forEach(function(task) {
            task.done = true;
          });
        req.conn.flush(req.tx, function() {
            res.send({status: 'ok'});
          });
      });
});

app.get('/markAllUndone', function(req, res) {
    Task.all(req.conn).list(req.tx, function(tasks) {
        tasks.forEach(function(task) {
            task.done = false;
          });
        req.conn.flush(req.tx, function() {
            res.send({status: 'ok'});
          });
      });
});

app.listen(1337);

console.log('zebraSync Basic Server running at http://127.0.0.1:1337/');
