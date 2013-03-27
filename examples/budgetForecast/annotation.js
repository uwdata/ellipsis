n3.annotation.def('highlightedPoint')
    .enter(function() {
        var vis = this.vis();
        var sx = vis.const('sx')();
        var sy = vis.const('sy')();

        
        var point = vis.stage().selectAll('circle.point')
            .data(this.data(), function(d) { return d.budgetYear; });

        point.enter()
                .append('svg:circle')
                .attr('class', 'point')
                .attr('cx', function(d) { return sx(d.forecastYear) })
                .attr('cy', function(d) { return sy(d.value) })
                .attr('r', 2.5);

        point.transition()
            .attr('cx', function(d) { return sx(d.forecastYear) })
            .attr('cy', function(d) { return sy(d.value) });

        point.exit().remove();
        
        var annotCircle = vis.stage().selectAll('circle.annotation')
            .data(this.data());

        annotCircle.enter()
             .append('svg:circle')
             .attr('class', 'annotation')
             .attr('cx', function(d) { return sx(d.forecastYear) })
             .attr('cy', function(d) { return sy(d.value) })
             .attr('r', 7);

        annotCircle.transition()
            .attr('cx', function(d) { return sx(d.forecastYear) })
            .attr('cy', function(d) { return sy(d.value) });    

        annotCircle.exit().remove();
    })
    .exit(function() {
        var vis = this.vis();
        vis.stage().selectAll('circle.point').remove();
        vis.stage().selectAll('circle.annotation').remove();
    });
    
