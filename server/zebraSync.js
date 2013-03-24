//Copyright 2012-2013 Carlos T. Linares & Owen Scott.  All rights reserved.  
//We plan to release our code under an open source license, probably GPL v3.
var repl = require("repl");

var port = process.argv[2];

var nodeUserGid = "ec2-user";
var nodeUserUid = "ec2-user";
 
var sys = require('sys');
var express = require('express');

var persistence = require('persistencejs/persistence').persistence;
var persistenceStore = require('persistencejs/persistence.store.sqlite3');
var persistenceSync = require('persistencejs/persistence.sync.server');

//var repl = require("repl");
var mime = require('mime');
//var mdns = require('mdns');

var url = require("url");


// Database configuration


var dbPath = './sqlite_zebraSync.db';
//console.log(dbPath);
persistenceStore.config(persistence, dbPath);

mime.define({
    'text/cache-manifest': ['.appcache']
});

// function generateVillageDummyData(session) {
//   var d = new Date();
//   var p = new village(session, {name: "ivy city", population: "10000", numLatrines: "20", _lastChange: d.value });
//   session.add(p);
//   session.flush();
// }

// Switch off query logging:
//persistence.db.log = false;

function log(o) {
  sys.print(sys.inspect(o) + "\n");
}

persistenceSync.config(persistence);

//Village

//var Village;
var session = persistenceStore.getSession();

// session.transaction(function(tx){
//   Village = persistence.define('Village', {
//   name: "TEXT",
//   population: "INT",
//   numLatrines: "INT",
//   _lastChange: "BIGINT"
//   });
//   session.schemaSync(tx, function(tx){ 
//     Village.enableSync(tx, function(tx){
//       var p = new Village(session, {name: "haswell city", population: "10000", numLatrines: "20"});
//       session.add(p);
//       persistence.flush(tx);
//     });  
//   });
// });
// session.close();
var entities = new Object();

session.transaction(function(tx){
  entities["Village"] = persistence.define('Village', {
    name: "TEXT",
    district: "TEXT",
    population: "INT",
    numBasicLatrines: "INT",
    numImprvLatrines: "INT",
    numFuncWPs: "INT",
    numNonFuncWPs: "INT",
    _lastChange: "BIGINT"
  });
  entities["District"] = persistence.define('District',{
    name: "TEXT",
    population:"INT",
    boundary:"TEXT",
    _lastChange: "BIGINT"  
  });
  session.schemaSync(tx, function(tx){ 
    entities["Village"].enableSync(tx, function(tx){
      persistence.flush(tx);
    });  
    entities["District"].enableSync(tx, function(tx){
      persistence.flush(tx);
    });  
  });  
});
session.close();

//End Village


var app = express(
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
app.use(express.bodyParser());

// Actions

app.use(express.static('../static'));


app.get('/sync/*',  function(req, res) {
    //console.log("req query is " + req.query + " and req.entity is " + req.query.entity);
    var url_parts = url.parse(req.url, true);
    var entity = url_parts.pathname;
    entity = entity.match("[a-zA-Z0-9]*$");
    console.log("\n===========GET entity is " + entity + " from " + req.ip);
    var session = persistenceStore.getSession();
    session.transaction(function(tx){
        persistenceSync.pushUpdates(session, tx, entities[entity], req.query.since, function(updates) {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(updates);
        });
    });
});

app.post('/sync/*',  function(req, res) {
    var url_parts = url.parse(req.url, true);
    var entity = url_parts.pathname;
    entity = entity.match("[a-zA-Z0-9]*$");
    console.log("\n===========POST entity is " + entity + " from " + req.ip);

    var session = persistenceStore.getSession();
    session.transaction(function(tx){
        //console.log('updates (req.body): ' + req);
        // repl.start({
        //     prompt: "zebraSync > ",
        //     input: process.stdin,
        //     output: process.stdout
        // }).context.req=req;
        persistenceSync.receiveUpdates(session, tx, entities[entity], req.body, function(result) {
            res.header("Access-Control-Allow-Origin", "*");
            res.send(result);
        });
    });
});

app.listen(port, function() {
  if (process.getgid && process.setgid) {
    console.log('Current gid: ' + process.getgid());
    try {
      process.setgid(nodeUserGid);
      console.log('New gid: ' + process.getgid());
    }
    catch (err) {
      console.log('Failed to set gid: ' + err);
    }
  }
  if (process.getuid && process.setuid) {
    console.log('Current uid: ' + process.getuid());
    try {
      process.setuid(nodeUserUid);
      console.log('New uid: ' + process.getuid());
    }
    catch (err) {
      console.log('Failed to set uid: ' + err);
    }
  }
  console.log('lionSync Server running at http://lionSync.the-carlos.net:' + port +' with uid:' + process.getgid() +' and gid:' + process.getgid());
});



// advertise a http server on port 1337
//var ad = mdns.createAdvertisement(mdns.tcp('http'), 1337, {name: 'zebraSync'});
//ad.start();

//console.log('lionSync Server running at http://lionSync.the-carlos.net:' + port);
//console.log(app.routes);
//console.log(app.routes.get[0].callbacks[0]);
