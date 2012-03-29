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

        .render(draw);

    var svg = d3.select("#annual_rates")
        .append("svg")
            .attr('id', 'annual_rates_stage')

    function draw() {
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