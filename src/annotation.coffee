class N3Annotation
    @types = 
        circle: 
            onSceneFn: (r, [cx, cy]) ->
                selector = n3.util.getSelector('circle', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3

                c = stage.selectAll(selector)
                        .data(if @dataObj? then @dataObj else [0])
      
                c.enter()
                    .append('svg:circle')
                        .attr('r', r)
                        .attr('cx', cx)
                        .attr('cy', cy)
                
                c.transition()
                    .attr('r', r)
                    .attr('cx', cx)
                    .attr('cy', cy)            
            
                @applyAttrs c
                @applyStyles c
                
                true
                
            offSceneFn: (r, [cx, cy]) ->
                selector = n3.util.getSelector('circle', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3
                
                stage.selectAll(selector).remove()
            
                true    
            
        ellipse: 
            onSceneFn: ([rx, ry], [cx, cy]) ->
                selector = n3.util.getSelector('ellipse', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3

                e = stage.selectAll(selector)
                        .data(if @dataObj? then @dataObj else [0])
      
                e.enter()
                    .append('svg:ellipse')
                        .attr('rx', rx)
                        .attr('ry', ry)
                        .attr('cx', cx)
                        .attr('cy', cy)
                
                e.transition()
                    .attr('rx', rx)
                    .attr('ry', ry)
                    .attr('cx', cx)
                    .attr('cy', cy)            
            
                @applyAttrs e
                @applyStyles e
                
                true
                
            offSceneFn: ([rx, ry], [cx, cy]) ->
                selector = n3.util.getSelector('ellipse', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3
                
                stage.selectAll(selector).remove()
                
                true

        line: 
            onSceneFn: ([x1, y1], arrow1, [x2, y2], arrow2) ->
                # TODO: add arrowheads
                selector = n3.util.getSelector('line', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3            
            
                l = stage.selectAll(selector)
                        .data(if @dataObj? then @dataObj else [0])
            
                l.enter()
                    .append('svg:line')
                        .attr('x1', x1)
                        .attr('y1', y1)
                        .attr('x2', x2)
                        .attr('y2', y2)
                
                l.transition()
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)    
                       
                @applyAttrs l
                @applyStyles l         
            
                true
            
            offSceneFn: ([x1, y1], arrow1, [x2, y2], arrow2) ->
                selector = n3.util.getSelector('line', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3
                
                stage.selectAll(selector).remove()
                
                true
            
        rectangle: 
            onSceneFn: ([w, h], [x, y]) ->
                selector = n3.util.getSelector('rect', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3            
            
                r = stage.selectAll(selector)
                        .data(if @dataObj? then @dataObj else [0])
            
                r.enter()
                    .append('svg:rect')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('width', w)
                        .attr('height', h)
                
                r.transition()
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', w)
                    .attr('height', h)  
                       
                @applyAttrs r
                @applyStyles r            

                true
                
            offSceneFn: ([w, h], [x, y]) ->
                selector = n3.util.getSelector('rect', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3
                
                stage.selectAll(selector).remove()
                
                true
            
        label: 
            onSceneFn: (text, html, [x, y]) ->
                selector = n3.util.getSelector('div', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3            

                # position the div absolutely
                @styles['position'] = 'absolute'
                @styles['left'] = x + 'px'
                @styles['top'] = y + 'px'
            
                d = d3.select('body').selectAll(selector)
                        .data(if @dataObj? then @dataObj else [0])
            
                d.enter()
                    .append('div')
                        .text(text)
                        .html(html)
                       
                @applyAttrs d
                @applyStyles d
            
                true       
                
            offSceneFn: (text, html, [x, y]) ->
                selector = n3.util.getSelector('div', @attrs)   
                stage = if @visObj? then @visObj.stage() else d3
                
                d3.selectAll(selector).remove()
                
                true
            
    constructor: (@type) ->
        @onSceneFn = N3Annotation.types[@type]?.onSceneFn
        @offSceneFn = N3Annotation.types[@type]?.offSceneFn
        
        @arguments = []
        @attrs = {}
        @styles = {}
        
        return this
        
    onScene: (@onSceneFn) ->
        N3Annotation.types[@type] or= {}
        N3Annotation.types[@type].onSceneFn = onSceneFn
        
        return this
        
    offScene: (@offSceneFn) ->
        N3Annotation.types[@type] or= {}
        N3Annotation.types[@type].offSceneFn = offSceneFn

        return this
        
    data: (data) ->
        if arguments.length == 1
            @dataObj = data
            
            return this
        else
            @dataObj
            
    vis: (vis) ->
        if arguments.length == 1
            @visObj = vis
            
            return this
        else
            @visObj
            
    draw: ->
        @onSceneFn @arguments...
        
    remove: ->
        @offSceneFn @arguments...
    
    args: (@arguments...) ->
        return this
        
    attr: (key, value) ->
        if arguments.length == 2
            @attrs[key] = value
        
            return this
        else
            @attrs[key]
            
    applyAttrs: (selection) ->
        true unless selection?
        selection.attr(key, value) for key, value of @attrs
        true
    
    style: (key, value) ->
        if arguments.length == 2
            @styles[key] = value

            return this
        else
            @styles[key]
            
    applyStyles: (selection) ->
        true unless selection?
        selection.style(key, value) for key, value of @styles
        true
            
    # For built in types, expose arguments as methods. These are only setters.
    radius: (r) ->
        throw 'not an ellipse/circle' unless \
                                        @type == 'circle' or @type == 'ellipse'

        @arguments[0] = r

        return this

    center: ([cx, cy]) ->
        throw 'not an ellipse/circle' unless \
                                        @type == 'circle' or @type == 'ellipse'

        @arguments[1] = [cx, cy]

        return this

    start: ([x, y], arrow) ->
        throw 'not a line' unless @type == 'line'

        @arguments[0] = [x, y]
        @arguments[1] = arrow

        return this

    end: ([x, y], arrow) ->
        throw 'not a line' unless @type == 'line'

        @arguments[2] = [x, y]
        @arguments[3] = arrow   

        return this 

    size: ([x, y]) ->
        throw 'not a rectangle' unless @type == 'rectangle'

        @arguments[0] = [x, y]

        return this

    pos: ([x, y]) ->
        throw 'not a label/rectangle' unless \
                                        @type == 'rectangle' or @type == 'label'

        @arguments[if @type == 'rectangle' then 1 else 2] = [x, y]

        return this

    text: (str) ->
        throw 'not a label' unless @type == 'label'

        @arguments[0] = str

        return this
        
    html: (html) ->
        throw 'not a label' unless @type == 'label'

        @arguments[1] = html

        return this
        
n3.annotation = (typeId) ->
    new N3Annotation(typeId)