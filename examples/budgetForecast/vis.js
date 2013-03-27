var vis = n3.vis('budgetForecast') 
    .data(fullData)
    
    .stage('#stage', 700, 400)
    
    .state('year', d3.range(1980, 2011))
    .state('plotForecasts', [true, false])
    
    .const('minYear', 1980)
    .const('maxYear', 2010)
    .const('maxYearForecast', 2020)
    .const('minValue', -1781)
    .const('maxValue', 519)
    
    .const('sx', function() {
        return d3.scale.linear()
                        .domain([vis.const('minYear'), vis.const('maxYearForecast')])
                        .range([0, vis.width()]);
    })
        
    .const('sy', function() {
      return d3.scale.linear()
                        .domain([vis.const('minValue'), vis.const('maxValue')])
                        .range([vis.height(), 0]);  
    })
    
    .const('drawLineGraph', function() {
        return d3.svg.line()
                            .x(function(d, i){ return vis.const('sx')()(d.forecastYear); })
                            .y(function(d, i){ return vis.const('sy')()(d.value); });
    })
    
    .render(function() {
        // First draw zero line
        drawAxes(this);

        // Plot forecasts
        drawForecasts(this);

        // Plot actual budget figures
        drawActual(this);
    });
    
function drawAxes(vis) {
    var sx = vis.const('sx')();
    var sy = vis.const('sy')();
        
    var formatNumber = function(nStr) {
        nStr += '';
    	x = nStr.split('.');
    	x1 = x[0];
    	x2 = x.length > 1 ? '.' + x[1] : '';
    	var rgx = /(\d+)(\d{3})/;
    	while (rgx.test(x1)) {
    		x1 = x1.replace(rgx, '$1' + '.' + '$2');
    	}
    	
    	var newStr = x1 + x2;
    	if(newStr.indexOf('-') != -1) {
    	    newStr = '-$' + newStr.substring(1);
    	} else {
    	    newStr = '$' + newStr;
    	}
    	
    	return newStr;
    }
    
    var xAxis = d3.range(vis.const('minYear'), vis.const('maxYearForecast'), 2); 
    var yAxis = d3.range(vis.const('minValue'), vis.const('maxValue'), 200);
    
    vis.stage()
        .selectAll('line.xAxis')
        .data(xAxis)
        .enter()
            .append("svg:line")
            .attr("x1", function(d) { return sx(d); })
            .attr("y1", function() { return vis.height() + 20 })
            .attr("x2", function(d) { return sx(d); })
            .attr("y2", 0)
            .attr("stroke", "#fff")
            .attr("class", "xAxis");
            
    vis.stage()
        .selectAll("line.yAxis")
        .data(yAxis)
        .enter()
            .append("svg:line")
            .attr("x1", -20)
            .attr("y1", function(d) { return sy(d); })
            .attr("x2", function(d) { return vis.width() + 20 })
            .attr("y2", function(d) { return sy(d); })
            .attr("stroke", "#fff")
            .attr("class", "yAxis");
            
    vis.stage()
        .selectAll("text.xAxisLabels")
        .data(xAxis)
        .enter()
            .append("svg:text")
            .text(function(d) { 
                if(d == vis.const('minYear') || d == vis.const('maxYearForecast')) 
                    return;
                
                var fullYear = d + '';
                return "'" + fullYear.substring(2); 
            })
            .attr("x", function(d) { return sx(d); })
            .attr("dx", "10")
            .attr("y", function(d) { return sy(0); })
            .attr("dy", "-5")
            .attr("class", "xAxisLabels")
            .attr("fill", "#aaa")
            .attr("text-anchor", "end");        
    
    vis.stage()
        .selectAll("text.yAxisLabels")
        .data(yAxis)
        .enter()
            .append("svg:text")
            .text(function(d) {
                if(d != 19 && d != vis.const('minValue'))
                    return formatNumber(Math.round(d)) + ((Math.abs(d) > 1000) ? ' trillion' : ' billion'); 
            })
            .attr("x", 75)
            .attr("dx", function(d) { return Math.abs(d) > 1000 ? 15 : 0 })
            .attr("y", function(d) { return sy(d); })
            .attr("dy", "4")
            .attr("class", "yAxisLabels")
            .attr("fill", "#aaa")
            .attr("text-anchor", "end");
            
    var zeroData = [];
    for(var i = vis.const('minYear'); i <= vis.const('maxYearForecast'); i++)
        zeroData[zeroData.length] = {'budgetYear': i, 'forecastYear': i, 'value': 0};

    var path = vis.stage().selectAll('path#zero')
                        .data([zeroData]);

    path.enter()
        .append('svg:path')
        .attr('id', 'zero')
        .attr('d', vis.const('drawLineGraph')());
}

function drawForecasts(vis) {
    var plot = vis.state('plotForecasts');
    var year = vis.state('year');
    var drawLineGraph = vis.const('drawLineGraph')();
    var dataTransform = vis.const('dataTransform');
    var fullData = vis.data();
    
    var data = [];    

    if(plot == true) {
        for(var i in fullData) {    // fullData is already sorted by year
            var d = fullData[i];
            if(d.budgetYear > year)
                break;
        
            data[data.length] = d;
        }        
    }

    var forecast = vis.stage().selectAll('path.forecast')
                            .data(data);
        
    forecast.enter()
                .append('svg:path')
                .attr('d', drawLineGraph)
                .attr('class', 'forecast');
            
    forecast.transition()
                .attr('d', drawLineGraph)
            
    forecast.exit()
                .remove();    
}

function drawActual(vis) {
    var year = vis.state('year');
    var drawLineGraph = vis.const('drawLineGraph')();
    var dataTransform = vis.const('dataTransform');
    var fullData = vis.data();
    
    var data = [];
    
    for(var i = 0; i < fullData.length; i++) {
        var d = fullData[i];
        if(d.budgetYear > year)
            continue;
        
        if(d.forecastYear != d.budgetYear - 1)
            continue;
    
        data[data.length] = d;
    }

    var actual = vis.stage().selectAll('path#actual')
                            .data([data]);
        
    actual.enter()
                .append('svg:path')
                .attr('d', drawLineGraph)
                .attr('id', 'actual');
            
    actual.transition().attr('d', drawLineGraph);
            
    actual.exit().remove();
    
    // 2010 projection
    var projectedData = [];    
    if(year >= 2010) {
        for(var i = 0; i < fullData.length; i++) {
            var d = fullData[i];
            if(d.budgetYear != 2010)
                continue;

            projectedData[projectedData.length] = d;
        }
    }
    
    var projected = vis.stage()
                            .selectAll('path#projected')
                            .data([projectedData]);
                            
    projected.enter()
                .append('svg:path')
                .attr('d', drawLineGraph)
                .attr('id', 'projected');
    
    projected.transition().attr('d', drawLineGraph);
    
    projected.exit().remove();
}