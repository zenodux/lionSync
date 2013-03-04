
var server = "http://lionSync.the-carlos.net:1337";
//=====db name here=====
var dbName = 'lionSyncDb';
//=====connect to DB=====
try{
  persistence.store.websql.config(persistence, dbName, 'Lion Local DB', 5 * 1024 * 1024);
  console.log("Your browser supports WebSQL.");
}
catch(e){
  persistence.store.memory.config(persistence);
  console.log("Your browser does not supports WebSQL. We are using an in-memory DB and serialzing JSON to localStorage.");
  try{
    persistence.loadFromLocalStorage(function() {
      console.log("Data loaded from localStorage");
    });
  }
  catch(e){
    console.log("Data *not* loaded from localStorage. There probably is no data. " + e);
  }
}
var Village = persistence.define('Village', {
name: "TEXT",
district: "TEXT",
population: "INT",
numBasicLatrines: "INT",
numImprvLatrines: "INT",
numFuncWPs: "INT",
numNonFuncWPs: "INT",
_lastChange: "BIGINT"
});
//Village.hasMany('id',WaterPoint,'waterpoints');
//Village.hasMany('id',Latrine,'latrines');
//Village.hasOne('id',Point,'point');
//Village.hasOne('id',Trad,'trad');
//Village.hasOne('id',District,'district');

//village has many waterpoints
//village has many latrines
//village has one point
//village has one trad
//village has one district

//sync schema
persistence.schemaSync();
Village.enableSync( 'http://lionSync.the-carlos.net:1337/sync/Village');
persistence.flush();

function mySuccess(){
  console.log("sync success!");
}

function myFail(){
  console.log("sync failure!");
}

function myConflict(conflict){
  console.log("sync confict! " + conflict);
}

function preferLocalConflictHandler(conflicts, updatesToPush, callback) {
  console.log("sync confict! " + conflicts);
  conflicts.forEach(function(conflict) {
      var update = {id: conflict.local.id};
      conflict.properties.forEach(function(p) {
          update[p] = conflict.local._data[p];
        });
      updatesToPush.push(update);
    });
  callback();
}

function preferRemoteConflictHandler(conflicts, updatesToPush, callback) {
  conflicts.forEach(function(conflicts) {
      conflict.properties.forEach(function(p) {
          conflict.local[p] = conflict.remote[p];
        });
    });
  persistence.flush(callback);
}

function dummyConflictHandler(conflicts, updatesToPush, callback) {
  persistence.flush(callback);
}

Village.syncAll(preferLocalConflictHandler, mySuccess, myFail );

initialize();