//=====READ ME=====
//this script starts with a new object libary for creating auto-syncing input elements (e.g. text boxes, select boxes, etc.). you can ignore the first section, all you need to know is that it allows you to do things like "var t = new LionTextBox(lionField,lionFormat)" where lionField is an object containing the information needed to figure out which exact table, record, and field the text box should be linked to (e.g. Table: Village, Record: 6, Field: Name) and lionFormat is an object that passes along some details on how the input element should be formatted
//lines 129-145 are where all the good stuff are. they create a dummy record (using a demo schema defined in config.js) and then link a new text box to one of the fields in that record. when you change the text box, the field should update automatically. run the program a bunch of times nad you'll generate some example data that you can play with.



// to do
	// - replace style with class
	// - set up an object to contain and create a bunch of UI elements in a div

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
				$('<option></option>').html(liondomain[o].text).attr('value',liondomain[o].text) //value used to be .value
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
						
						$('<option></option>').html(list[l][fieldname]).attr('value',list[l].fieldname)
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
		if (typeof fields[f] == 'string') {
			fields[f] = new LionField(persistenceEntity,recordId,fields[f]);
			tableRow.append(new LionTableCell(fields[f],new LionFormat()).element());
		}
	}
	tableRow.append($('<td></td>').append($('<button>Edit</button>').attr('id',recordId).attr('onclick','editRecord(this.id)')));
	tableRow.append($('<td></td>').append($('<button>x</button>').attr('id',recordId).attr('onclick','deleteRecord(this.id)')));
	//resettin'g root element, rather than appending, so it returns a row, not a div
	this.rootElement = tableRow;
	
	
}
VillageDisplayRow.prototype = clone(LionDiv.prototype);
VillageDisplayRow.prototype.constructor = VillageDisplayRow.prototype;


function VillageEditDiv(persistenceEntity,recordId) {
	LionDiv.call(this,persistenceEntity,recordId);
	this.rootElement.attr('class','row-fluid');
	
	var fields = ['name','district','population','numBasicLatrines','numImprvLatrines','numFuncWPs','numNonFuncWPs'];
	var labels = ['Village Name','District','Village Population','Number of Basic Latrines','Number of Improved Latrines', 'Number of Functioning Water Points','Number of Broken Water Points'];
	this.rootElement.append('<h3>Add New Village</h3>');
	for (f in fields) {
		if (typeof fields[f] == 'string') {
			this.rootElement.append('<p>'+labels[f]+'<p>')
			if (fields[f] == 'district') {
				fields[f] = new LionField(persistenceEntity,recordId,fields[f]);
				var tempDomain = new LionField(District,'','name');
				this.rootElement.append(new LionSelect(fields[f],new LionFormat(),tempDomain).element());
			}
			else {
				fields[f] = new LionField(persistenceEntity,recordId,fields[f]);
				this.rootElement.append(new LionTextBox(fields[f],new LionFormat()).element());
			}
		}
	}
	this.rootElement.append('</br>');
	this.rootElement.append($('<button>Done</button>').attr('id',recordId).attr('onclick','closeEditDiv(this.id)')) //attr('onclick','closeEditDiv(this.id)'))
	
	
}
VillageDisplayRow.prototype = clone(LionDiv.prototype);
VillageDisplayRow.prototype.constructor = VillageDisplayRow.prototype;






function updateVillageDisplay() {

	Village.all().list(function(villages) {
		villages.forEach(function(village) {
			$('#displayTable').append(new VillageDisplayRow(Village,village.id).element());
		});
	});
	
}

function editRecord(recordId) {
	$('#'+recordId+'-div').remove();
	$('button').attr('disabled','disabled');
	//$('#editRow').append(new VillageEditDiv(Village,recordId).element());
	$('#testas').append(new VillageEditDiv(Village,recordId).element());
	$('#inputPopup').show();
	$('#btnNewRecord').toggle();
}

function deleteRecord(recordId) {
	$('#'+recordId+'-div').remove();
	Village.load(recordId,function(village) {
		persistence.remove(village);
		persistence.flush();
	});
}

function createRecord() {
	
	var temp = new Village();
	persistence.add(temp);
	persistence.flush();
	editRecord(temp.id);
	
}

function closeEditDiv(recordId) {
	$('#' + recordId + "-div").remove();
	$('#inputPopup').hide();
	//Popup.objects[0].hide();
	$('#displayTable').append(new VillageDisplayRow(Village,recordId).element());
	$('#btnNewRecord').toggle();
	$('button').removeAttr('disabled');
}

function showPage(page) {
	if (page == 'data') {
		hidePages();
		$('#dataPage').show();
		$('#dataLink').attr('class','active');
		
		
		
	}
	else if (page=='dashboard') {
		hidePages();
		$('#dashboardPage').show();
		$('#dashboardLink').attr('class','active');
		addDistrictsToMap();
		//zoomMapToExtent()
	
	}
	else if (page=='about') {
		hidePages();
		$('#aboutPage').show();
		$('#aboutLink').attr('class','active');
	
	}
	
}

function hidePages() {
	$('#dashboardPage').hide();
	$('#dataPage').hide();
	$('#aboutPage').hide();
	$('#dataLink').attr('class','');
	$('#dashboardLink').attr('class','');
	$('#aboutLink').attr('class','');
	
}

function initialize() {
	
	//add button to data page
	$('#editRow').append($('<button>Add Village</button>').attr('onclick','createRecord()').attr('id','btnNewRecord'));
	//$('#editRow').append($('<a rel="facybox">Add Village</a>').attr('href','#testas').attr('id','btnNewRecord'));
	//$('#testas')
	//add data to data table
	updateVillageDisplay();
	//create leaflet map
	createLeafletMap('mapDiv');
	//update the village display table
	showPage('data');

}

