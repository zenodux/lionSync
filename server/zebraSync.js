var sys = require('sys');
var connect = require('connect');
var express = require('express');

var persistence = require('./persistencejs/persistence').persistence;
var persistenceStore = require('./persistencejs/persistence.store.sqlite3');
var persistenceSync = require('./persistencejs/persistence.sync.server');

// Database configuration
//persistenceStore.config(persistence, 'localhost', 3306, 'synctest', 'test', 'test');

var dbPath = __dirname + '/sqlite_zebraSync.db';
persistenceStore.config(persistence, dbPath);

// Switch off query logging:
//persistence.db.log = false;

function log(o) {
  sys.print(sys.inspect(o) + "\n");
}

persistenceSync.config(persistence);

// Data model
var Project = persistence.define('Project', {
    name: "TEXT"
  });

var Task = persistence.define('Task', {
    name: "TEXT",
    done: "BOOL"
  });

var Tag = persistence.define('Tag', {
    name: "TEXT"
  });

Task.hasMany('tags', Tag, 'tasks');
Tag.hasMany('tasks', Task, 'tags');

Project.hasMany('tasks', Task, 'project');

Project.enableSync();
Task.enableSync();
Tag.enableSync();

//Village

var village = persistence.define('village', {
  name: "TEXT",
  population: "INT",
  numLatrines: "INT",
  datMod: "DATE"
});
//persistence.schemaSync();
village.enableSync();
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

function generateDummyData(session) {
  var p = new Project(session, {name: "Main project"});
  session.add(p);
  for(var i = 0; i < 25; i++) {
    var t = new Task(session, {name: "Task " + i, done: false});
    p.tasks.add(t);
  }
}

//Village

function generateDummyData(session) {
  var d = new Date();
  var p = new village(session, {name: "ivy city", population: "10000", numLatrines: "20", dateMod: d.value });
  session.add(p);
}

//End Village


// Actions
app.get('/reset', function(req, res) {
  req.conn.reset(req.tx, function() {
      req.conn.schemaSync(req.tx, function() {
          generateDummyData(req.conn);
          req.conn.flush(req.tx, function() {
              res.send({status: "ok"});
            });
        });
    });
});

app.get('/projectUpdates',  function(req, res) {
    persistenceSync.pushUpdates(req.conn, req.tx, Project, req.query.since, function(updates) {
        res.send(updates);
      });
});

app.post('/projectUpdates',  function(req, res) {
    persistenceSync.receiveUpdates(req.conn, req.tx, Project, req.body, function(result) {
        res.send(result);
      });
  });

app.get('/taskUpdates',  function(req, res) {
    persistenceSync.pushUpdates(req.conn, req.tx, Task, req.query.since, function(updates) {
        res.send(updates);
      });
});

app.post('/taskUpdates',  function(req, res) {
    persistenceSync.receiveUpdates(req.conn, req.tx, Task, req.body, function(result) {
        res.send(result);
      });
  });

app.get('/tagUpdates',  function(req, res) {
    persistenceSync.pushUpdates(req.conn, req.tx, Tag, req.query.since, function(updates) {
        res.send(updates);
      });
});

app.post('/tagUpdates',  function(req, res) {
    persistenceSync.receiveUpdates(req.conn, req.tx, Tag, req.body, function(result) {
        res.send(result);
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
        //res.header("Access-Control-Allow-Origin", "*");
        res.send(updates);
    });
});

app.post('/villageSync',  function(req, res) {
    console.log('villageSync POST from ' + req.conn);
    persistenceSync.receiveUpdates(persistenceStore.getSession(), req.tx, village, req.body, function(result) {
        //res.header("Access-Control-Allow-Origin", "*");
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

console.log('zebraSync Server running at http://127.0.0.1:1337/');
