class N3Vis
    @lookup = {}    # static lookup table   visId   -> N3Vis
    
    constructor: (@visId) ->
        @states = {}     # lookup table     stateId -> N3State
        @consts = {}     # lookup table     constId -> constVal
        
        return this
        
    stage: (sel, w, h) ->
        if arguments.length == 3
            @stageSelector  = sel
            @stageWidth     = w
            @stageHeight    = h
            
            return this
        else
            d3.select(@stageSelector)            
            
    width: (width) -> 
        if arguments.length == 1
            @stageWidth = width
            
            return this
        else
            @stageWidth
    
    height: (height) -> 
        if arguments.length == 1
            @stageHeight = height

            return this
        else
            @stageHeight
    
    data: (data) ->
        if arguments.length == 1
            @dataObj = data
                        
            return this
        else
            return if typeof @dataObj == 'function' then @dataObj() else @dataObj
    
    state: (stateId, arg2) ->
        if arguments.length == 2        # state can be a setter
            if arg2 instanceof Array    # or a definition of a new state
                @states[stateId] = new N3State(stateId, arg2, @visId)
            else
                @states[stateId]?.set(arg2)
            
            return this
        else
            @states[stateId]?.get()            

    const: (constId, value) ->
        if arguments.length == 2
            # consts are read only, so only add them if they haven't already
            # been defined
            @consts[constId] = value unless constId of @consts
            
            return this
        else
            @consts[constId]   
            # We don't actually want to call the function because people are probably
            # expecting a fn ptr returned. 
            # if typeof constVal == 'function' then constVal.apply(this) else constVal
            
    render: (@renderFn) ->
        return this
        
n3.vis = (visId) ->
    N3Vis.lookup[visId] or= new N3Vis(visId)