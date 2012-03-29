n3.util = {}

n3.util.getSelector = (selector, attrs) ->
    if attrs?.id?
        selector + '#' + attrs['id']
    else if attrs?.class?
        selector + '.' + attrs['class'].split(' ').join('.')
    else
        selector
        
n3.util.clone = (obj) ->
    return obj unless obj? and typeof obj == 'object'
    
    if obj instanceof Array
        copy = (n3.util.clone elem for elem in obj)
    
    else if obj instanceof Object
        copy = {}
        copy[key] = n3.util.clone val for key, val of obj
        
        return copy
        
n3.util.iterate = (args...) ->
    arr = []
    step = args[args.length - 2]
    delay = args[args.length - 1]
    
    if arguments.length == 3
        arr   = args[0]
    else if arguments.length == 4
        arr   = d3.range(args[0], args[1], step)    
        
    return (vis, stateId) ->
        currIndex = 0
        
        callback = ->
            vis.state(stateId, arr[currIndex++])            
            window.clearInterval(interval) if currIndex >= arr.length

        interval = window.setInterval(callback, delay)
        false