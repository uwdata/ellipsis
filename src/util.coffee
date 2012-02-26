n3.util = {}

n3.util.getSelector = (selector, attrs) ->
    if attrs?.id?
        selector + '#' + @attrs['id']
    else if attrs?.class?
        selector + '.' + @attrs['class'].split(' ').join('.')
    else
        selector