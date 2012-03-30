(function() {
    var zoomExtent = [1, 15];
    var width = 960;
    var height = 500;
    var path = d3.geo.path();
    
    var statesUnemployment, countiesUnemployment; // Loaded async
    
    var vis = n3.vis('choropleth')
        .data({})
        .stage('#choropleth_stage g', width, height)
    
        .state('zoom', zoomExtent, true)
        .bind('zoom', function(val) {
            $( "#zoom_slider" ).slider('value', val);
        })
        
        .state('translateX', [-Infinity, Infinity], true)
        .state('translateY', [-Infinity, Infinity], true)
        
        .const('zoomExtent', zoomExtent)
        .const('path', path)
        .const('quantize', quantize)
        
        .render(redraw);
        
    // Slider is part of visualization, not story!    
    $("#zoom_slider").slider({
		orientation: "vertical",
		min: zoomExtent[0],
		max: zoomExtent[1],
		value: 1,
		step: 0.5,
		start: function(event, ui) {
			$(this).slider('option', 'oldVal', ui.value);
		},
		slide: function( event, ui ) {
			var oldVal = $(this).slider('option', 'oldVal');
			var newVal = ui.value;
            $(this).slider('option', 'oldVal', ui.value);
            
            fireZoomEvent(oldVal, newVal);
		}
	});
	
	function fireZoomEvent(oldVal, newVal) {
        // void initWebKitWheelEvent(int wheelDeltaX, int wheelDeltaY, DOMWindow   
        //             view, int screenX, int screenY, int clientX, int clientY, bool ctrlKey,   
        //             bool altKey, bool shiftKey, bool metaKey);
        
        var diff = newVal - oldVal;
        var wheelDeltaY = Math.pow(1, Math.abs(diff));
        wheelDeltaY *= (newVal < oldVal) ? -1 : 1;
        
        var evt = document.createEvent("WheelEvent");
		evt.initWebKitWheelEvent(0, wheelDeltaY, window, 
		                         width/2, height/2, width/2, height/2, 
		                         false, false, false, false);
		
		document.getElementById('choropleth_stage').dispatchEvent(evt);
    }
    
    // Slightly modified version of D3 Choropleth examples
    // Capped the zoom extents and have counties appear at
    // a certain zoom level.    
    var svg = d3.select("#choropleth")
        .append("svg")
            .attr('id', 'choropleth_stage')
            .call(d3.behavior.zoom().scaleExtent(zoomExtent)
            .on("zoom", onZoom))
        .append("g");
        
    var counties = svg.append("g")
        .attr("id", "counties")
        .attr("class", "Blues");

    var states = svg.append("g")
        .attr("id", "states")
        .attr("class", "Blues");
        
    d3.json("data/states-unemployment.json", function(json) {
        statesUnemployment = json;
    })
              
    d3.json("data/us-states.json", function(json) {
        var visData = vis.data();
        visData['states'] = json;
        
        states.selectAll("path")
        .data(json.features)
        .enter().append("path")
            .attr("class", function(d) {
                return quantize(true, d);
            })    
            .attr("d", path);
    });
    
    d3.json("data/counties-unemployment.json", function(json) {
        countiesUnemployment = json;
    })
    
    d3.json("data/us-counties.json", function(json) {
        var visData = vis.data();
        visData['counties'] = json;
        
        counties.selectAll("path")
        .data(json.features)
        .enter().append("path")
            .attr("class", function(d) {
                return quantize(false, d);
            })
            .attr("d", path);
    });
    
    function quantize(s, d) {
        var val = s ? statesUnemployment[d.id] : countiesUnemployment[d.id];
        return "q" + Math.min(8, ~~(val * 9 / 12)) + "-9";
    }
    
    function onZoom() {
        vis.state('zoom', d3.event.scale);
        vis.state('translateX', d3.event.translate[0]);
        vis.state('translateY', d3.event.translate[1]);
    }
    
    function redraw() {
        svg.attr("transform", "translate(" + 
                              (vis.state('translateX') || 0) + "," + 
                              (vis.state('translateY') || 0) + ")" +
                              "scale(" + vis.state('zoom') + ")");
        
        // If we're at zoom level > 2, show counties by making states 
        // transparent
        states.selectAll('path')
                .style('fill', vis.state('zoom') >= 2 ? 'none' : null);
    }    
}).call(this);
    