jQuery.fn.getPath = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    
    if(node.attr('id'))
        return '#' + node.attr('id');
    
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;
        name = name.toLowerCase();
        // Only go up to the visualization's stage element though 
        // (which definitely have an ID)
        // TODO: how to make this work w/non-svg stages?
        if(name == 'svg')
            return '#' + node.attr('id') + (path ? '>' + path : '');

        var parent = node.parent();

        var siblings = parent.children(name);
        if (siblings.length > 1) { 
            name += ':eq(' + siblings.index(realNode) + ')';
        }

        path = name + (path ? '>' + path : '');
        node = parent;
    }

    return path;
};