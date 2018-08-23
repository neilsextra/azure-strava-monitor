var map = null;

$.fn.Show = function(id) {
        
    if (map != null) {

        map.off();
        map.remove();
    }
     
    var trip = trips[id];

    try {
       var start = trip.start.split(',');

       map = L.map('map').setView([start[0], start[1]], 16);

       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        minZoom: 9,
        noWrap:true
    }).addTo(map);

    var options = {};
    var coordinates = L.PolylineUtil.decode(trip.ployline, null);

    L.polyline(
        coordinates,
        {
            color: 'blue',
            weight: 2,
            opacity: .7,
            lineJoin: 'round'
        }
    ).addTo(map);

    setTimeout(function() {
        map.invalidateSize()
        $('#map').css('display', 'inline-block');

    }, 100);

    $('.leaflet-control-attribution').hide();

    $('#mapDialog').css('display', 'inline-block');
    
    } catch (e) {
        alert(e);
    }

}

$(document).ready(function() {
    try {
    $('.mapViewerClose').on('click', function(e) {
        $('#mapDialog').css('display', 'none');
    });

    var keys = Object.keys(trips);

    var totalDistance  = 0;
    var totalTime  = 0;
    
    Chart.defaults.global.legend.display = false;
   
    for (var key in keys) {
        var id = keys[key];

        totalDistance += parseFloat(trips[id].distance);
        totalTime += parseFloat(trips[id].elapsed_time);

    }

    for (var key in keys) {
        var id = keys[key];
        var valuesDistance = [];

        valuesDistance.push(totalDistance);
        valuesDistance.push(trips[id].distance);

        var valuesTime = [];

        valuesTime.push(totalTime);
        valuesTime.push(trips[id].elapsed_time);
       
        new Chart(document.getElementById('graph-time-' + id), {
            type: 'pie',
            data: {
              labels: ["Total", "Trip"],
              datasets: [{
                backgroundColor: ["#3e95cd", "#8e5ea2"],
                data: valuesTime
              }]
            },
            options: {
                title: {
                    display: true,
                    fontColor: '#fff',
                    fontSize: 18,
                    text: 'Elasped Time'
                },
                animation: {
                    duration: 0
                }            
            }
        });        
        
        
        new Chart(document.getElementById('graph-distance-' + id), {
            type: 'pie',
            data: {
              labels: ["Total", "Trip"],
              datasets: [{
                backgroundColor: ["#3e95cd", "#8e5ea2"],
                data: valuesDistance
              }]
            },
            options: {
                title: {
                    display: true,
                    fontColor: '#fff',
                    fontSize: 18,
                    text: 'Distance'
                },
                animation: {
                    duration: 0
                }            
            }
        });
        
    }
} catch (e) {
    alert(e);
}
});
     