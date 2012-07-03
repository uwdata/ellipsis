n3.annotation.def('highlightedPoint')
    .enter(function() {
        var vis = this.vis();
        var sx = vis.const('sx')();
        var sy = vis.const('sy')();

        
        var point = vis.stage().selectAll('circle.point')
                            .data(this.data(), function(d) { return d.year; });

        point.enter()
                .append('svg:circle')
                .attr('class', 'point')
                .attr('cx', function(d) { return sx(d.year) })
                .attr('cy', function(d) { return sy(d.val) })
                .attr('r', 2.5);

        point.transition()
            .attr('cx', function(d) { return sx(d.year) })
            .attr('cy', function(d) { return sy(d.val) });

        point.exit().remove();
        
        var annotCircle = vis.stage().selectAll('circle.annotation')
                            .data(this.data());

        annotCircle.enter()
             .append('svg:circle')
             .attr('class', 'annotation')
             .attr('cx', function(d) { return sx(d.year) })
             .attr('cy', function(d) { return sy(d.val) })
             .attr('r', 7);

        annotCircle.transition()
            .attr('cx', function(d) { return sx(d.year) })
            .attr('cy', function(d) { return sy(d.val) });    

        annotCircle.exit().remove();
    })
    .exit(function() {
        var vis = this.vis();
        vis.stage().selectAll('circle.point').remove();
        vis.stage().selectAll('circle.annotation').remove();
    });
    
