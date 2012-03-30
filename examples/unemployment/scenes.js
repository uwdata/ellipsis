var ch = n3.vis('choropleth');
var ar = n3.vis('annualRates');

var metro = 13;

function showAnnual(id, pt, pos) {  
    pt = d3.select(pt);
    var cx = pt.attr('cx'), cy = pt.attr('cy');
    var px = pos[0], py = pos[1];

   
}

n3.scene('startMap')
    .set(ch, 'zoom', 1)
    .set(ar, 'year', 2004)
    .add(ar, function() {
        $('#annual_rates').hide();
    })
    
    .add(ch, 
         n3.annotation('circle')
             .attr('id', 'la')
             .radius(metro)
             .center([165, 265])
             .autoExit(false)
             .attr('onclick', "n3.timeline.switchScene('la-1');"))
             
     .add(ch, 
          n3.annotation('circle')
              .attr('id', 'ny')
              .radius(metro)
              .center([790, 150])
              .autoExit(false)
              .attr('onclick', "n3.timeline.switchScene('ny-1');"))
              
      .add(ch, 
           n3.annotation('circle')
               .attr('id', 'chi')
               .radius(metro)
               .center([620, 170])
               .autoExit(false)
               .attr('onclick', "n3.timeline.switchScene('chi-1');"))
               
       .add(ch, 
            n3.annotation('circle')
                .attr('id', 'dallas')
                .radius(metro)
                .center([500, 350])
                .autoExit(false)
                .attr('onclick', "n3.timeline.switchScene('dallas-1');"))
                
        .add(ch, 
             n3.annotation('circle')
                 .attr('id', 'philly')
                 .radius(metro)
                 .center([770, 190])
                 .autoExit(false)
                 .attr('onclick', "n3.timeline.switchScene('philly-1');"))
               
n3.timeline.switchScene('startMap');
                               
////////////
// LA src: http://articles.latimes.com/2012/mar/28/business/la-fi-california-economy-ucla-20120328
////////////
                               
n3.scene('la')
    .add(ch, 
         n3.annotation('line')
              .start([165, 265])
              .end([350, 50])
              .attr('id', 'topAnnot')
              .attr('class', 'annotation'))
    .add(ch, 
         n3.annotation('line')
              .start([165, 265])
              .end([350, 350])
              .attr('id', 'bottomAnnot')
              .attr('class', 'annotation'))        
    .add(ar,
         n3.annotation('label')
            .html('<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a>')
            .pos([3, 3])
            .attr('id', 'close')
            .attr('class', 'annotation')
            .style('padding', '0'))

n3.scene('la')
   .clone('la-1')
       .add(ar, function() {
           $('#annual_rates')
               .css('position', 'absolute')
               .css('left', '350px')
               .css('top', '50px')
               .show();
       })
       .set(ar, 'locationId', 'LosAngeles-LongBeach-SantaAnaCAMetropolitanStatisticalArea')
       .set(ar, 'year', n3.util.iterate(2005, 2007, 1, 500))
       .add(ar,
            n3.annotation('line')
                .start([132, 258])
                .end([285, 87])
                .attr('id', 'line_1333050673342')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       .add(ar,
            n3.annotation('label')
                .html("Heading into the recession,&nbsp;" + 
                      "<div>the LA area was performing</div> " + 
                      "<div>marginally better than the&nbsp;</div>" + 
                      "<div>rest of the country... &nbsp;" + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'la-2\')">&rarr;</a></div>')
                .pos([340, 50])
                .attr('id', 'label_1333050730507')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(0))
            

n3.scene('la')
   .clone('la-2')
       .set(ar, 'year', n3.util.iterate(2007, 2010, 1, 500))
       .add(ar,
            n3.annotation('label')
                .html("However, the recession hit LA especially" + 
                      "<div>hard because of the CA budget&nbsp;crisis&nbsp;</div>" + 
                      "<div>which has left many city and local govt.</div>" + 
                      "<div>employees out of work. &nbsp;" + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'la-3\')">&rarr;</a></div>')
                .pos([60, 130])
                .attr('id', 'label_1333054781759')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       
n3.scene('la')
   .clone('la-3')
       .set(ar, 'year', n3.util.iterate(2010, 2012, 1, 500))
       .add('annualRates',
            n3.annotation('label')
                .html("Thankfully, LA is also<br><div>experiencing a recovery.</div>" + 
                      "<div>But with govt. hiring</div><div>remaining weak, and with</div>" + 
                      "<div>the largest share of</div><div>uneducated&nbsp;workers of any&nbsp;</div>" + 
                      "<div>metropolitan area,&nbsp;LA's&nbsp;</div><div>labor market is not</div>" + 
                      "<div>expected to fully recover</div><div>until 2016. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a></div>')
                .pos([390, 165])
                .attr('id', 'label_1333055943386')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
            
////////////
// NY src: http://libertystreeteconomics.newyorkfed.org/2011/05/the-great-recession-and-recovery-in-the-tri-state-region.html
////////////

n3.scene('ny')
    .add(ch, 
         n3.annotation('line')
              .start([790, 150])
              .end([600, 70])
              .attr('id', 'topAnnot')
              .attr('class', 'annotation'))
    .add(ch, 
         n3.annotation('line')
              .start([790, 150])
              .end([600, 350])
              .attr('id', 'bottomAnnot')
              .attr('class', 'annotation'))
    .add(ar,
         n3.annotation('label')
            .html('<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a>')
            .pos([3, 3])
            .attr('id', 'close')
            .attr('class', 'annotation')
            .style('padding', '0'))
   
n3.scene('ny')
   .clone('ny-1')
       .add(ar, function() {
           $('#annual_rates')
               .css('position', 'absolute')
               .css('left', '70px')
               .css('top', '50px')
               .show();
       })
       .set(ar, 'locationId', 'NewYork-NorthernNewJersey-LongIslandNY-NJ-PAMetropolitanStatisticalArea')
       .set(ar, 'year', n3.util.iterate(2005, 2007, 1, 500))
       .add(ar,
            n3.annotation('line')
                .start([132, 258])
                .end([285, 87])
                .attr('id', 'line_1333050673342')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       .add(ar,
            n3.annotation('label')
                .html("Prior to the recession, " + 
                      "<div>unemployment in the New York</div> " + 
                      "<div>tri-state area was in-line</div>" + 
                      "<div>with the rest of the nation. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'ny-2\')">&rarr;</a></div>')
                .pos([340, 50])
                .attr('id', 'label_1333050730507')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(0))
            

n3.scene('ny')
   .clone('ny-2')
       .set(ar, 'year', n3.util.iterate(2007, 2010, 1, 500))
       .add(ar,
            n3.annotation('label')
                .html("As 2008 began, NYC continued to add jobs " + 
                      "<div>for a number of months after the national</div>" + 
                      "<div>recession started. However, by April,</div>" + 
                      "<div>employment began to fall here too, with</div>" + 
                      "<div>September seeing the sharpest job losses. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'ny-3\')">&rarr;</a></div>')
                .pos([60, 130])
                .attr('id', 'label_1333054781759')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       
n3.scene('ny')
   .clone('ny-3')
       .set(ar, 'year', n3.util.iterate(2010, 2012, 1, 500))
       .add('annualRates',
            n3.annotation('label')
                .html("Initial figures seem to" + 
                      "<div>indicate that the Tri-state" + 
                      "<div>area fared better than</div>" + 
                      "<div>other parts of the country,</div>" +
                      "<div>with the recovery taking</div><div>hold here too.</div>" + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a></div>')
                .pos([390, 200])
                .attr('id', 'label_1333055943386')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
               
////////////
// CHI
////////////

n3.scene('chi')
    .add(ch, 
         n3.annotation('line')
              .start([620, 170])
              .end([565, 70])
              .attr('id', 'topAnnot')
              .attr('class', 'annotation'))
    .add(ch, 
         n3.annotation('line')
              .start([620, 170])
              .end([565, 350])
              .attr('id', 'bottomAnnot')
              .attr('class', 'annotation'))
    .add(ar,
         n3.annotation('label')
            .html('<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a>')
            .pos([3, 3])
            .attr('id', 'close')
            .attr('class', 'annotation')
            .style('padding', '0'))

n3.scene('chi')
   .clone('chi-1')
       .add(ar, function() {
           $('#annual_rates')
               .css('position', 'absolute')
               .css('left', '30px')
               .css('top', '50px')
               .show();
       })
       .set(ar, 'locationId', 'Chicago-Joliet-NapervilleIL-IN-WIMetropolitanStatisticalArea')
       .set(ar, 'year', n3.util.iterate(2005, 2007, 1, 500))
       .add(ar,
            n3.annotation('line')
                .start([132, 258])
                .end([285, 87])
                .attr('id', 'line_1333050673342')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       .add(ar,
            n3.annotation('label')
                .html("Prior to the recession, Chicagoland" + 
                      "<div>was adding jobs and the future</div> " + 
                      "<div>looked promising. " +  
                      '<a href="#" onclick="n3.timeline.switchScene(\'chi-2\')">&rarr;</a></div>')
                .pos([340, 50])
                .attr('id', 'label_1333050730507')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(0))


n3.scene('chi')
   .clone('chi-2')
       .set(ar, 'year', n3.util.iterate(2007, 2010, 1, 500))
       .add(ar,
            n3.annotation('label')
                .html("Through the recession, Chicagoland " + 
                      "<div>exhibited job loss rates that were</div>" + 
                      "<div>representative of the nation at large. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'chi-3\')">&rarr;</a></div>')
                .pos([60, 130])
                .attr('id', 'label_1333054781759')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))

n3.scene('chi')
   .clone('chi-3')
       .set(ar, 'year', n3.util.iterate(2010, 2012, 1, 500))
       .add('annualRates',
            n3.annotation('label')
                .html("Although unemployment" + 
                      "<div>remains higher than the" + 
                      "<div>national average,</div>" + 
                      "<div>Chicagoland appears to be </div>" + 
                      "<div>experiencing recovery</div>" +
                      "<div>on track with the other </div>" + 
                      "<div>areas. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a></div>')
                .pos([390, 200])
                .attr('id', 'label_1333055943386')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
            
////////////
// DALLAS
////////////

n3.scene('dallas')
    // .add(ch, 
    //      n3.annotation('line')
    //           .start([620, 170])
    //           .end([565, 70])
    //           .attr('id', 'topAnnot')
    //           .attr('class', 'annotation'))
    // .add(ch, 
    //      n3.annotation('line')
    //           .start([620, 170])
    //           .end([565, 350])
    //           .attr('id', 'bottomAnnot')
    //           .attr('class', 'annotation'))
    .add(ar,
         n3.annotation('label')
            .html('<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a>')
            .pos([3, 3])
            .attr('id', 'close')
            .attr('class', 'annotation')
            .style('padding', '0'))

n3.scene('dallas')
   .clone('dallas-1')
       .add(ar, function() {
           $('#annual_rates')
               .css('position', 'absolute')
               .css('left', '200px')
               .css('top', '0px')
               .show();
       })
       .set(ar, 'locationId', 'Dallas-FortWorth-ArlingtonTXMetropolitanStatisticalArea')
       .set(ar, 'year', n3.util.iterate(2005, 2007, 1, 500))
       .add(ar,
            n3.annotation('line')
                .start([132, 258])
                .end([285, 87])
                .attr('id', 'line_1333050673342')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       .add(ar,
            n3.annotation('label')
                .html("Prior to the recession, Dallas" + 
                      "<div>was facing unemployment rates</div> " + 
                      "<div>higher than the national average,</div>" +
                      "<div>but jobs were being added at a</div>" + 
                      "<div>fairly steady clip. " +  
                      '<a href="#" onclick="n3.timeline.switchScene(\'dallas-2\')">&rarr;</a></div>')
                .pos([340, 50])
                .attr('id', 'label_1333050730507')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(0))


n3.scene('dallas')
   .clone('dallas-2')
       .set(ar, 'year', n3.util.iterate(2007, 2010, 1, 500))
       .add(ar,
            n3.annotation('label')
                .html("Sustained job growth through 2007" + 
                      "<div>meant that Dallas entered the recession</div>" + 
                      "<div>in better shape than other parts</div>" + 
                      "<div>of the nation. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'dallas-3\')">&rarr;</a></div>')
                .pos([60, 130])
                .attr('id', 'label_1333054781759')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))

n3.scene('dallas')
   .clone('dallas-3')
       .set(ar, 'year', n3.util.iterate(2010, 2012, 1, 500))
       .add('annualRates',
            n3.annotation('label')
                .html("Peak unemployment in" + 
                      "<div>Dallas remained significantly " + 
                      "<div>lower than the national</div>" + 
                      "<div>peak, and Dallas looks to</div>" + 
                      "<div>remain one of the strongest</div>" +
                      "<div>metropolitan areas in </div>" + 
                      "<div>the country. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a></div>')
                .pos([390, 210])
                .attr('id', 'label_1333055943386')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))

////////////
// PHILLY src: http://www.bizjournals.com/philadelphia/news/2011/12/20/philadelphia-unemployment-rate-dips.html
               http://articles.philly.com/2011-12-03/news/30471971_1_jobless-rate-unemployment-rate-government-job-cuts
////////////

n3.scene('philly')
    .add(ch, 
         n3.annotation('line')
              .start([770, 190])
              .end([600, 70])
              .attr('id', 'topAnnot')
              .attr('class', 'annotation'))
    .add(ch, 
         n3.annotation('line')
              .start([770, 190])
              .end([600, 350])
              .attr('id', 'bottomAnnot')
              .attr('class', 'annotation'))
    .add(ar,
         n3.annotation('label')
            .html('<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a>')
            .pos([3, 3])
            .attr('id', 'close')
            .attr('class', 'annotation')
            .style('padding', '0'))

n3.scene('philly')
   .clone('philly-1')
       .add(ar, function() {
           $('#annual_rates')
               .css('position', 'absolute')
               .css('left', '70px')
               .css('top', '60px')
               .show();
       })
       .set(ar, 'locationId', 'Philadelphia-Camden-WilmingtonPA-NJ-DE-MDMetropolitanStatisticalArea')
       .set(ar, 'year', n3.util.iterate(2005, 2007, 1, 500))
       .add(ar,
            n3.annotation('line')
                .start([132, 258])
                .end([285, 87])
                .attr('id', 'line_1333050673342')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))
       .add(ar,
            n3.annotation('label')
                .html("Prior to the recession, Philly's" + 
                      "<div>unemployment rate was below</div> " + 
                      "<div>the national average, but it</div>" +
                      "<div>appeared that the job rate was</div>" + 
                      "<div>slowing. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'philly-2\')">&rarr;</a></div>')
                .pos([340, 50])
                .attr('id', 'label_1333050730507')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(0))


n3.scene('philly')
   .clone('philly-2')
       .set(ar, 'year', n3.util.iterate(2007, 2010, 1, 500))
       .add(ar,
            n3.annotation('label')
                .html("Unfortunately, the recession hit" + 
                      "<div>Philly particularly hard, which saw</div>" + 
                      "<div>a sharp rise in unemployment,</div>" + 
                      "<div>closely tailing the national average. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'philly-3\')">&rarr;</a></div>')
                .pos([60, 130])
                .attr('id', 'label_1333054781759')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))

n3.scene('philly')
   .clone('philly-3')
       .set(ar, 'year', n3.util.iterate(2010, 2012, 1, 500))
       .add('annualRates',
            n3.annotation('label')
                .html("Although below the national" + 
                      "<div>average, Philly remains " + 
                      "<div>fifth-highest among the</div>" + 
                      "<div>20 largest U.S. cities, </div>" + 
                      "<div>behind Detroit, LA, Chicago</div>" +
                      "<div>and Memphis. " + 
                      '<a href="#" onclick="n3.timeline.switchScene(\'startMap\')">[close]</a></div>')
                .pos([390, 210])
                .attr('id', 'label_1333055943386')
                .attr('class', 'annotation'),
            n3.trigger.afterPrev(1500))