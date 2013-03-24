
	
function displayAboutPage() {

	var contentDiv = $('#contentDiv');

	var aboutDiv = $('<div></div>').addClass('span12');
	aboutDiv.append($('<h3>What is LIONSync?</h3>'));
	aboutDiv.append($("<p>The dominant paradigm of internet access in the developing world is intermittence - sometimes people have access to internet, sometimes they don't. However, water and sanitation professionals require full-time access to comprehensive planning databases on rural water supply and sanitation coverage, regardless of their connectivity at a given moment in time. LIONSync provides a framework for water and sanitation professionals to enter, access, and analyze data offline, and have data sync between multiple users when connected to the internet. This allows field-level staff to seamlessly use data for planning, and national-level staff to receive regular updates without the need to request and transmit individual reports.</p>"));
	aboutDiv.append($('<h3>LIONSync Features</h3>'));
	aboutDiv.append($("<ul>	<li>Works seamlessly without an internet connection</li><li>Installs automatically with one visit to the site</li><li>Easy to use data management and analytics</li></ul>"));
	aboutDiv.append($('<h3>About This Version</h3>'));
	aboutDiv.append($("<p>This version is just a demo. It shows a simple 'data' page which you can use to add or edit villages (seriously, try it!). It then shows a simple dashboard where you can view summaries by district. The demonstration uses publicly available spatial data (GADM) for Malawi but all village-level data are fictional. This is just a demonstration to show the power of the idea and test the framework. We hope you like it! (For bonus points, try disconnecting your computer from the internet and adding a few villages offline.)</p>"));
	aboutDiv.append($('<h3>LIONSync on Github</h3>'));
	aboutDiv.append($("<p>Check out the repository <a href='https://github.com/zenodux/lionSync'>here</a></p>"));
	aboutDiv.append($('<iframe width="560" height="315" src="http://www.youtube.com/embed/VRU4IaLCVNw?rel=0" frameborder="0" allowfullscreen></iframe>'));
	aboutDiv.append($('<h3>Comments or Feedback</h3>'));
	aboutDiv.append($("<p>Please send any comments or feedback to owen.m.scott [at] gmail.com or zenodux [at] gmail.com. Thanks!</p>"));
	contentDiv.append($('<div></div>').addClass('row-fluid').append(aboutDiv));
}