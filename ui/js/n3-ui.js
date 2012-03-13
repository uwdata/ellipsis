var SHAPES = {
    CIRCLE: 0,
    ELLIPSE: 1,
    LINE: 2,
    ARROW: 3,
    RECTANGLE: 4,
    LABEL: 5
};
var SHAPE_LABELS = ['circle', 'ellipse', 'line', 'arrow', 'rectangle', 'label'];
var visIds = [];
var scenes = {};
var sceneId;

$(function() {
    $(document).ready(function() {
        $('#n3-ui_visDialog').dialog({
            modal: true,
            width: 500
        });
        
        $('#n3-ui_triggerDialog').dialog({
            modal: true,
            autoOpen: false
        });
        
        $('#n3-ui_stylesDialog').dialog({
            autoOpen: false,
            width: 400
        });
        
        $('#n3-ui_exportDialog').dialog({
            modal: true,
            autoOpen: false,
            width: 500
        });
        
        $('#n3-ui_side_panel').sortable();
        $('#n3-ui_side_panel').disableSelection();
    });
})

function saveVis() {
    var closeDialog = true;
    var visJs = $('#vis').val();
    // TODO: sanitze visJS
    eval(visJs);
    
    var visArr = visJs.match(/n3\.vis\(('|")(.*?)('|")\)/ig);
    for(var i in visArr) {
        visArr[i].match(/n3\.vis\(('|")(.*?)('|")\)/i);
        var visId = RegExp.$2;
        visIds.push(visId);
        
        var vis = n3.vis(visId);
        if(!vis.stageSelector || !vis.width() || !vis.height()) {
            closeDialog = false;
            alert('Vis "' + visId + '" doesn\'t have a stage set')
            continue;
        }
        
        if(!vis.renderFn) {
            closeDialog = false;
            alert('Vis "' + visId + '" doesn\'t have a render function')
            continue;
        }
        
        $('#n3-ui_stage')           // Need to replace this for other selector types
            .append('<div id="n3-vis_' + visId + '" class="n3-vis_stage">' + 
                        '<svg id="' + vis.stageSelector.replace('#', '') + '" width="' + vis.width() + 
                            '" height="' + vis.height() + '"></svg></div>');
        
        var stateSettings = '<div class="state_settings">';                    
        for(var stateId in vis.states) {
            var s = vis.states[stateId];
            stateSettings += '<p>' + stateId + ': ' + 
                '<select onchange="setState(\'' + visId + '\',\'' + stateId + '\', $(this).val())"><option value="">Select...</option>';
            
            for(var i in s.validValues)
                stateSettings += '<option>' + s.validValues[i] + '</option>';
            
            stateSettings += '</select>';
        }                    
        stateSettings += '</div>';
        $('#n3-vis_' + visId)
            .append(stateSettings)
            
        $('#n3-vis_' + visId + ' .state_settings')
            .width(vis.width())
            .hide();
    }
    
    if(closeDialog)
        $('#n3-ui_visDialog').dialog('close')
}

function startScene() {
    $('.n3-ui_member' + sceneId).hide();
    
    sceneId = prompt("Enter a scene ID: ");
    scenes[sceneId] = { id: sceneId };
    
    $('.state_settings').show();
    $('#n3-ui_startScene').hide();
    $('#n3-ui_endScene').show();
    $('#n3-ui_palette').show();
    
    $('#n3-ui_side_panel')
        .append('<div class="scene" id="n3-scene_' + sceneId 
                    + '"><div class="scene-header">Scene: ' + sceneId + '</div><div class="scene-content"><ul class="members"></ul></div></div>');
    
    $('#n3-scene_' + sceneId)
        .addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
    	.find('.scene-header')
    		.addClass('ui-widget-header ui-corner-all')
    		.prepend('<span class="ui-icon ui-icon-minusthick"></span>')
    		.end()
    	.find('.scene-content');

    $('#n3-scene_' + sceneId).find('.scene-header .ui-icon').click(function() {
        $(this).toggleClass('ui-icon-minusthick').toggleClass('ui-icon-plusthick');
    	$(this).parents('.scene:first').find('.scene-content').toggle();
    	
    	var myId = $(this).parents('.scene:first').attr('id').replace('n3-scene_', '');
    	if($(this).hasClass('ui-icon-minusthick'))
    	    $('.n3-ui_member' + myId).show();
    	else
    	    $('.n3-ui_member' + myId).hide();
	});
	
	$('#n3-scene_' + sceneId + ' .members').sortable();
	
	$('body').css('backgroundColor', '#ddd');
}

function endScene() {
    endDrawing();
    $('#n3-ui_palette a').removeClass('selected');
    
    $('.state_settings').hide();
    $('#n3-ui_startScene').show();
    $('#n3-ui_endScene').hide();  
    $('#n3-ui_palette').hide();
    $('body').css('backgroundColor', '#fff');  
    
    $('#n3-scene_' + sceneId).find('.scene-content').hide();
    $('#n3-scene_' + sceneId).find('.scene-header .ui-icon').toggleClass('ui-icon-minusthick').toggleClass('ui-icon-plusthick');
}

function setState(visId, stateId, value) {
    n3.vis(visId).state(stateId, value);
    
    var m = {
        visId: visId,
        state: {
            id: stateId,
            value: value
        }
    };
    
    populateMember(m)
}

function populateMember(m, memberIndex) {
    scenes[sceneId].members = (scenes[sceneId].members == undefined) ? [] : scenes[sceneId].members;
    
    if(arguments.length == 1) 
        memberIndex = scenes[sceneId].members.length;
    
    scenes[sceneId].members[memberIndex] = m;
    
    var content;
    var isState = m.state != null;
    
    if(isState)
        content = '<li id="n3-ui_member' + memberIndex + '" class="ui-state-default member state"><span class="ui-icon ui-icon-draggable"></span><span class="member-text">' + 
                            m.state.id + '<br />&rarr; &nbsp;' + m.state.value + '</span>';
    else
        content = '<li id="n3-ui_member' + memberIndex + '"  class="ui-state-default member annotation"><span class="ui-icon ui-icon-draggable"></span><span class="member-text">' + 
                            'annotation<br />&rarr; &nbsp;' + SHAPE_LABELS[m.annotation.type] + '</span>';
    
    content += '<a href="#" title="Edit Triggers" class="ui-icon ui-icon-trigger" onclick="editTriggers(' + memberIndex + ');"></a>' + 
               '<a href="#" title="Edit Styles" class="ui-icon ui-icon-style"' + ((!isState) ? ' onclick="showStyles(\'' + m.annotation.id + '\', \'' + m.annotation.type + '\')"' : '') + '></a>' +
               '<a href="#" title="Delete" class="ui-icon ui-icon-delete"></a></li>';
        
    $('#n3-scene_' + sceneId + ' .members')
        .append(content);
        
    $('#n3-ui_member' + memberIndex).hover(function() { $(this).addClass('hover'); }, function() { $(this).removeClass('hover'); })
    
    if(isState)
        $('#n3-ui_member' + memberIndex).hover(function() { $('#n3-vis_' + m.visId).addClass('hover'); }, 
                                                function() { $('#n3-vis_' + m.visId).removeClass('hover'); })
    else
        $('#n3-ui_member' + memberIndex).hover(function() { d3.select('#' + m.annotation.id).classed('hover', true); }, 
                                                function() { d3.select('#' + m.annotation.id).classed('hover', false); });
}

function editTriggers(memberIndex) {
    $('#n3-ui_triggerDialog').dialog('option', 'memberIndex', memberIndex);
    $('#n3-ui_triggerDialog').dialog('open');
    
    if(scenes[sceneId].members[memberIndex].trigger != null)
        $('#triggers').val(scenes[sceneId].members[memberIndex].trigger);
}

function saveTriggers() {
    var memberIndex = $('#n3-ui_triggerDialog').dialog('option', 'memberIndex');
    scenes[sceneId].members[memberIndex].trigger = $('#triggers').val();
    $('#triggers').val('');
    
    $('#n3-ui_triggerDialog').dialog('close');
}

function showStyles(shapeId, shapeType) {
    var s = d3.select('#' + shapeId);
    
    $('#fill_opacity').slider({
        value: (s.attr('fill-opacity') || 1),
        min: 0,
        max: 1,
        step: 0.1,
        slide: function(e, ui) {
            s.attr('fill-opacity', ui.value);
        }
    });
    
    // Colorpicker doesn't re-init every time this is called, so get
    // shapeId via hackier means
    $('#fill_color').parent().parent().attr('shapeId', shapeId);
    
    $('#fill_color').ColorPicker({
    	color: '#000000',
        onBeforeShow: function () {
            $('#fill_color').ColorPickerSetColor($('#fill_color').css('backgroundColor'));
        },
        // onHide: function (colpkr) {
        //  $(colpkr).fadeOut(500);
        //  return false;
        // },
    	onChange: function (hsb, hex, rgb) {
    	    d3.select('#' + $('#fill_color').parent().parent().attr('shapeId')).attr('fill', '#' + hex);
    		$('#fill_color').css('backgroundColor', '#' + hex);
    	}
    });
    
    $('#fill_color').css('backgroundColor', (s.attr('fill') || '#000000'));
    
    $('#stroke_width').slider({
        value: (s.attr('stroke-width') || 1),
        min: 0,
        max: 10,
        step: 1,
        slide: function(e, ui) {
            s.attr('stroke-width', ui.value);
        }
    });
    
    $('#stroke_color').css('backgroundColor', (s.attr('stroke') || '#000000'));
    
    $('#stroke_color').ColorPicker({
    	color: '#000000',
        onBeforeShow: function () {
            $('#stroke_color').ColorPickerSetColor($('#stroke_color').css('backgroundColor'));
        },
        // onHide: function (colpkr) {
        //  $(colpkr).fadeOut(500);
        //  return false;
        // },
    	onChange: function (hsb, hex, rgb) {
    	    d3.select('#' + $('#fill_color').parent().parent().attr('shapeId')).attr('stroke', '#' + hex);
    		$('#stroke_color').css('backgroundColor', '#' + hex);
    	}
    });
    
    $('#n3-ui_stylesDialog').dialog('open')
}

function exportStory() {
    var story = $('#vis').val() + "\n";
    
    for(var id in scenes) {
        story += "\nn3.scene('" + id + "')\n";
        
        for(var i in scenes[id].members) {
            var member = scenes[id].members[i];
            story += "    ";
            
            if(member.state != null) {
                story += ".set('" + member.visId + "', '" + member.state.id + "', '" + member.state.value + "'";
            } else {
                var elem = d3.select('#' + member.annotation.id);
                
                var annotation = "    n3.annotation('" + SHAPE_LABELS[member.annotation.type] + "')\n";
                switch(member.annotation.type) {
                    case SHAPES.CIRCLE:
                        annotation += "        .radius(" + elem.attr('r') + ")\n" +
                                      "        .center([" + elem.attr('cx') + ", " + elem.attr('cy') + "])\n";
                    break;
                    
                    case SHAPES.ELLIPSE:
                        annotation += "        .radius([" + elem.attr('rx') + ", " + elem.attr('ry') + "])\n" +
                                      "        .center([" + elem.attr('cx') + ", " + elem.attr('cy') + "])\n";
                    break;
                    
                    case SHAPES.LINE:
                        annotation += "        .start([" + elem.attr('x1') + ", " + elem.attr('y1') + "])\n" +
                                      "        .end([" + elem.attr('x2') + ", " + elem.attr('y2') + "])\n";
                    break;
                    
                    case SHAPES.RECTANGLE:
                        annotation += "        .size([" + elem.attr('width') + ", " + elem.attr('height') + "])\n" +
                                      "        .pos([" + elem.attr('x') + ", " + elem.attr('y') + "])\n";
                    break;
                }
                 
                annotation += "        .attr('id', '" + member.annotation.id + "')\n";    
                annotation += "        .style('fill', '" + (elem.attr('fill') || '#000000') + "')\n";
                annotation += "        .style('fill-opacity', '" + (elem.attr('fill-opacity') || '1') + "')\n";
                annotation += "        .style('stroke-width', '" + (elem.attr('stroke-width') || '1') + "')\n";
                annotation += "        .style('stroke', '" + (elem.attr('stroke') || '#000000') + "')";
                
                story += ".add('" + member.visId + "',\n" + annotation;
            }
            
            if(member.trigger != null)
                story += ",\n    " + member.trigger;
                
            story += "    )\n"
        }
    }  
    
    $('#export').val(story);  
    $('#n3-ui_exportDialog').dialog('open');
}

// Get coordinates of mouse within the svg
function toggleShape(elem, shapeType) {
    var selected = $(elem).hasClass('selected');
    endDrawing();
    $('#n3-ui_palette a').removeClass('selected');

    if(!selected) {
        $(elem).addClass('selected');
        startDrawing(shapeType);
    }
}

function getMouseX(e) {
    return e.pageX - e.target.offsetLeft;
}

function getMouseY(e) {
    return e.pageY - e.target.offsetTop;
}

function startDrawing(shapeType) {
    $('svg').parent().addClass('draw');
    
    switch(shapeType) {
        case SHAPES.CIRCLE:
            $('svg').bind('mousedown.n3_edit', startCircle);
        break;
        
        case SHAPES.ELLIPSE:
            $('svg').bind('mousedown.n3_edit', startEllipse);
        break;
        
        case SHAPES.LINE:
            $('svg').bind('mousedown.n3_edit', startLine);
        break;
        
        case SHAPES.RECTANGLE:
            $('svg').bind('mousedown.n3_edit', startRect);
        break;
        
    }
}

// Called with an arg when finished drawing an individual annotation.
function endDrawing(e) {
    if(e) {
        console.log(e);
        // When a shape is finished drawing, we want to still
        // allow users to continue to draw more of the selected annotation.
        $('svg').unbind('mousemove.n3_edit');
        var m = {
            visId: e.data.visId.replace('n3-vis_', ''),
            annotation: {
                type: e.data.type,
                id: e.data.id
            }
        };
        populateMember(m)
    } else {    // End drawing current shape annotation.
        $('svg').parent().removeClass('draw');
        $('svg').unbind('mousedown.n3_edit');
        $('svg').unbind('mousemove.n3_edit');
        $('svg').unbind('mouseup.n3_edit');
    }
}

function startCircle(e) {
    var id = 'circle_' + Date.now();
    
    d3.select(e.target)
        .append('svg:circle')
        .attr('id', id)
        .attr('class', 'n3-ui_member' + sceneId)
        .attr('cx', getMouseX(e))
        .attr('cy', getMouseY(e))
        .attr('r', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
        
    $(e.target).bind('mousemove.n3_edit', { id: id }, drawCircle);
    $(e.target).bind('mouseup.n3_edit', { id: id, visId: e.target.parentNode.id, type: SHAPES.CIRCLE }, endDrawing);
}

function drawCircle(e) {
    var s = d3.select('#' + e.data.id);    
    var r = Math.sqrt(Math.pow(getMouseX(e) - s.attr('cx'), 2) + Math.pow(getMouseY(e) - s.attr('cy'), 2))
    s.attr('r', r);
}

function startEllipse(e) {
    var id = 'ellipse_' + Date.now();
    
    d3.select(e.target)
        .append('svg:ellipse')
        .attr('id', id)
        .attr('class', 'n3-ui_member' + sceneId)
        .attr('cx', getMouseX(e))
        .attr('cy', getMouseY(e))
        .attr('rx', 1)
        .attr('ry', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
        
    $(e.target).bind('mousemove.n3_edit', { id: id }, drawEllipse);
    $(e.target).bind('mouseup.n3_edit', { id: id, visId: e.target.parentNode.id, type: SHAPES.ELLIPSE }, endDrawing);
}

function drawEllipse(e) {
    var s = d3.select('#' + e.data.id);    
    s.attr('rx', Math.abs(getMouseX(e) - s.attr('cx')))
     .attr('ry', Math.abs(getMouseY(e) - s.attr('cy')));
}

function startLine(e) {
    var id = 'line_' + Date.now();

    d3.select(e.target)
        .append('svg:line')
        .attr('id', id)
        .attr('class', 'n3-ui_member' + sceneId)
        .attr('x1', getMouseX(e))
        .attr('y1', getMouseY(e))
        .attr('x2', getMouseX(e))
        .attr('y2', getMouseY(e))
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
        
    $(e.target).bind('mousemove.n3_edit', { id: id }, drawLine);
    $(e.target).bind('mouseup.n3_edit', { id: id, visId: e.target.parentNode.id, type: SHAPES.LINE }, endDrawing);
}

function drawLine(e) {
    var s = d3.select('#' + e.data.id);    
    s.attr('x2', getMouseX(e))
     .attr('y2', getMouseY(e));
}

function startRect(e) {
    var id = 'rect_' + Date.now();
    
    var x = getMouseX(e);
    var y = getMouseY(e);

    d3.select(e.target)
        .append('svg:rect')
        .attr('id', id)
        .attr('class', 'n3-ui_member' + sceneId)
        .attr('x', x)
        .attr('y', y)
        .attr('width', 1)
        .attr('height', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
        
    $(e.target).bind('mousemove.n3_edit', { id: id, startX: x, startY: y }, drawRect);   
    $(e.target).bind('mouseup.n3_edit', { id: id, visId: e.target.parentNode.id, type: SHAPES.RECTANGLE }, endDrawing); 
}

function drawRect(e) {
    var s = d3.select('#' + e.data.id); 
    var startX = e.data.startX;
    var startY = e.data.startY;   
    var mouseX = getMouseX(e);
    var mouseY = getMouseY(e);
    
    // If we start drawing a rect, and then go "backwards"
    // we have to reposition
    if(mouseX < startX)
        s.attr('x', mouseX);
        
    if(mouseY < startY)
        s.attr('y', mouseY);
    
    s.attr('width', Math.abs(mouseX - startX))
     .attr('height', Math.abs(mouseY - startY));
}