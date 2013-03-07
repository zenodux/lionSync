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
