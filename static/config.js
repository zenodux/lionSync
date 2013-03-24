var port = 80;
var server = "http://lionSync.the-carlos.net:" + port;
//=====db name here=====
var dbName = 'newLionSyncDb';
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
      
      persistence.flushHooks = 
        persistence.saveToLocalStorage(function() {
          console.log("saved flush to localStorage.");
        });

      persistence.schemaSyncHooks = 
        persistence.saveToLocalStorage(function() {
          console.log("saved schemaSync to localStorage.");
        });      

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

//entity for district (name, population, boundaries)
var District = persistence.define('District',{
  name: "TEXT",
  population:"INT",
  boundary:"TEXT",
  _lastChange: "BIGINT"  
});

//sync schema
persistence.schemaSync();
Village.enableSync( 'http://lionSync.the-carlos.net:' + port + '/sync/Village');
District.enableSync( 'http://lionSync.the-carlos.net:' + port + '/sync/District');
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




//NEW SYNCING CODE

function districtSyncSuccess() {
	
	console.log('Successfully synced district with server.');
	document.districtSynced = true;
	if (document.villageSynced == true && document.districtSynced == true) {
		updateSyncStatus('finished');
		localStorage.syncedOnce = true;
		document.firstSync = true;
	}
}

function villageSyncSuccess() {
	
	console.log('Successfully synced village with server.');
	document.villageSynced = true;
	if (document.villageSynced == true && document.districtSynced == true) {
		updateSyncStatus('finished');
		localStorage.syncedOnce = true;
		document.firstSync = true;
	}
}

function syncFailure() {
	//check if LIONSync has ever been synced
	if (localStorage.syncedOnce == true) {
		//update icon on data page to show it's done syncing
		updateSyncStatus('failed');
	}
	else {
		updateSyncStatus('failed');
		showPage('syncFailure');
		console.log('Failed to sync with server and no local resources.');
	}
}

function syncVillage() {
	document.villageSynced = false;
	updateSyncStatus('started');
	Village.syncAll(preferLocalConflictHandler, villageSyncSuccess, syncFailure );
}
	
function syncDistrict() {
	document.districtSynced = false;
	updateSyncStatus('started');
	District.syncAll(preferLocalConflictHandler,districtSyncSuccess,syncFailure);
}





//




//start
window.addEventListener('load', function(e) {
  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      // Swap it in and reload the page to get the new hotness.
      window.applicationCache.swapCache();
      window.location.reload();
    }
  }, false);
}, false);







/*window.addEventListener("DOMContentLoaded", function() {
        // document.getElementById('villageForm').addEventListener('submit', function(e) {
        //     e.preventDefault();
        //     console.log("villageForm fired!");
        //     addVillage();
        //     this.reset();
        //     document.getElementById('villageName').focus();
        //     return false;
        // });

        // var QRdiv = document.createElement("div");
        // QRdiv.setAttribute("id", "QRdiv");
        // document.body.appendChild(QRdiv);
        jQuery('#QRdiv').qrcode("http://lionSync.the-carlos.net:" + port);
        initialize();
}, false);*/
//end
//initialize(); //belay that commmand, Captain! 