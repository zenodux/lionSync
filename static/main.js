//=====READ ME=====
//this script starts with a new object libary for creating auto-syncing input elements (e.g. text boxes, select boxes, etc.). you can ignore the first section, all you need to know is that it allows you to do things like "var t = new LionTextBox(lionField,lionFormat)" where lionField is an object containing the information needed to figure out which exact table, record, and field the text box should be linked to (e.g. Table: Village, Record: 6, Field: Name) and lionFormat is an object that passes along some details on how the input element should be formatted
//lines 129-145 are where all the good stuff are. they create a dummy record (using a demo schema defined in config.js) and then link a new text box to one of the fields in that record. when you change the text box, the field should update automatically. run the program a bunch of times nad you'll generate some example data that you can play with.



// to do
	// - replace style with class
	// - set up an object to contain and create a bunch of UI elements in a div



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

//END CODE FROM CONFIG.JS

//update the village display table
updateVillageDisplay();
$('#editRow').append($('<button>Add Village</button>').attr('onclick','createRecord()').attr('id','btnNewRecord'));

//var test = new Village();
//test.name = "Owen";
//persistence.add(test);
//persistence.flush();


//$('#displayTable').append(new VillageDisplayRow(Village,test.id).element());
/*
var test = new Latrine();
var type = new LatrineType();
type.type = "Carlos";
Latrine.all().prefetch('type').add(type);
//test.type.add(type);
/*Task.all().list(function(tasks){
	tasks.forEach(function(task){
		var v = new SanVillage(Task,task.id);
		$('#test').append(v.element());
	});
});*/

/*
Latrine.all().prefetch('type').list(function(villages){
	villages.forEach(function(village){
		var v = new SanVillage(Village,village.id);
		$('#test').append(v.element());
	});
});

/*
Village.all().count( function(cnt) {
	if (cnt >0) {
		Village.all().list(function(villages) {
			villages.forEach(function(village) {
				//var v = 
				$('#test').append(new SanVillage(Village,village.id).element());
			});
		});
		//alert(cnt);
	}
});

$('#test').attr('id','new_vilage').append($('<button>Test</button>')).click(function() {});

*/






//ignore everything below this for now



/*

var format = new LionFormat();
$('#test').append($('<table></table>').attr('id','testtable').append($('<tr></tr>').attr('id','testrow')));

testCase = 'select';

var selectOptions = [{text:'six',value:6},{text:'seven',value:7}];

Task.all().list(function(tasks){
	tasks.forEach(function(task){
		var tempField = new LionField(Task,task.id,'name');
		if (testCase == 'select') {
			//var temp = new LionSelect(tempField,format,selectOptions);
			var temp = new LionSelect(tempField,format,tempField);
			$('#test').append(temp.element());
			$('#test').append('</br>');
			
		}
		else if (testCase == 'text') {
			var temp = new LionTextBox(tempField,format);
			$('#test').append(temp.element());
			$('#test').append('</br>');
		}
		else if (testCase == 'table') {
			var temp = new LionTableCell(tempField,format);
			$('#testrow').append(temp.element());
		}				

	});
});
*/


//general inheritance method
function clone(object) {
	function ObjectConstructor() {
		ObjectConstructor.prototype = object;
	}
	return new ObjectConstructor();
}

//OBJECT LIBRARY FOR CREATING PERSISTENCE USER INTERFACES

//object class for passing identifying properties of individual fields to input objects
function LionField (persistenceEntity, recordId, fieldName) {
	this.persistenceEntity = persistenceEntity;
	this.recordId = recordId;
	this.fieldName = fieldName;
	this.elementId = recordId + "-" + fieldName;
}

//object class for passing basic formatting to elements
function LionFormat () {
	this.font = 10;
	this.width = 900;
	this.height = 20;
}

//parent class for all input element classes
function LionElement (lionfield, lionformat) {
	this.element = function() {
		//give element a unique id (concatenation of record id and field name)
		e = this.rootElement.attr('id',lionfield.elementId)
		//give element a change function that automatically updates the db whenever the element is changed
		e.change(function() {
			lionfield.persistenceEntity.load(lionfield.recordId,function(record) {
				record[lionfield.fieldName] = document.getElementById(lionfield.elementId).value;
				persistence.flush();
			})
		});
		//give element a function that automatically populates it with a value based on its record value in the db 
		//e.show(function() {
		//	document.getElementById(lionfield.elementId).value = 7;
		//});
		e.show(function() {
			lionfield.persistenceEntity.load(lionfield.recordId,function(record) {
				if (!document.getElementById(lionfield.elementId).innerHTML) {document.getElementById(lionfield.elementId).innerHTML = record[lionfield.fieldName];}
				document.getElementById(lionfield.elementId).value = record[lionfield.fieldName];
			});
		});
		//apply formatting
		e.width(lionformat.width);
		//return element
		return e;
	}
}

//class for a text box input element (child of LionElement)
function LionTextBox(lionfield,lionformat) {
	LionElement.call(this,lionfield,lionformat);
	this.rootElement = $('<input></input>').attr('type','text');
}
LionTextBox.prototype = clone(LionElement.prototype);
LionTextBox.prototype.constructor = LionTextBox;

//class for a select element (child of LionElement)
//liondomain should be a lionfield object but can also be an array
//in the format [{text:t,value:v},{...}]
function LionSelect(lionfield,lionformat,liondomain) {
	LionElement.call(this,lionfield,lionformat);
	this.rootElement = $('<select></select>');
	//check if an array
	if (liondomain instanceof Array) {
		for (o in liondomain) {
			this.rootElement.append(
				$('<option></option>').html(liondomain[o].text).attr('value',liondomain[o].value)
			);
		}
	}
	else {
		/*this.rootElement.show(function() {
			lionfield.persistenceEntity.load(lionfield.recordId,function(record) {
				
			});
		});*/
		fieldname = liondomain.fieldName;
		liondomain.persistenceEntity.all().list( 
			
			function(list,fieldName) {
				$('#'+lionfield.elementId).append($('<option></option>'));
				for (l in list) {
					$('#'+lionfield.elementId).append(
						
						$('<option></option>').html(list[l][fieldname]).attr('value',list[l].id)
					)
				}
				$('#'+lionfield.elementId).hide();
				$('#'+lionfield.elementId).show();

				
			});
	}
	//this.rootElement.val(7);
}
LionSelect.prototype = clone(LionElement.prototype);
LionSelect.prototype.constructor = LionSelect;


//class for creating the domain of a LionSelect object
//takes a lionfield by default but can also send it an array in the format [{text:t,value:v},{...}]
function LionDomain(lionfield) {
	//check if sent an array
	if (lionfield instanceof Array) {
	
	}
	else {
	
	}
}

//class for creating table cells (child of LionElement)
function LionTableCell(lionfield,lionformat) {
	LionElement.call(this,lionfield,lionformat);
	this.rootElement = $('<td></td>');
}
LionTableCell.prototype = clone(LionElement.prototype);
LionTableCell.prototype.constructor = LionTableCell;

//class for creating a div containing numerous elements
function LionDiv(persistenceEntity, recordId) {
	this.rootElement = $('<div></div>').attr('id',recordId + '-div');
	this.element = function() {
		return this.rootElement;
	}
}


//END OF OBJECT LIBRARY

//CUSTOM OBJECTS FOR THIS UI

//class for creating a set of text boxes embedded in a table row
function SanVillage(persistenceEntity,recordId) {
	LionDiv.call(this,persistenceEntity,recordId);
	//var table = $('<table></table>');
	//var row = $('<tr></tr>');
	//row = row.append($('<td></td>').append($('<p>Village Name</p>')).append(new LionTextBox(new //LionField(persistenceEntity,recordId,'name'),new LionFormat).element()));
	//row = row.append($('<td></td>').append($('<p>Village Population</p>')).append(new LionTextBox(new LionField(persistenceEntity,recordId,'population'),new LionFormat).element()));
	//table.append(row);
	//this.rootElement.append(table);
	var f = new LionField(persistenceEntity,recordId,'name');
	var t = new LionTextBox(f,new LionFormat());
	this.rootElement.append('<p>Name</p>')
	this.rootElement.append(t.element())//.append($('</br>'));
	f = new LionField(persistenceEntity,recordId,'population');
	t = new LionTextBox(t,new LionFormat);
} 
SanVillage.prototype = clone(LionDiv.prototype);
SanVillage.prototype.constructor = SanVillage.prototype;


function VillageDisplayRow(persistenceEntity,recordId) {
	LionDiv.call(this,persistenceEntity,recordId);
	//name, population, numBasicLatrines, numImprvLatrines, numFuncWPs, numNonFuncWPs
	
	var fields = ['name','district','population','numBasicLatrines','numImprvLatrines','numFuncWPs','numNonFuncWPs'];
	var tableRow = $('<tr></tr>').attr('id',recordId + '-div');
	for (f in fields) {
		fields[f] = new LionField(persistenceEntity,recordId,fields[f]);
		tableRow.append(new LionTableCell(fields[f],new LionFormat()).element());
	}
	tableRow.append($('<td></td>').append($('<button>Edit</button>').attr('id',recordId).attr('onclick','editRecord(this.id)')));
	//resettin'g root element, rather than appending, so it returns a row, not a div
	this.rootElement = tableRow;
	
	
}
VillageDisplayRow.prototype = clone(LionDiv.prototype);
VillageDisplayRow.prototype.constructor = VillageDisplayRow.prototype;


function VillageEditDiv(persistenceEntity,recordId) {
	LionDiv.call(this,persistenceEntity,recordId);
	this.rootElement.attr('class','row-fluid');
	
	var fields = ['name','district','population','numBasicLatrines','numImprvLatrines','numFuncWPs','numNonFuncWPs'];
	
	for (f in fields) {
		this.rootElement.append('<p>'+fields[f]+'<p>')
		fields[f] = new LionField(persistenceEntity,recordId,fields[f]);
		
		this.rootElement.append(new LionTextBox(fields[f],new LionFormat()).element());
	}
	this.rootElement.append('</br>');
	this.rootElement.append($('<button>Done Editing</button>').attr('id',recordId).attr('onclick','closeEditDiv(this.id)'))
	
	
}
VillageDisplayRow.prototype = clone(LionDiv.prototype);
VillageDisplayRow.prototype.constructor = VillageDisplayRow.prototype;


//EXAMPLE IMPLEMENTATION
//




//create a dummy record

//persistence.add(test);
//persistence.flush();

//function creates 

function updateVillageDisplay() {

	Village.all().list(function(villages) {
		villages.forEach(function(village) {
			$('#displayTable').append(new VillageDisplayRow(Village,village.id).element());
		});
	});
	
}

function editRecord(recordId) {
	$('#'+recordId+'-div').remove();
	$('#editRow').append(new VillageEditDiv(Village,recordId).element());
	$('#btnNewRecord').toggle();
}

function createRecord() {
	
	var temp = new Village();
	persistence.add(temp);
	persistence.flush();
	editRecord(temp.id);
	
}

function closeEditDiv(recordId) {
	$('#' + recordId + "-div").remove();
	$('#displayTable').append(new VillageDisplayRow(Village,recordId).element());
	$('#btnNewRecord').toggle();
}


