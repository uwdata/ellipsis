(function() {
    var width = 500;
    var height = 300;
    
    var minYear = 2004;
    var maxYear = 2010;
    
    var minRate = function() {
        var min = Infinity;
        for(var i = 0; i < annualData.length; i++)
            if(annualData[i].rate < min)
                min = annualData[i].rate;
                
        return min;
    }
    
    var maxRate = function() {
        var max = -Infinity;
        for(var i = 0; i < annualData.length; i++)
            if(annualData[i].rate > max)
                max = annualData[i].rate;
                
        return max;
    }
    
    var sx = d3.scale.linear()
                        .domain([minYear, maxYear])
                        .range([0, width]);
    
    var sy = d3.scale.linear()
                        .domain([minRate(), maxRate()])
                        .range([height, 0]);  
                        
    var line = d3.svg.line()
          .x(function(d, i){ return sx(d.year); })
          .y(function(d, i){ return sy(d.rate); });
    
    var vis = n3.vis('annualRates') 
        .data(annualData)

        .stage('#annual_rates_stage', width, height)

        .state('year', d3.range(minYear, maxYear+1))
        .state('locationId', ['usa', 
                              'LosAngeles-LongBeach-SantaAnaCAMetropolitanStatisticalArea',
                              'NewYork-NorthernNewJersey-LongIslandNY-NJ-PAMetropolitanStatisticalArea'])

        .const('minYear', minYear)
        .const('maxYear', maxYear)
        .const('minRate', minRate)
        .const('maxRate', maxRate)
        
        .const('sx', sx)
        .const('sy', sy)
        .const('line', line)

        .render(function() {
            drawAxes();
            
            plotLines();
        });

    var svg = d3.select("#annual_rates")
        .append("svg")
            .attr('id', 'annual_rates_stage')
    
    function drawAxes() {
        var xAxis = d3.range(minYear, maxYear+1); 
        var yAxis = d3.range(Math.round(minRate()), 
                             Math.round(maxRate()));
        
        svg.selectAll('line.xAxis')
             .data(xAxis)
             .enter().append("svg:line")
                 .attr("x1", function(d) { return sx(d); })
                 .attr("y1", function() { return height + 25 })
                 .attr("x2", function(d) { return sx(d); })
                 .attr("y2", 0)
                 .attr("class", "xAxis");
                 
        svg.selectAll("line.yAxis")
             .data(yAxis)
             .enter().append("svg:line")
                 .attr("x1", -10)
                 .attr("y1", function(d) { return sy(d); })
                 .attr("x2", function(d) { return width + 10 })
                 .attr("y2", function(d) { return sy(d); })
                 .attr("class", "yAxis");
                 
        svg.selectAll("text.xLbls")
             .data(xAxis)
             .enter().append("svg:text")
                 .text(function(d) { 
                     return "'" + (d+'').substring(2); 
                 })
                 .attr("x", function(d) { return sx(d); })
                 .attr("dx", 10)
                 .attr("y", function(d) { return height; })
                 .attr("dy", 40)
                 .attr("class", "xLbls")
                 .attr("text-anchor", "end");
                 
        svg.selectAll("text.yAxisLabels")
             .data(yAxis)
             .enter().append("svg:text")
                 .text(function(d) {
                     return d % 2 == 1 ? d + '%' : '';
                 })
                 .attr("x", -15)
                 .attr("y", function(d) { return sy(d); })
                 .attr("dy", "4")
                 .attr("class", "yAxisLabels")
                 .attr("text-anchor", "end");
    }    
    
    function plotLines() {
        var data = [[], []];
        for(var i = 0; i < annualData.length; i++) {
            var d = annualData[i];
            if(d.year > vis.state('year'))
                continue;

            if(d.id == 'usa')
                data[0].push(d);
            else if(d.id == vis.state('locationId'))        
                data[1].push(d);
        }

        var p = svg.selectAll('path')
            .data(data, function(d) { return d.id; });
            
        p.enter().append('svg:path');     
                
        p.transition()    
            .attr('id', function(d) { return d.length > 0 ? d[0].id : ''; })
            .attr('d', line);
        
        p.exit().remove();
    }
}).call(this);