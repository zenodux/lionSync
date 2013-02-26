
var server = "http://opendev.the-carlos.net:1337"


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
  });