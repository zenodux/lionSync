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
	this.rootElement = $('<div></div>');
	this.element = function() {
		return this.rootElement;
	}
}


//END OF OBJECT LIBRARY

//CUSTOM OBJECTS FOR THIS UI

//class for creating a set of text boxes embedded in a table row
function SanVillage(persistenceEntity,recordId) {
	LionDiv.call(this,persistenceEntity,recordId);
	var f = new LionField(persistenceEntity,recordId,'name');
	var t = new LionTextBox(f,new LionFormat());
	this.rootElement.append(t.element())//.append($('</br>'));
} 
SanVillage.prototype = clone(LionDiv.prototype);
SanVillage.prototype.constructor = SanVillage.prototype;





//EXAMPLE IMPLEMENTATION
//




//create a dummy record
var test = new Task();
test.name = "Carlos	";
persistence.add(test);
persistence.flush();

//function creates 

function initialize() {
	
	
	Task.all().list(function(tasks){
		tasks.forEach(function(task){
			var v = new SanVillage(Task,task.id);
			$('#test').append(v.element());
		});
	});
	
	
	
	
	
	
	
	
	
	
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
}

