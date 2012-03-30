(function() {
    var width = 500;
    var height = 300;
    
    var minYear = 2004;
    var maxYear = 2011;
    
    var annualDataHash = {};
          
    var vis = n3.vis('annualRates') 
        .stage('#annual_rates_stage', width, height)

        .state('year', d3.range(minYear, maxYear+1))
        .state('locationId', validLocationIds)

        .const('minYear', minYear)
        .const('maxYear', maxYear)
        .const('minRate', minRate)
        .const('maxRate', maxRate)
        
        .const('scales', getScales)
        .const('line', getLinePlotter)

        .render(function() {
            if(!vis.state('year') || !vis.state('locationId'))
                return;
                
            drawAxes(this);
            
            plotLines(this);
        });
        
    d3.select("#annual_rates")
        .append("svg")
            .attr('id', 'annual_rates_stage');
            
    var title = d3.select('#annual_rates')
        .append('p')
            .attr('id', 'annual_rates_title');
            
    d3.json("data/annualData.json", function(json) {                   
        parseData(json, 0, json.length);
    });
    
    // Data is extremely large, so process it in chunks of 100
    function parseData(json, offset, total) {
        var length = (total - offset > 100) ? offset + 100 : total;
        for(var i = offset; i < length; i++) {
            var d = json[i];
            annualDataHash[d.id] || (annualDataHash[d.id] = []);
            
            annualDataHash[d.id].push(d);
        }
        vis.data(annualDataHash);
        console.log('done ' + i + ' ' + length + ' ' + offset);
        if(length != total)
            window.setTimeout(function() {
                parseData(json, (offset + 100), total)
            }, 100);
    }
    
    function minRate() {
        var natlData = annualDataHash['usa'];
        var locData  = annualDataHash[vis.state('locationId')];
                
        var findMin = function(arr) {
            var min = Infinity;
            for(var i = 0; i < arr.length; i++)
                if(arr[i].rate < min)
                    min = arr[i].rate;
                    
            return min;
        }
        
        var minNatl = findMin(natlData);
        var minLoc  = findMin(locData);
        
        return minNatl <= minLoc ? minNatl : minLoc;
    }
    
    function maxRate() {
        var natlData = annualDataHash['usa'];
        var locData  = annualDataHash[vis.state('locationId')];

        var findMax = function(arr) {
            var max = -Infinity;
            for(var i = 0; i < arr.length; i++)
                if(arr[i].rate > max)
                    max = arr[i].rate;

            return max;
        }
        
        var maxNatl = maxNatl = findMax(natlData);
        var maxLoc  = maxLoc  = findMax(locData);
        
        return maxNatl >= maxLoc ? maxNatl : maxLoc;
    }
    
    function getScales() {
        var sx = d3.scale.linear()
                            .domain([minYear, maxYear])
                            .range([0, width]);

        var sy = d3.scale.linear()
                            .domain([minRate(), maxRate()])
                            .range([height, 0]);
                            
        return [sx, sy];
    }
    
    function getLinePlotter() {
        var scales = getScales();
        var sx = scales[0], sy = scales[1];
        
        var line = d3.svg.line()
              .x(function(d, i){ return sx(d.year); })
              .y(function(d, i){ return sy(d.rate); });
              
        return line;
    }
    
    function drawAxes(vis) {
        var xAxis = d3.range(minYear, maxYear+1); 
        var yAxis = d3.range(Math.round(minRate()), 
                             Math.round(maxRate()));
        var scales = getScales();
        var sx = scales[0], sy = scales[1];
                             
        var svg = vis.stage();
        
        var xGrid = svg.selectAll('line.xGrid')
             .data(xAxis);
             
        xGrid.enter().append("svg:line");
             
        xGrid.transition()
                 .attr("x1", function(d) { return sx(d); })
                 .attr("y1", function() { return height + 25 })
                 .attr("x2", function(d) { return sx(d); })
                 .attr("y2", 0)
                 .attr("class", "xGrid");
                 
        xGrid.exit().remove();
                 
        var yGrid = svg.selectAll("line.yGrid")
             .data(yAxis);
             
        yGrid.enter().append("svg:line");
        
        yGrid.transition()     
                 .attr("x1", -10)
                 .attr("y1", function(d) { return sy(d); })
                 .attr("x2", function(d) { return width + 10 })
                 .attr("y2", function(d) { return sy(d); })
                 .attr("class", "yGrid");
                 
        yGrid.exit().remove();
                 
        var xLbls = svg.selectAll("text.xLbls")
             .data(xAxis);
             
        xLbls.enter().append("svg:text");
             
        xLbls.transition()
                 .text(function(d) { 
                     return "'" + (d+'').substring(2); 
                 })
                 .attr("x", function(d) { return sx(d); })
                 .attr("dx", 10)
                 .attr("y", function(d) { return height; })
                 .attr("dy", 40)
                 .attr("class", "xLbls")
                 .attr("text-anchor", "end");
                 
        xLbls.exit().remove();
                 
        var yLbls = svg.selectAll("text.yLbls")
             .data(yAxis);
             
        yLbls.enter().append("svg:text");
             
        yLbls.transition()
                 .text(function(d) {
                     return d % 2 == 0 ? d + '%' : '';
                 })
                 .attr("x", -15)
                 .attr("y", function(d) { return sy(d); })
                 .attr("dy", "4")
                 .attr("class", "yLbls")
                 .attr("text-anchor", "end");
                 
        yLbls.exit().remove();
    }    
    
    function plotLines(vis) {        
        var svg = vis.stage();
        var scales = getScales();
        var sx = scales[0], sy = scales[1];
        var line = getLinePlotter();        
        var data = [[], []];
        var natlData = annualDataHash['usa'];
        var locData  = annualDataHash[vis.state('locationId')];

        for(var i = 0; i < natlData.length; i++)
            if(natlData[i].year <= vis.state('year'))
                data[0].push(natlData[i]);

        for(var i = 0; i < locData.length; i++)
            if(locData[i].year <= vis.state('year'))
                data[1].push(locData[i]);

        var p = svg.selectAll('path')
            .data(data, function(d) { return d.id; });
            
        p.enter().append('svg:path');     
                
        p.transition()    
            .attr('id', function(d) { return d.length > 0 ? d[0].id : ''; })
            .attr('d', line);
        
        p.exit().remove();
        
        if(data[1].length > 0)
            title.html('<span class="usa">National</span> Unemployment Rates vs ' + 
                       '<span class="location">' + data[1][0]['name'] + '</span>');
    }
}).call(this);