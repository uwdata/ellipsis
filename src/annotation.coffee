class N3Annotation
    @types = 
        circle: (r, [cx, cy]) ->
            # A circle is just a special type of ellipse
            N3Annotation.types.ellipse([r, r], [cx, cy])
            
        ellipse: ([r1, r2], [cx, cy]) ->
            
        line: ([sx, sy], sArrow, [ex, ey], eArrow) ->
            
        rectangle: ([w, y], corner, [x, y]) ->
            
        label: (text, html, [x, y]) ->
            
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
        @attrs[key] = value
        
        return this
    
    style: (key, value) ->
        @styles[key] = value
        
        return this
            
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

    pos: (arg1, arg2) ->
        throw 'not a label/rectangle' unless \
                                        @type == 'rectangle' or @type == 'label'

        if arguments.length == 1    # line
            @arguments[2] = arg1    # arg1 = [x, y]
        else 
        if arguments.length == 2    # rectangle
            @arguments[1] = arg1    # arg1 = corner
            @arguments[2] = arg2    # arg2 = [x, y]

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