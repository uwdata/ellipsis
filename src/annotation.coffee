class N3Annotation
    @types = 
        circle: (r, [cx, cy]) ->
            selector = n3.util.getSelector('circle', @attrs)   
            stage = if @visObj? then @visObj.stage() else d3

            c = stage.selectAll(selector)
                    .data(if @dataObj? then @dataObj else [0])
      
            ca = c.enter()
                    .append('svg:circle')
                        .attr('r', r)
                        .attr('cx', cx)
                        .attr('cy', cy)
                        
            @applyAttrs ca
            @applyStyles ca
                
            ct = c.transition()
                    .attr('r', r)
                    .attr('cx', cx)
                    .attr('cy', cy)            
            
            @applyAttrs ct
            @applyStyles ct
                
            c.exit().remove()
            
        ellipse: ([rx, ry], [cx, cy]) ->
            selector = n3.util.getSelector('ellipse', @attrs)   
            stage = if @visObj? then @visObj.stage() else d3

            e = stage.selectAll(selector)
                    .data(if @dataObj? then @dataObj else [0])
      
            ea = e.enter()
                    .append('svg:ellipse')
                        .attr('rx', rx)
                        .attr('ry', ry)
                        .attr('cx', cx)
                        .attr('cy', cy)
                        
            @applyAttrs ea
            @applyStyles ea
                
            et = e.transition()
                    .attr('rx', rx)
                    .attr('ry', ry)
                    .attr('cx', cx)
                    .attr('cy', cy)            
            
            @applyAttrs et
            @applyStyles et
                
            e.exit().remove()

        line: ([x1, y1], arrow1, [x2, y2], arrow2) ->
            # TODO: add arrowheads
            selector = n3.util.getSelector('line', @attrs)   
            stage = if @visObj? then @visObj.stage() else d3            
            
            l = stage.selectAll(selector)
                    .data(if @dataObj? then @dataObj else [0])
            
            la = l.enter()
                    .append('svg:line')
                        .attr('x1', x1)
                        .attr('y1', y1)
                        .attr('x2', x2)
                        .attr('y2', y2)
                    
            @applyAttrs la
            @applyStyles la
                
            lt = l.transition()
                    .attr('x1', x1)
                    .attr('y1', y1)
                    .attr('x2', x2)
                    .attr('y2', y2)    
                       
            @applyAttrs lt
            @applyStyles lt            
                
            l.exit().remove()            
            
        rectangle: ([w, h], [x, y]) ->
            selector = n3.util.getSelector('rect', @attrs)   
            stage = if @visObj? then @visObj.stage() else d3            
            
            r = stage.selectAll(selector)
                    .data(if @dataObj? then @dataObj else [0])
            
            ra = r.enter()
                    .append('svg:rect')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('width', w)
                        .attr('height', h)
                    
            @applyAttrs ra
            @applyStyles ra
                
            rt = r.transition()
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', w)
                    .attr('height', h)  
                       
            @applyAttrs rt
            @applyStyles rt            
                
            r.exit().remove()
            
        label: (text, html, [x, y]) ->
            selector = n3.util.getSelector('div', @attrs)   
            stage = if @visObj? then @visObj.stage() else d3            

            # position the div absolutely
            @styles['position'] = 'absolute'
            @styles['x'] = x
            @styles['top'] = y
            
            d = stage.selectAll(selector)
                    .data(if @dataObj? then @dataObj else [0])
            
            da = r.enter()
                    .append('div')
                        .text(text)
                        .html(html)
                    
            @applyAttrs da
            @applyStyles da
                
            dt = d.transition()
                    .text(text)
                    .html(html) 
                       
            @applyAttrs dt
            @applyStyles dt            
                
            d.exit().remove()            
            
    constructor: (@type) ->
        @templateFn = N3Annotation.types[@type]
        @arguments = []
        
        return this
        
    template: (@templateFn) ->
        N3Annotation.types[@type] = @templateFn
        
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
        @templateFn @arguments...
    
    args: (@arguments...) ->
        return this
        
    attr: (key, value) ->
        if arguments.length == 2
            @attrs[key] = value
        
            return this
        else
            @attrs[key]
            
    applyAttrs: (obj) ->
        obj.attr(key, value) for key, value of @attrs
        true
    
    style: (key, value) ->
        if arguments.length == 2
            @styles[key] = value

            return this
        else
            @styles[key]
            
    applyStyles: (obj) ->
        obj.style(key, value) for key, value of @styles
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