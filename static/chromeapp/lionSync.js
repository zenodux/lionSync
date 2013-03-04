//var db = openDatabase('lion', '1.0', 'Lion Local DB', 2 * 1024 * 1024);
try{
  persistence.store.websql.config(persistence, 'lion', 'Lion Local DB', 5 * 1024 * 1024);
  console.log("Your browser supports WebSQL.")
}
catch(e){
  persistence.store.memory.config(persistence);
  console.log("Your browser does not support WebSQL. We are using an in-memory DB and serialzing JSON to chrome.local.storage.");
  try{
    persistence.loadFromChromeLocalStorage(function() {
      console.log("Data loaded from chrome.storage.local");
    });
  }
  catch(e){
    console.log("Data *not* loaded from chrome.storage.local. There probably is no data. " + e)
  }
}

// persistence.saveToChromeLocalStorage(function() {
//   alert("All data saved!");
// });

//db.transaction(function(tx){
	//tx.executeSql('drop table village');
  //tx.executeSql('drop table district');
  //tx.executeSql('drop table groupVillageHead');
  //tx.executeSql('drop table sqlite_sequence');
  //tx.executeSql('drop table tradAuth');
	//tx.executeSql('delete from district where id = "89BBA8BE7F9C466C82E7A3F76B571268"');
//});

  ////////////
var village = persistence.define('village', {
  name: "TEXT",
  population: "INT",
  numLatrines: "INT",
  _lastChange: "DATE"
});
persistence.schemaSync();
village.enableSync('http://192.168.1.15:1337/sync?entity=village');

//var district = new District({name: "Salima",population: "350000"});
//persistence.add(district);	
//var ta = new TraditionalAuthority({name: "Ndindi"});
//persistence.add(ta);
//ta = new TraditionalAuthority({name: "Kambwiri"});
//persistence.add(ta);
//ta = new TraditionalAuthority({name: "Pemba"});
//persistence.add(ta);
persistence.flush();


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

window.addEventListener("DOMContentLoaded", function() {
        document.getElementById('villageForm').addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("villageForm fired!");
            addVillage();
            this.reset();
            document.getElementById('villageName').focus();
            return false;
        });

        var QRdiv = document.createElement("div");
        QRdiv.setAttribute("id", "QRdiv");
        // var QRimg = document.createElement("img");
        // QRimg.setAttribute("id","QRimg");
        // QRimg.setAttribute("src", 
        //   "http://chart.apis.google.com/chart?cht=qr&chs=350x350&chld=L&choe=UTF-8&chl=" + 
        //   encodeURIComponent(document.location.href) 
        // );
        // QRdiv.appendChild(QRimg);
        // document.body.appendChild(QRdiv);
        document.body.appendChild(QRdiv);
        jQuery('#QRdiv').qrcode("http://192.168.1.15:1337");
}, false);




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



function addVillage(){
  var v = new village();
  v.name = document.getElementById("villageName").value;
  v.population = document.getElementById("villagePopulation").value;
  v.numLatrines = document.getElementById("villageNumLatrines").value;
  v.datMod = new Date();
  persistence.add(v);
  persistence.flush();
}

function updateVillage(){
  var opt = document.getElementById("village");
  //var id = opt.children[opt.selectedIndex]. 
  var v = village(opt.children[opt.selectedIndex]);
  v.name = document.getElementById("villageName").value;
  v.population = document.getElementById("villagePopulation").value;
  v.latrines = document.getElementById("villageNumLatrines").value;
  v.datMod  = new Date();
  persistence.add(v);
  persistence.flush();
}


//EntityName.syncAll(conflictHandler, successCallback, errorCallback)
//successCallback and errorCallback are optional. successCallback occurs after a
//successful sync errorCallback occurs on error (I.E. a non-200 response code).


village.syncAll(preferLocalConflictHandler, mySuccess, myFail );

/////////
/////////
var ddata;
village.all().selectJSON( ['*'],function(data){
  ddata = data;
  var x=d3.scale.linear().domain([0,20000000]).range([0,1000]);
  var y=d3.scale.linear().domain([0,20000000]).range([0,200]);
  var r=d3.scale.linear().domain([0,20000000]).range([0,200]);

  var svg=d3.select("body").append("svg");
  svg.selectAll("circle").data(data).enter()
    .append("circle")
    .attr("cx",function(d) {return x(0);})
    .attr("cy",function(d) {return y(0);})
    .attr("r",function(d) {return r(0);})
    .attr("text", function(d) {return d.name;})
 
    //.style("fill",function(d) {return c(d.continent);})
    //.style("opacity",function(d) {return o(+d.GDPcap);})
 
    //.append("title")
    //.text(function(d) {return d.name;})
    
    .transition().duration(1000)
    .attr("cx",function(d) {return x(+d.population);})
    .attr("cy",function(d) {return  y(+d.numLatrines);})
    .attr("r",function(d) {return r(+d.population);})
    .append("text")
    .attr("text", function(d) {return d.name;})
});