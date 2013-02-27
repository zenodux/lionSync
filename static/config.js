
//var server = "http://opendev.the-carlos.net:1337"


//=====db name here=====
var dbName = 'testDb';


//=====connect to DB=====

try{
  persistence.store.websql.config(persistence, dbName, 'Lion Local DB', 5 * 1024 * 1024);
  console.log("Your browser supports WebSQL.")
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
    console.log("Data *not* loaded from localStorage. There probably is no data. " + e)
  }
}



//=====create new entity model for use in this example=====

var Task = persistence.define('Task', {
  name: "TEXT",
  description: "TEXT",
  done: "BOOL"
});

//sync schema
persistence.schemaSync();


//OLD config.js INCLUDED BELOW

/*
var village = persistence.define('village', {
  name: "TEXT",
  population: "INT",
  numLatrines: "INT",
  _lastChange: "DATE"
});
persistence.schemaSync();
village.enableSync('http://192.168.1.15:1337/sync?entity=village');


village = persistence.define('village', {
  name: "TEXT",
  population: "INT",
  numLatrines: "INT",
  _lastChange: "BIGINT"
  });*/