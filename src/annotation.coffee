class N3Annotation
    @types = 
        circle: 
            enterFn: (r, [cx, cy]) ->
                selector = n3.util.getSelector('circle', @attrs)   
                stage = if @vis()? then @vis().stage() else d3

                c = stage.selectAll(selector)
                        .data(if @data()? then @data() else [0])
      
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
                
            exitFn: (r, [cx, cy]) ->
                selector = n3.util.getSelector('circle', @attrs)   
                stage = if @vis()? then @vis().stage() else d3
                
                stage.selectAll(selector).remove()
            
                true    
            
        ellipse: 
            enterFn: ([rx, ry], [cx, cy]) ->
                selector = n3.util.getSelector('ellipse', @attrs)   
                stage = if @vis()? then @vis().stage() else d3

                e = stage.selectAll(selector)
                        .data(if @data()? then @data() else [0])
      
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
                
            exitFn: ([rx, ry], [cx, cy]) ->
                selector = n3.util.getSelector('ellipse', @attrs)   
                stage = if @vis()? then @vis().stage() else d3
                
                stage.selectAll(selector).remove()
                
                true

        line: 
            enterFn: ([x1, y1], arrow1, [x2, y2], arrow2) ->
                # TODO: add arrowheads
                selector = n3.util.getSelector('line', @attrs)   
                stage = if @vis()? then @vis().stage() else d3            
            
                l = stage.selectAll(selector)
                        .data(if @data()? then @data() else [0])
            
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
            
            exitFn: ([x1, y1], arrow1, [x2, y2], arrow2) ->
                selector = n3.util.getSelector('line', @attrs)   
                stage = if @vis()? then @vis().stage() else d3
                
                stage.selectAll(selector).remove()
                
                true
            
        rectangle: 
            enterFn: ([w, h], [x, y]) ->
                selector = n3.util.getSelector('rect', @attrs)   
                stage = if @vis()? then @vis().stage() else d3            
            
                r = stage.selectAll(selector)
                        .data(if @data()? then @data() else [0])
            
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
                
            exitFn: ([w, h], [x, y]) ->
                selector = n3.util.getSelector('rect', @attrs)   
                stage = if @vis()? then @vis().stage() else d3
                
                stage.selectAll(selector).remove()
                
                true
            
        label: 
            enterFn: (text, html, [x, y]) ->
                selector = n3.util.getSelector('div', @attrs)   
                stage = if @vis()? then @vis().stage() else d3            

                # position the div absolutely
                @styles['position'] = 'absolute'
                @styles['left'] = (stage.property('offsetLeft') + x) + 'px'
                @styles['top'] = (stage.property('offsetTop') + y) + 'px'
                
                d = d3.select(stage[0][0].parentNode).selectAll(selector)
                        .data(if @data()? then @data() else [0])
            
                d.enter()
                    .append('div')
                        .text(text)
                        .html(html)
                       
                @applyAttrs d
                @applyStyles d
            
                true       
                
            exitFn: (text, html, [x, y]) ->
                selector = n3.util.getSelector('div', @attrs)   
                stage = if @vis()? then @vis().stage() else d3
                
                d3.selectAll(selector).remove()
                
                true
            
    constructor: (@type) ->
        @enterFn = N3Annotation.types[@type]?.enterFn
        @exitFn = N3Annotation.types[@type]?.exitFn
        
        @annotId = @type + "" + new Date().getTime()   
        @autoExitFlag = true
        @arguments = []
        @attrs = {}
        @styles = {}
        
        return this
        
    enter: (@enterFn) ->
        N3Annotation.types[@type] or= {}
        N3Annotation.types[@type].enterFn = enterFn
        
        return this
        
    exit: (@exitFn) ->
        N3Annotation.types[@type] or= {}
        N3Annotation.types[@type].exitFn = exitFn

        return this
        
    autoExit: (@autoExitFlag) ->
        return this
        
    data: (data) ->
        if arguments.length == 1
            @dataObj = data
            
            return this
        else
            return if typeof @dataObj == 'function' then @dataObj() else @dataObj
            
    vis: (vis) ->
        if arguments.length == 1
            vis = vis.visId if typeof vis == 'object'
            @visId = vis
            
            return this
        else
            N3Vis.lookup[@visId]
            
    add: ->
        @enterFn @arguments...
        
    remove: ->
        @exitFn @arguments...
    
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
    
n3.annotation.def = (typeId) ->
    new N3Annotation(typeId)