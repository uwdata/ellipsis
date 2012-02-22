class N3State
    constructor: (@stateId, @validValues, @visId) ->

    get: ->
        @val

    set: (val) ->
        @prevVal = @val
        @val = val
        
        @notify()
        
    notify: ->
        N3Vis.lookup[@visId]?.renderFn();