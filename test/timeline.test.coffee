describe "timeline", ->
    scene1 = null
    scene2 = null
    vis = null
    
    beforeEach ->
        d3.select('body')
            .append('svg:svg')
                .attr('id', 'stage')
                .attr('width', 500)
                .attr('height', 600)
                
        vis = n3.vis('visTimelineTest')
                    .stage('#stage', 500, 600)
                    .state('state_1', ['valid', 'values'])
                    .state('state_2', [true, false])
                    .render(->
                        console.log('timelineTest render');
                    )
                    
    afterEach ->
        vis = null
        d3.selectAll('#stage').remove()
    
    # Simple scene switching, tests that members are added/removed
    it "switches simple scenes", ->                    
        scene1 = n3.scene('timelineScene_1')
                    .set('visTimelineTest', 'state_1', 'valid')
                    .add('visTimelineTest', n3.annotation('circle')
                                            .radius(5)
                                            .center([1, 2])
                                            .attr('id', 'hello'))
                    .set('visTimelineTest', 'state_2', true)
                    .add('visTimelineTest', n3.annotation('circle')
                                            .radius(7)
                                            .center([8, 4])
                                            .attr('id', 'goodbye')
                                            .autoExit(false))
                
        scene2 = n3.scene('timelineScene_2')
                        .add('visTimelineTest', n3.annotation('rectangle')
                                                .size([5, 15])
                                                .pos([1, 11]))
                        .set('visTimelineTest', 'state_1', 'values')
                        .set('visTimelineTest', 'state_2', false)
                        
        n3.timeline.switchScene('timelineScene_1')                        
        expect(vis.state('state_1')).toBe 'valid'
        expect(vis.state('state_2')).toBe true
        expect(d3.selectAll('circle')[0].length).toBe 2
        
        n3.timeline.switchScene('timelineScene_2')
        expect(vis.state('state_1')).toBe 'values'
        expect(vis.state('state_2')).toBe false
        expect(d3.selectAll('circle')[0].length).toBe 1
        expect(d3.selectAll('rect')[0].length).toBe 1
        
    it "registers and fires triggers", ->
        n3.timeline.switchScene('timelineScene_1') 
        n3.timeline.switchScene('timelineScene_2')
        
        scene3 = n3.scene('timelineScene_3')
                    .add(vis, 
                            n3.annotation('ellipse')
                                .attr('id', 'foo')
                                .radius([1, 2])
                                .center([3, 4]), 
                                        n3.trigger(vis)
                                            .where('state_1')
                                            .is('valid'))
                    .add(vis, 
                            n3.annotation('line')
                                .attr('id', 'bar')
                                .start([1, 2])
                                .end([3, 4]),
                                    n3.trigger(vis)
                                        .where('state_2')
                                        .is(true))
                                        
        n3.timeline.switchScene('timelineScene_3')
        expect(vis.state('state_1')).toBe 'values'
        expect(vis.state('state_2')).toBe false
        vis.state('state_2', true)
        expect(d3.selectAll('circle')[0].length).toBe 1
        expect(d3.selectAll('rect')[0].length).toBe 0
        expect(d3.selectAll('ellipse')[0].length).toBe 0
        expect(d3.selectAll('line')[0].length).toBe 1
        
        vis.state('state_1', 'valid')
        expect(d3.selectAll('ellipse')[0].length).toBe 1
        
    it "delay triggers", ->
        vis.state('state_1', 'valid')        
        vis.state('state_2', true)
        
        n3.timeline.switchScene('timelineScene_1')
        
        expect(d3.selectAll('circle')[0].length).toBe 2
        expect(d3.selectAll('rect')[0].length).toBe 0
        expect(d3.selectAll('ellipse')[0].length).toBe 0
        expect(d3.selectAll('line')[0].length).toBe 0
        
        expect(vis.state('state_1')).toBe 'valid'
        expect(vis.state('state_2')).toBe true
        
        scene4 = n3.scene('timelineScene_4')
                    .add(vis, 
                            n3.annotation('ellipse')
                                .attr('id', 'foo')
                                .radius([1, 2])
                                .center([3, 4]), 
                                        n3.trigger(vis)
                                            .where('state_1')
                                            .is('values'))
                    .add(vis, 
                            n3.annotation('line')
                                .attr('id', 'bar')
                                .start([1, 2])
                                .end([3, 4]),
                                    n3.trigger.afterPrev(1))        
                                    
        n3.timeline.switchScene('timelineScene_4')
        expect(d3.selectAll('ellipse')[0].length).toBe 0
        expect(d3.selectAll('line')[0].length).toBe 0
        
        vis.state('state_2', false)
        expect(vis.state('state_2')).toBe false
        expect(d3.selectAll('circle')[0].length).toBe 1
        expect(d3.selectAll('rect')[0].length).toBe 0
        expect(d3.selectAll('ellipse')[0].length).toBe 0
        expect(d3.selectAll('line')[0].length).toBe 0
        
        vis.state('state_1', 'values')
        expect(d3.selectAll('ellipse')[0].length).toBe 1
        # expect(d3.selectAll('line')[0].length).toBe 1             
    
    it "transitions scenes", ->
        n3.timeline.switchScene('timelineScene_1')
        
        t1 = (fromScene, toScene) ->
            console.log('t1: ' + fromScene.sceneId + ' -> ' + toScene.sceneId)
            
        t2 = (fromScene, toScene) ->
            console.log('t2: ' + fromScene.sceneId + ' -> ' + toScene.sceneId)
            
        t3 = (fromScene, toScene) ->
            console.log('t3: ' + fromScene.sceneId + ' -> ' + toScene.sceneId)
            
        n3.timeline.transition('*', '*', t1)
                    .transition('timelineScene_3', 'timelineScene_1', t2)
                    .transition(['timelineScene_3'], ['timelineScene_2', 'timelineScene_4'], t3)
        
        n3.timeline.switchScene('timelineScene_2')
        n3.timeline.switchScene('timelineScene_4')
        n3.timeline.switchScene('timelineScene_3')
        n3.timeline.switchScene('timelineScene_1')

        n3.timeline.switchScene('timelineScene_3')
        n3.timeline.switchScene('timelineScene_2')
        n3.timeline.switchScene('timelineScene_1')
        
        n3.timeline.switchScene('timelineScene_3')
        n3.timeline.switchScene('timelineScene_4')
        n3.timeline.switchScene('timelineScene_2')
        
        n3.timeline.switchScene('timelineScene_3')
        n3.timeline.switchScene('timelineScene_1')