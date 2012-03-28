// n3.scene('tutorial')
//     .set(vis, 'year', 2010)
//     .set(vis, 'plotForecast', true)
//     
//     .add(function() {
//         d3.select('#scene-list')
//             .append('div')
//                 .html('<p>Use these controls to navigate through the slideshow.</p>')
//                 .id('timeline-explanation')
//                 .style('position', 'absolute')
//                 .style('top', '100px')
//                 .style('left', '100px')
//     })
//     
//     .add(function() {
//         d3.select('#timeline-explanation')
//             .transition()
//                 .duration(100)
//                     .style('display', 'none');
//                     
//         d3.select('#slider')
//             .append('div')
//                 .id('slider-explanation')
//                 .html('<p>Use the slider to isolate a single year\'s forecast</p>')
//     }, 
//         n3.trigger.afterPrev(1000 * 5)
//     )
//     
//     .set(vis, 'year', n3.util.iterate(1980, 1990, 1, 100))
//     
//     .add(function() {
//         d3.select('#slider-explanation')
//             .transition()
//                 .duration(100)
//                     .style('display', 'none');
//         
//         n3.timeline.switchScene('scene_1');
//     },
//         n3.trigger.afterPrev(1000 * 2)
//     );

vis.bind('year', function(val) {
    $('#slider').slider('value', val);
})

n3.scene('scene_1')
    .set(vis, 'year', 2010)
    .set(vis, 'plotForecasts', false)
    
    .add(vis, function() {          // Init jQuery slider
        $('#slider').slider({
            min: 1980,
            max: 2010,
            step: 1,
            slide: function(e, ui) {
                vis.state('year', ui.value);
            } 
        });
        
        $('#slider').hide();
    })
    
    .add(vis, n3.annotation('highlightedPoint')
                    .data(function() {
                        var fullData = vis.data();
                        var data = [];
                        var dataTransform = vis.const('dataTransform');
                
                        for(var i in fullData) {
                            if(fullData[i].year != 2010)
                                continue;

                            data[data.length] = dataTransform(2010, fullData[i][2010]);
                            data[data.length] = dataTransform(2011, fullData[i][2011]);
                        }

                        return data;  
                    })
    )
    .add(vis, 
        n3.annotation('label')
            .attr('id', 'lbl_2010')
            .html('<p>2010 estimate:<br /><span class="annotation">-$1.56 trillion</span></p>')
            .pos([540, 341])
    )
    .add(vis,
        n3.annotation('label')
            .attr('id', 'lbl_2011')
            .html('<p>2011 proposal:<br /><span class="annotation">-$1.27 trillion</span></p>')
            .pos([560, 280])
    );

n3.scene('scene_2')
    .set(vis, 'year', 2010)
    .set(vis, 'plotForecasts', false)
    
    .add(vis, function() {
        var drawLineGraph = vis.const('drawLineGraph')();
        var dataTransform = vis.const('dataTransform');
        var year = 2009;
        var data = [];
        var fullData = vis.data();

        for(var i in fullData) {    // fullData is already so=rted by year
            var d = fullData[i];
            if(d.year != year)
                continue;

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

        var forecast = vis.stage()
                            .selectAll('path.forecast')
                                .data(data);

        forecast.enter()
                    .append('svg:path')
                    .attr('d', drawLineGraph)
                    .attr('class', 'forecast');

        forecast.exit().remove();
    })
    .add(vis, n3.annotation('line')
                    .attr('id', 'lastLine')
                    .start([600, 180])
                    .end([600, 160])
                    .style('stroke-width', 1)
                    .style('stroke', 'grey')
    )
    .add(vis, n3.annotation('label')
                    .attr('id', 'lastYearLbl')
                    .html('<p>Last year\'s forecast</p>')
                    .pos([560, 125])
    )
    .add(vis, n3.annotation('line')
                    .attr('id', 'latestLine')
                    .start([600, 210])
                    .end([600, 230])
                    .style('stroke-width', 1)
                    .style('stroke', 'grey')
    )
    .add(vis, n3.annotation('label')
                    .attr('id', 'latestLbl')
                    .html('<p>Latest forecast</p>')
                    .pos([565, 225])
    )   
    
n3.scene('scene_3')
    .subScene('scene_3a')
        .set(vis, 'year', 1980)
        .set(vis, 'plotForecasts', true)
        .set(vis, 'year', n3.util.iterate(1980, 1996, 1, 150))
    
        .add(vis, n3.annotation('highlightedPoint')
                        .data(scene34data),            
            n3.trigger(vis)
                .where('year')
                .gte(1995)
        )
        
        .add(vis, n3.annotation('line')
                        .attr('id', 'line1995')
                        .start([332.5, 145])
                        .end([332.5, 195])
                        .style('stroke-width', 1)
                        .style('stroke', 'grey'),
            
                n3.trigger(vis)
                    .where('year')
                    .gte(1995)
        )  
        
        .add(vis, n3.annotation('label')
                        .attr('id', 'lbl1995')
                        .html('<p>The 1995 forecast for 1999<br />did not predict a surplus...</p>')
                        .pos([280, 195]),
            
                n3.trigger(vis)
                    .where('year')
                    .gte(1995)
        )
        
n3.scene('scene_3')
    .subScene('scene_3b')
        .set(vis, 'year', 1995)
        .set(vis, 'plotForecasts', true)
        .set(vis, 'year', n3.util.iterate(1995, 2009, 1, 150))
        
        .add(vis, n3.annotation('highlightedPoint')
                        .data(scene34data),            
            n3.trigger(vis)
                .where('year')
                .gte(2008)
        )

        .add(vis, n3.annotation('line')
                        .attr('id', 'line2008')
                        .start([560, 92])
                        .end([560, 142])
                        .style('stroke-width', 1)
                        .style('stroke', 'grey'),

                n3.trigger(vis)
                    .where('year')
                    .gte(2008)
        )  

        .add(vis, n3.annotation('label')
                        .attr('id', 'lbl2008')
                        .html('<p>... but the 2008<br />forecast for 2012 did.</p>')
                        .pos([520, 142]),

                n3.trigger(vis)
                    .where('year')
                    .gte(2008)
        )
        
n3.scene('scene_3')
    .subScene('scene_3c')
        .set(vis, 'year', 2008)
        .set(vis, 'plotForecasts', true)
        .set(vis, 'year', n3.util.iterate(2008, 2011, 1, 150))

n3.timeline.transition('*', '*', function(fromScene, toScene) {
    $('#' + fromScene.sceneId).hide();
    $('#' + toScene.sceneId).show();
});

n3.timeline.transition(['scene_1', 'scene_2'], 
                            ['scene_3a', 'scene_3b', 'scene_3c', 'scene_4'], 
    function(fromScene, toScene) { $('#slider').show(); })
    
n3.timeline.transition(['scene_3a', 'scene_3b', 'scene_3c', 'scene_4'], 
                            ['scene_1', 'scene_2'], 
    function(fromScene, toScene) { $('#slider').hide(); })

n3.timeline.switchScene('scene_1');

function scene34data() {
    var fullData = vis.data();
    var dataTransform = vis.const('dataTransform');
    var year = vis.state('year');
    var data = [];
    for (var i in fullData) {
        var d = fullData[i];
        if(d.year > year)
            break;

        if(d.year == 1995) 
            data[data.length] = dataTransform(1999, d[1999]);
        
        if(d.year == 2008) 
            data[data.length] = dataTransform(2012, d[2012]);
    }

    return data;
}