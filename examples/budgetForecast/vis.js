var vis = n3.vis('budgetForecast') 
    .data(fullData)
    
    .stage('#stage', 700, 400)
    
    .state('year', d3.range(1980, 2010))
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
                            .x(function(d, i){ return vis.const('sx')()(d.year); })
                            .y(function(d, i){ return vis.const('sy')()(d.val); });
    })
    
    .const('dataTransform', function(year, val) {
        return {'year': year, 'val': val};
    })
    
    .render(function() {
        // First draw zero line
        drawZero(this);

        // Plot forecasts
        drawForecasts(this);

        // Plot actual budget figures
        drawActual(this);
    });
    
function drawZero(vis) {
    var zeroData = [];
    for(var i = vis.const('minYear'); i <= vis.const('maxYearForecast'); i++)
        zeroData[zeroData.length] = vis.const('dataTransform')(i, 0);

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
            if(d.year > year)
                break;
        
            var forecastData = [];
            var forecastYears = d3.keys(d);
            for (j in forecastYears) {
                var fy = forecastYears[j];
                if(fy == 'year' || d[fy] == 0)
                    continue;
        
                forecastData[forecastData.length] = dataTransform(fy, d[fy]);                
            }
        
            data[data.length] = forecastData;
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
    
    for (i in fullData) {
        var d = fullData[i];
        if(d.year > year)
            continue;
        
        var prevYear = d.year - 1;
    
        data[data.length] = dataTransform(prevYear, (d[prevYear] || 0));
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
        var d2010 = fullData[fullData.length - 1];
        var years = d3.keys(d2010);
        
        for (i in years) {
            var y = years[i];
        
            if(y == 'year' || d2010[y] == 0)
                continue;
        
            projectedData[projectedData.length] = dataTransform(y, d2010[y]);                
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