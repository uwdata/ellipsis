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
        copy = (clone elem for elem in obj)
    
    else if obj instanceof Object
        copy = {}
        copy[key] = clone val for key, val of obj
        
        return copy