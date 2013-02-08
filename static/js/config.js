//define db name here
var dbName = 'lion';

//define schema in json

var schema = {
	"village":{
		"villageName":"TEXT",
		"population":"INT",
		"numLatrines":"INT",
		"_lastChange":"BIGINT"},
	"waterpoint":{
		"pumpType":"TEXT",
		"installYear":"INT",
		"_lastChange":"BIGINT"}
};

//initialize store

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

//create tables from schema

var tables = {};
for (t in schema) {
	tables[t] = persistence.define(t,schema[t]);
	console.log ("creating table " + t + " with fields " + JSON.stringify(schema[t]));
	
}

persistence.schemaSync();


