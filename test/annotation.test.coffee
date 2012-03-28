describe 'annotation', ->        
    vis = null
    
    beforeEach ->         
        d3.select('body')
            .append('svg:svg')
                .attr('id', 'stage')
                .attr('width', 500)
                .attr('height', 600)
                
        vis = n3.vis('annotation_test')
                    .stage('#stage', 500, 600)
                    
    afterEach ->
        vis = null
        d3.selectAll('#stage').remove()
                    
    it 'sets/gets the vis', ->
        a = n3.annotation('custom').vis(vis)
        
        expect(a.vis().stage()).toEqual d3.select('#stage')
        expect(a.vis().width()).toBe 500
        expect(a.vis().height()).toBe 600
        
    it 'sets/gets data', ->  
        d = ['do', 're', 'mi', 'fa', 'so']
        
        # Testing if .data() sets and is chainable
        expect(n3.annotation('custom').data(d).data()).toBe d
        
        # Testing if .data() supports different data types
        d1 = {Jagger: 'Rock', Elvis: 'Roll'}
        expect(n3.annotation('custom').data(d1).data()).toBe d1
        
        d2 = 
            brother:
                name: 'Max'
                age:  11
              sister:
                name: 'Ida'
                age:  9
        
        expect(n3.annotation('custom').data(d2).data()).toBe d2
        
        # Tests that .data is not set for another vis
        expect(n3.annotation('custom2').data()).toBeUndefined
        
    it 'is a custom annotation', ->
        f = (arg1, arg2) ->
            console.log('Arg1: ' + arg1 + ' Arg2: ' + arg2)
            
        f1 = (arg1, arg2) ->
            console.log('F1Arg1: ' + arg1 + ' F1Arg2: ' + arg2)
            
        a = n3.annotation('custom')
        expect(a.enterFn).toBeUndefined
        
        a.enter(f)
            .exit(f1)
            .args('hello', [1, 2, 3], { 'foo': 'bar' }, 'world')
                
        expect(a.enterFn).toBe f
        expect(a.exitFn).toBe f1
        
        spyOn(a, 'enterFn')
        a.add()        
        expect(a.enterFn).toHaveBeenCalledWith('hello', [1, 2, 3], { 'foo': 'bar' }, 'world')
        
        spyOn(a, 'exitFn')
        a.remove()        
        expect(a.exitFn).toHaveBeenCalledWith('hello', [1, 2, 3], { 'foo': 'bar' }, 'world')
        
    it 'is a circle', ->
        a = n3.annotation('circle')
                .center([15, 45])
                .radius(5)
                .data([1])  # to test chaining
                
        spyOn(a, 'enterFn')
        a.add()        
        expect(a.enterFn).toHaveBeenCalledWith(5, [15, 45])
        
        spyOn(a, 'exitFn')
        a.remove()        
        expect(a.exitFn).toHaveBeenCalledWith(5, [15, 45])
        
    it 'draws a circle', ->
        a = n3.annotation('circle')
                .center([15, 45])
                .radius(5)
                .vis(vis)
                
        a.add()
        
        c = vis.stage().selectAll('circle')
        expect(c.attr('r')).toBe '5'
        expect(c.attr('cx')).toBe '15'
        expect(c.attr('cy')).toBe '45'
        
    it 'is an ellipse', ->
        a = n3.annotation('ellipse')
                .radius([3, 7])
                .center([11, 21])
                .data([2])  # to test chaining
                
        spyOn(a, 'enterFn')
        a.add()
        expect(a.enterFn).toHaveBeenCalledWith([3, 7], [11, 21])
        
        spyOn(a, 'exitFn')
        a.remove()
        expect(a.exitFn).toHaveBeenCalledWith([3, 7], [11, 21])   
        
    it 'draws an ellipse', ->
        a = n3.annotation('ellipse')
                .radius([3, 7])
                .center([11, 21])
                .vis(vis)

        a.add()

        e = vis.stage().selectAll('ellipse')
        expect(e.attr('rx')).toBe '3'
        expect(e.attr('ry')).toBe '7'
        expect(e.attr('cx')).toBe '11'
        expect(e.attr('cy')).toBe '21'     
        
    it 'is a line', ->
        a = n3.annotation('line')
                .start([6, 8], true)
                .end([32, 12], false)
                .data([3])  # to test chaining
                
        spyOn(a, 'enterFn')
        a.add()        
        expect(a.enterFn).toHaveBeenCalledWith([6, 8], true, [32, 12], false)
        
        spyOn(a, 'exitFn')
        a.remove()        
        expect(a.exitFn).toHaveBeenCalledWith([6, 8], true, [32, 12], false)
        
    it 'draws a line', ->
        a = n3.annotation('line')
                .start([6, 8], true)
                .end([32, 12], false)
                .vis(vis)

        a.add()

        l = vis.stage().selectAll('line')
        expect(l.attr('x1')).toBe '6'
        expect(l.attr('y1')).toBe '8'
        expect(l.attr('x2')).toBe '32'
        expect(l.attr('y2')).toBe '12'
        
    it 'is a rectangle', ->
        a = n3.annotation('rectangle')
                .pos([17, 14])
                .size([42, 91])
                .data([4])  # to test chaining

        spyOn(a, 'enterFn')
        a.add()
        expect(a.enterFn).toHaveBeenCalledWith([42, 91], [17, 14]) 
        
        spyOn(a, 'exitFn')
        a.remove()
        expect(a.exitFn).toHaveBeenCalledWith([42, 91], [17, 14])
        
    it 'draws a rectangle', ->
        a = n3.annotation('rectangle')
                .pos([17, 14])
                .size([42, 91])
                .vis(vis)

        a.add()

        r = vis.stage().selectAll('rect')
        expect(r.attr('width')).toBe '42'
        expect(r.attr('height')).toBe '91'
        expect(r.attr('x')).toBe '17'
        expect(r.attr('y')).toBe '14'
        
    it 'is a label', ->
        a = n3.annotation('label')
                .html('<p>Hello</p>')
                .text('world')
                .pos([3, 7])
                .data([4])  # to test chaining

        spyOn(a, 'enterFn')
        a.add()
        expect(a.enterFn).toHaveBeenCalledWith('world', '<p>Hello</p>', [3, 7])
        
        spyOn(a, 'exitFn')
        a.remove()
        expect(a.exitFn).toHaveBeenCalledWith('world', '<p>Hello</p>', [3, 7])               

    it 'draws a label', ->
        a = n3.annotation('label')
                .html('<p>Hello</p>')
                .text('world')
                .pos([3, 7])
                .attr('id', 'label')
                .vis(vis)
    
        a.add()    
        
        d = d3.selectAll('div#label')
        
        expect(d.style('position')).toBe 'absolute' 
        expect(d.style('left')).toBe '11px'
        expect(d.style('top')).toBe '15px'
        expect(d.html()).toBe '<p>Hello</p>'
        
    it 'sets/gets attrs', ->
        a = n3.annotation('circle')
                .center([15, 45])
                .radius(5)
                .attr('foo', 'baz')
                .attr('r', '15')
                .style('position', 'absolute')
                .vis(vis)
                
        a.add()
        
        c = vis.stage().selectAll('circle')
        expect(c.attr('foo')).toBe 'baz'
        expect(c.attr('r')).toBe '15'
        
    it 'sets/gets styles', ->
        a = n3.annotation('circle')
                .center([15, 45])
                .radius(5)
                .style('display', 'none')
                .style('fill', '#ffffff')
                .vis(vis)
                
        a.add()
        
        c = vis.stage().selectAll('circle')
        expect(c.style('display')).toBe 'none'
        expect(c.style('fill')).toBe '#FFFFFF'        
        