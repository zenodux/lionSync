
//var server = "http://opendev.the-carlos.net:1337"


//=====db name here=====
var dbName = 'asdf';


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

//persistence.reset();

//=====create new entity model for use in this example=====

//*some of the demos are running off of this task, but soon take it off
/*var Task = persistence.define('Task', {
  name: "TEXT",
  description: "TEXT",
  done: "BOOL"
});*/

//entity for district (name, population, boundaries)
var District = persistence.define('District',{
	name: "TEXT",
	population:"INT",
	boundary:"TEXT"
});



/*
//entity for traditional authority (name, population, boundaries)
var Trad = persistence.define('Trad',{
	name: "TEXT",
	population:"INT",
	boundary:"TEXT"
});



//general entity for points
var LatrinePoint = persistence.define('LatrinePoint',{
	latitude: "INT",
	longitude: "INT"
});

//general entity for points
var WaterPointPoint = persistence.define('WaterPointPoint',{
	latitude: "INT",
	longitude: "INT"
});

var LatrineType = persistence.define('LatrineType', {
	type: "TEXT"
});

var WaterPointType = persistence.define('WaterPointType', {
	type: "TEXT",
	designPopulation: "INT"
})

//entity for a water point
var WaterPoint = persistence.define('WaterPoint',{
	type: "TEXT"
	
});
WaterPoint.hasOne('point',WaterPointPoint,'waterpoint');
WaterPoint.hasOne('type',WaterPointType,'waterpoint');
//WaterPoint has one point
//WaterPoint has one type

var Latrine = persistence.define('Latrine', {
	type: "TEXT"
})
Latrine.hasOne('point',LatrinePoint,'latrine');
Latrine.hasOne('type',LatrineType,'latrine');

//Latrine has one point
//Latrine has one type


*/
var Village = persistence.define('Village', {
	name: "TEXT",
	district: "TEXT",
	population: "INT",
	numBasicLatrines: "INT",
	numImprvLatrines: "INT",
	numFuncWPs: "INT",
	numNonFuncWPs: "INT",
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