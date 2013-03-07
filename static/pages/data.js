

//CUSTOM OBJECTS FOR THIS UI


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
	//resetting root element, rather than appending, so it returns a row, not a div
	this.rootElement = tableRow;
	
	
}
VillageDisplayRow.prototype = clone(LionDiv.prototype);
VillageDisplayRow.prototype.constructor = VillageDisplayRow.prototype;


function VillageEditDiv(persistenceEntity,recordId) {
	LionDiv.call(this,persistenceEntity,recordId);
	this.rootElement.attr('class','row-fluid');
	
	var fields = ['name','district','population','numBasicLatrines','numImprvLatrines','numFuncWPs','numNonFuncWPs'];
	var labels = ['Village Name','District','Village Population','Number of Basic Latrines','Number of Improved Latrines', 'Number of Functioning Water Points','Number of Broken Water Points'];
	//this.rootElement.append('<h3>Add New Village</h3>');
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
	//this.rootElement.append($('<button>Done</button>').attr('id',recordId).attr('onclick','closeEditDiv(this.id)')) //attr('onclick','closeEditDiv(this.id)'))
	
	
}
VillageDisplayRow.prototype = clone(LionDiv.prototype);
VillageDisplayRow.prototype.constructor = VillageDisplayRow.prototype;






function updateVillageDisplay() {
	$('#displayTable').empty();
	Village.all().list(function(villages) {
		villages.forEach(function(village) {
			$('#displayTable').append(new VillageDisplayRow(Village,village.id).element());
		});
	});
	
}

function editRecord(recordId) {
	$('#'+recordId+'-div').remove();
	//$('button').attr('disabled','disabled');
	//$('#editRow').append(new VillageEditDiv(Village,recordId).element());
	$('#inputModalBody').empty();
	$('#inputModalBody').append(new VillageEditDiv(Village,recordId).element());
	//$('#modalCloseButton').attr('onclick','closeInputModal('+ recordId + ')');
	$('#modalCloseButton').attr('onclick',"closeInputModal('" + recordId + "')");
	$('#inputModal').modal('show')
	//$('#inputPopup').show();
	//$('#btnNewRecord').toggle();
}

function deleteRecord(recordId) {
	$('#'+recordId+'-div').remove();
	Village.load(recordId,function(village) {
		persistence.remove(village);
		persistence.flush();
		syncVillage();
	});
}

function createRecord() {
	
	var temp = new Village();
	persistence.add(temp);
	persistence.flush();
	editRecord(temp.id);
	
}

function closeInputModal(recordId) {
	$('#' + recordId + "-div").remove();
	$('#inputModal').modal('hide');
	syncVillage();
	//$('#inputPopup').hide();
	//Popup.objects[0].hide();
	updateVillageDisplay();
	//$('#displayTable').append(new VillageDisplayRow(Village,recordId).element());
	//$('#btnNewRecord').toggle();
	//$('button').removeAttr('disabled');
}


function displayDataPage() {

	//CREATE PAGE

	//assign content div to variable
	var contentDiv = $('#contentDiv');

	//create modal div
	var modalDiv = $('<div></div>').addClass('modal hide fade').attr('id','inputModal');
	//create modal div contents
	var modalHeader = $('<div></div>').addClass('modal-header');
	modalHeader.append($('<h3></h3>').html('Add/Edit Village Information'));
	var modalBody = $('<div></div>').addClass('modal-body').attr('id','inputModalBody');
	var modalFooter = $('<div></div>').addClass('modal-footer');
	modalFooter.append($('<a></a>').html('Done').attr('href','#').addClass('btn').attr('id','modalCloseButton'));
	//append to modal div
	modalDiv.append(modalHeader).append(modalBody).append(modalFooter);
	//append to content div
	contentDiv.append(modalDiv);

	//create display div
	var tableRow = $('<div></div>').addClass('row-fluid').attr('id','tableRow');
	var table = $('<table></table>').addClass('table').addClass('table-striped').addClass('table-bordered').attr('cellspacing','1')
	var tableHead = $('<thead><tr><th>Village Name</th><th>District</th><th>Population</th><th>Basic Latrines</th><th>Improved Latrines</th><th>Functional WPs</th><th>Non-Functional WPs</th><th></th></tr></thead>');
	var tableBody = $('<tbody></tbody>').attr('id','displayTable');
	var editRow = $('<div></div>').addClass('row-fluid').append($('<button onclick="createRecord()">Add Village</button>'));
	//append
	table.append(tableHead);
	table.append(tableBody);
	tableRow.append(table);
	contentDiv.append(tableRow);
	contentDiv.append(editRow);

	

	//ADD CONTENT
	updateVillageDisplay()

}


