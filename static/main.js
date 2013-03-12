




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
		displayAboutPage();
		$('#aboutLink').attr('class','active');
	
	}
	else if (page=='syncFailure') {
		$('#contentDiv').append('<p>LIONSync has failed to download content from the server.</p>');
			//$('a').attr('onclick','');
	}
	else if (page=='firstSync') {
		$('#contentDiv').append('<div class=""><p>In order to run, LionSync needs to download some data from the server. This may take a few moments. Feel free to explore the tabs ("Data", "Dashboard", and "About"), but everything may not work perfectly until your first sync is complete (we are still beta!). Check the top righthand corner for your status. If it says "Sync Failed", please do not worry - that just means you are offline, but lionsync is designed to work offline!</p></div>');
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



