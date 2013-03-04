window.districtGeoJson;
window.districtCounters = {};
window.districtCounter = {current:0,max:0};


function getColor(d) {
	return d == "No Data" ? '#EEEEEE' :
			d > 15 ? '#F50505' :
		   d >  10 ? '#F5BD05' :
		   d > 5  ? '#B5F505' :
		   d > 2  ? '#61F505' :
					  '#33FC21';
	}
function style(feature) {
	return {
		fillColor: getColor(feature.properties.peoplePerLatrine),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

function createLeafletMap(div) {
	window.map = L.map(div).setView([51.505, -0.09], 13);

}

function addDistrictsToMap(map) {
	//make geojson blank
	window.districtCounter.current = 0;
	window.districtGeoJson = {"type":"FeatureCollection","features":[]};
	//populate geojson with data
	District.all().count(function(count) {
		window.districtCounter.max = count;
		District.all().list(function(districts){
			console.log('really');
			districts.forEach(function(district){
				//create a temp district with the geometry
				var tempDistrict = {type:'Feature',properties:{name:district.name,peoplePerLatrine:'No Data',numLatrines:'No Data',population:'No Data',numFuncWaterPoints:'No Data'},geometry:{type:'Polygon',coordinates:JSON.parse(unescape(district.boundary))}};
				//get the right value for the district
				var districtVillages = Village.all().filter('district', '=', district.name);
				console.log('now this');
				districtVillages.count(function(count) {
					console.log('now this? count = ' + count);
					window.districtCounters[district.name] = {max:0,current:0};
					if (count == 0) {
						window.districtCounter.current += 1;
						console.log('checked (EMPTY) district ' + window.districtCounter.current + " of " + window.districtCounter.max);
						
					}
					else {
						tempDistrict.properties.peoplePerLatrine = 0;
						tempDistrict.properties.numLatrines = 0;
						tempDistrict.properties.population = 0;
						tempDistrict.properties.numFuncWaterPoints = 0;
					}
					window.districtCounters[district.name]['max'] = count;
					window.districtGeoJson.features.push(tempDistrict);
					
					//duplicate code that will eventually need to be cleaned up
					if ((window.districtCounter.current == window.districtCounter.max)) {//(window.districtCounter.current == window.districtCounter.max) {
						//remove layer from map
						if (window.districtLayer) {
							window.map.removeLayer(window.districtLayer);
						}
						//add new geojson as map layer
						window.districtLayer = new L.GeoJSON (window.districtGeoJson,{style:style,onEachFeature:onEachFeature});
						console.log("Map Updated");	
						window.districtLayer.addTo(window.map);
						window.map.fitBounds(window.districtLayer.getBounds());
					}
					//duplicate code that will eventually need to be cleaned up
						
					districtVillages.forEach(function(village) {
						console.log('matching village ' + village.name + ' in district ' + district.name);
						//increment counter
						window.districtCounters[district.name]['current'] += 1;
						console.log("checked village " + window.districtCounters[district.name]['current'] + " of " + window.districtCounters[district.name]['max']);
						
						//add village WP value
						tempDistrict.properties.numLatrines = tempDistrict.properties.numLatrines + village.numImprvLatrines + village.numBasicLatrines;
						tempDistrict.properties.population = tempDistrict.properties.population + village.population;
						tempDistrict.properties.numFuncWaterPoints = tempDistrict.properties.numFuncWaterPoints + village.numFuncWPs;
						
						//end of add values
						console.log(window.districtCounters[district.name].current + " of " + window.districtCounters[district.name].max);
						if (window.districtCounters[district.name].current == window.districtCounters[district.name].max) {
							//increment districts counter
							window.districtCounter.current += 1
							console.log('checked (MATCHING) district ' + window.districtCounter.current + " of " + window.districtCounter.max);
							tempDistrict.properties.peoplePerLatrine = Math.round(tempDistrict.properties.population / tempDistrict.properties.numLatrines);
							if ((window.districtCounter.current == window.districtCounter.max)) {//(window.districtCounter.current == window.districtCounter.max) {
								//remove layer from map
								if (window.districtLayer) {
									window.map.removeLayer(window.districtLayer);
								}
								//add new geojson as map layer
								window.districtLayer = new L.GeoJSON (window.districtGeoJson,{style:style,onEachFeature:onEachFeature});
								console.log("Map Updated");	
								window.districtLayer.addTo(window.map);
								window.map.fitBounds(window.districtLayer.getBounds());
							}
						}
					});
					
				});
				
			});
		});
	});
	
	
	

}

function zoomMapToExtent() {
	window.map.fitBounds(window.districtLayer.getBounds());
}

function onEachFeature(feature, layer) {
    var labels = {name:'District Name',numFuncWaterPoints:'Number of Functioning Water Points',numLatrines:'Number of Latrines',peoplePerLatrine:'People Per Latrine',population:'Population'}
	layer.on({
        click: function() {
			$('#detailDiv').empty();
			$('#detailDiv').append($('<h3></h3>').html(feature.properties.name + ' Summary'));
			var table = $('<table></table>').attr('class','table table-striped');
			for (p in feature.properties) {
				table.append($('<tr></tr>').append($('<td></td>').html(labels[p])).append($('<td></td>').html(feature.properties[p])));
			}
			$('#detailDiv').append(table);
		
		},
        mouseout: resetHighlight,
    });
}

//http://leafletjs.com/examples/choropleth.html
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
	
	//more code that should eventually go somwhere else
	
	
	//document.info.update(layer.feature.properties);
}

//http://leafletjs.com/examples/choropleth.html
function resetHighlight(e) {
    window.districtLayer.resetStyle(e.target); //e.target
	//document.info.update();
}

