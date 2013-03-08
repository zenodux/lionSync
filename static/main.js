




//main content handler
function showPage(page) {
	//clear content div
	emptyContentDiv();
	//$('#dataLink').attr('onclick','displayDataPage()');
	//$('#aboutLink').attr('onclick','displayAboutPage()');
	//$('#dashboardLink').attr('onclick','displayDashboardPage()');
	
	if (page == 'data') {
		//SHOW DATA PAGE
		//$('#contentDiv').append($('<script></script>').attr('type','text/javascript').attr('src','templates/data.js'))
		displayDataPage();
		$('#dataLink').attr('class','active');
	}
	else if (page=='dashboard') {
		//SHOW DASHBOARD
		displayDashboardPage();
		$('#dashboardLink').attr('class','active');
		
		//zoomMapToExtent()
	
	}
	else if (page=='about') {
		//SHOW ABOUT
		$('#aboutLink').attr('class','active');
	
	}
	else if (page=='syncFailure') {
		$('#contentDiv').append('<p>LIONSync has failed to download content from the server.</p>');
			//$('a').attr('onclick','');
	}
	else if (page=='firstSync') {
		$('#contentDiv').append('<div class=""><h4>Welcome to LIONSync</h4><p>Since this is your first time visiting, some content (~4mb) will need to be downloaded before you can begin. This may take a few minutes.</p></div>');
		//$('a').attr('onclick','');
		//$('#contentDiv').append('<p>Downloading content...</p><img src="img/ajax-loader.gif"/>');
	}
}

function emptyContentDiv() {
	$('#contentDiv').empty();
	$('li').attr('class','');
	
}

function initialize() {
	updateSyncStatus();
	//choose first page to display
	if (localStorage.syncedOnce == true) {
		showPage('data');
		
	}
	else {
		showPage('firstSync');
	}
	//sync villages and districts
	
	syncDistrict();
	syncVillage();
	

}


function updateSyncStatus(status) {
	$('#syncStatus').empty();
	if (status == 'started') {
		$('#syncStatus').append($('<p>Syncing... <img src="img/ajax-loader.gif"/></p>'));
	}
	else if (status == 'finished') {
		$('#syncStatus').append($('<p>Sync successful!</p>'));
	
	}
	else if (status == 'failed') {
		$('#syncStatus').append($('<p>Sync failed.</p>'));
	}

}



