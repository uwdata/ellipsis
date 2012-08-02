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
var drawShape;
var dragElement;

$(function() {
    $(document).ready(function() {
        $('#n3-ui_visDialog').dialog({
            modal: true,
            width: 500,
            buttons: {
                "Save": saveVis
            }
        });
        
        $('#n3-ui_triggerDialog').dialog({
            modal: true,
            autoOpen: false,
            width: 800,
            buttons: {
                "Save": saveTriggers
            }
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
            .append('<div id="n3-vis_' + visId + '" class="n3-vis_stage"><div class="infobar"><p>Visualization: ' + visId + '</p><br clear="all" /></div>' + 
                        '<svg id="' + vis.stageSelector.replace('#', '') + '" width="' + vis.width() + 
                            '" height="' + vis.height() + '"></svg></div>');
        
        var stateSettings = '<div class="infobar state_settings">';                    
        for(var stateId in vis.states) {
            var s = vis.states[stateId];
            stateSettings += '<p>' + stateId + ': ' + 
                '<select onchange="setState(\'' + visId + '\',\'' + stateId + '\', $(this).val())" id="n3-ui_state' + stateId + '"><option value="">Select...</option>';
            
            for(var i in s.validValues)
                stateSettings += '<option>' + s.validValues[i] + '</option>';
            
            stateSettings += '</select>';
        }                    
        
        stateSettings += '<p id="n3-vis_' + visId + '-saveState" style="display: none;"><input type="button" value="Save" onclick="saveState(\'' + visId + '\')" /></p><br clear="all" />';
        stateSettings += '</div>';
        $('#n3-vis_' + visId)
            .append(stateSettings)
            
        $('#n3-vis_' + visId + ' .infobar:last').hide();
        
        // Populate state settings into triggers dialog
        var tmpl = $('#n3-ui_triggerTemplate');
        for(var stateId in vis.states) {
            var className = visId + '_' + stateId;
            var s = vis.states[stateId];
            
            tmpl.find('span.state:first')
                    .find('select.where:first')
                        .append('<option value="' + className + '">' + visId + ': ' + stateId + '</option>');
                        
            tmpl.find('span.state:first')
                    .append('<select class="value ' + className + '" style="display:none;"><option value="">Select value...</option></select>');
         
            for(var i in s.validValues)
                tmpl.find('span.state:first')
                        .find('select.value.' + className)
                            .append('<option>' + s.validValues[i] + '</option>');
        }
    }
    
    $('#n3-ui_stage').bind('mousedown', startDrawOrDrag);
    $('#n3-ui_stage').bind('mouseup', endDrawOrDrag);
    
    if(closeDialog)
        $('#n3-ui_visDialog').dialog('close')
}

function editScene(editSceneId) {
    endScene();
    $('.n3-ui_scene' + sceneId).hide();
    
    if(!editSceneId) {
        sceneId = prompt("Enter a scene ID: ");
        sceneId = sceneId.replace(/[^a-zA-Z0-9]/g, '');
        scenes[sceneId] = { id: sceneId };  
        
        $('#n3-ui_side_panel')
            .append('<div class="scene" id="n3-ui_scene' + sceneId 
                        + '"><div class="scene-header"><span>Currently Editing Scene: ' + sceneId + '</span></div><div class="scene-content"><ul class="members"></ul></div></div>');

        $('#n3-ui_scene' + sceneId)
            .addClass('ui-widget ui-widget-content ui-helper-clearfix ui-corner-all')
            .find('.scene-header')
                .addClass('ui-widget-header ui-corner-all')
                .prepend('<span class="ui-icon ui-icon-toggle ui-icon-minusthick"></span><span class="ui-icon ui-icon-edit"></span>')
                .end()
            .find('.scene-content');

        $('#n3-ui_scene' + sceneId).find('.scene-header .ui-icon-toggle').click(function() {
            $(this).toggleClass('ui-icon-minusthick').toggleClass('ui-icon-plusthick');
            $(this).parents('.scene:first').find('.scene-content').toggle();

            var mySceneId = $(this).parents('.scene:first').attr('id').replace('n3-ui_scene', '');
            if($(this).hasClass('ui-icon-minusthick'))
                $('.n3-ui_scene' + mySceneId).show();
            else
                $('.n3-ui_scene' + mySceneId).hide();
        });
        
        $('#n3-ui_scene' + sceneId).find('.scene-header .ui-icon-edit').click(function() { 
            var mySceneId = $(this).parents('.scene:first').attr('id').replace('n3-ui_scene', '');
            return editScene(mySceneId); 
        });

        $('#n3-ui_scene' + sceneId + ' .members').sortable({
            stop: reorderMembers
        });  
    } else {        
        sceneId = editSceneId;
        
        $('.n3-ui_scene' + sceneId).show();
        $('#n3-ui_scene' + sceneId).find('.scene-content').show();
        $('#n3-ui_scene' + sceneId).find('.scene-header span').text('Currently Editing Scene: ' + sceneId);
        $('#n3-ui_scene' + sceneId).find('.scene-header .ui-icon')
                                    .removeClass('ui-icon-plusthick')
                                    .addClass('ui-icon-minusthick');        
    }
    
    $('.state_settings').show();
    $('#n3-ui_startScene').hide();
    $('#n3-ui_endScene').show();
    $('#n3-ui_palette').show();
    
    $('body').css('backgroundColor', '#ddd');
}

function endScene() {
    endDrawOrDrag();
    $('#n3-ui_palette a').removeClass('selected');
    
    $('.state_settings').hide();
    $('#n3-ui_startScene').show();
    $('#n3-ui_endScene').hide();  
    $('#n3-ui_palette').hide();
    $('body').css('backgroundColor', '#fff');  
    
    $('#n3-ui_scene' + sceneId).find('.scene-content').hide();
    $('#n3-ui_scene' + sceneId).find('.scene-header span').text('Scene: ' + sceneId);
    $('#n3-ui_scene' + sceneId).find('.scene-header .ui-icon')
                                .removeClass('ui-icon-minusthick')
                                .addClass('ui-icon-plusthick');
}

function setState(visId, stateId, value) {
    n3.vis(visId).state(stateId, value);
    $('#' + visId).show();
    $('#n3-vis_' + visId + '-saveState').effect("highlight", {}, 2000);
}

function saveState(visId) {
    for(var stateId in n3.vis(visId).states) {
        var m = {
            visId: visId,
            state: {
                id: stateId,
                value: n3.vis(visId).state(stateId)
            }
        };

        populateMember(m);      
    }
    
    $('#n3-vis_' + visId + '-saveState').hide();
}

function populateMember(m, memberIndex) {
    scenes[sceneId].members = (scenes[sceneId].members == undefined) ? [] : scenes[sceneId].members;
    
    // Give each member an ID if it doesn't point it doesn't already have one
    m.memberId = (m.annotation != null) ? m.annotation.id : 'state_' + uniqueId();
    
    if(arguments.length == 1) 
        memberIndex = scenes[sceneId].members.length;
    
    scenes[sceneId].members[memberIndex] = m;
    
    var content;
    var isState = m.state != null;
    
    if(isState)
        content = '<li id="n3-ui_' + m.memberId + '" class="ui-state-default member state"><span class="ui-icon ui-icon-draggable"></span><span class="member-text">' + 
                            m.state.id + '<br />&rarr; &nbsp;' + m.state.value + '</span>';
    else
        content = '<li id="n3-ui_' + m.memberId + '"  class="ui-state-default member annotation"><span class="ui-icon ui-icon-draggable"></span><span class="member-text">' + 
                            'annotation<br />&rarr; &nbsp;#' + m.memberId + '</span>';
    
    content += '<a href="#" title="' + ((m.trigger == null) ? 'Add Triggers' : 'Edit Triggers') + '" class="ui-icon ui-icon-trigger" onclick="editTriggers(' + memberIndex + ');"></a>' + 
               '<a href="#" title="Edit Styles" class="ui-icon ui-icon-style"' + ((!isState) ? ' onclick="showStyles(\'' + m.annotation.id + '\', \'' + m.annotation.type + '\')"' : '') + '></a>' +
               '<a href="#" title="Delete" class="ui-icon ui-icon-delete" onclick="removeMember(' + memberIndex + ');"></a></li>';
        
    $('#n3-ui_scene' + sceneId + ' .members')
        .append(content);
        
    if(m.trigger == null)
        $('#n3-ui_' + m.memberId + ' .ui-icon-trigger').addClass('ui-icon-trigger-empty');
        
    $('#n3-ui_' + m.memberId).hover(function() { $(this).addClass('hover'); }, function() { $(this).removeClass('hover'); })
    
    if(isState)
        $('#n3-ui_' + m.memberId).hover(function() { $('#n3-vis_' + m.visId).addClass('hover'); }, 
                                                function() { $('#n3-vis_' + m.visId).removeClass('hover'); })
    else
        $('#n3-ui_' + m.memberId).hover(function() { d3.select('#' + m.annotation.id).classed('hover', true); }, 
                                                function() { d3.select('#' + m.annotation.id).classed('hover', false); });
}

function removeMember(memberIndex) {    
    var m = scenes[sceneId].members.splice(memberIndex, 1)[0];
    var members = scenes[sceneId].members;
    
    if(m.state != null) {   // If we delete a state, try and find the last prev state
        for(var i = members.length - 1; i >= 0; i--) {
            if(members[i].state != null) {
                n3.vis(members[i].visId).state(members[i].state.id, members[i].state.value);
                $('#n3-ui_state' + members[i].state.id).val(members[i].state.value);
                break;
            }                
        }
    } else {    // If it's an annotation, remove it
        $('#' + m.annotation.id).remove();
    }  
    
    // Repopulate members in the scene
    $('#n3-ui_scene' + sceneId + ' .members').html('');
    for(var i in members)
        populateMember(members[i], i);
}

function reorderMembers(event, ui) {
    var scene = $(ui.item).parents('.scene:first');
    var mySceneId = scene.attr('id').replace('n3-ui_scene', '');
    
    var oldOrder = scenes[sceneId].members;
    scenes[sceneId].members = [];
    
    // We need to clear the scene box and re-draw it for all events to properly register.
    // Probably a better way to register them initially...
    
    var memberOrder = scene.find('li.member');
    $('#n3-ui_scene' + sceneId + ' .members').html('');
    
    memberOrder.each(function(i, e) {
        var memberId = $(e).attr('id').replace('n3-ui_', '');
        var member = null; 
        
        for(var i in oldOrder) {
            if(oldOrder[i].memberId == memberId) {
                member = oldOrder[i];
                break;
            }
        }
        
        if(member != null)
            populateMember(member)
            
        // Reorder annotations on svg stage
        if(member.annotation != null) {
            var annotation = $('#' + memberId);
            annotation.parents('svg').append(annotation);
        }
    });
}

function editTriggers(memberIndex) {
    var member  = scenes[sceneId].members[memberIndex]; 
    var trigger = member.trigger;
    
    $('#n3-ui_triggerDialog').dialog('option', 'memberIndex', memberIndex);
    $('#n3-ui_triggerDialog').dialog('open');
    $('#n3-ui_triggerTemplate').nextAll('p.trigger').remove();
    
    if(!trigger) {
        $('<p class="trigger">' + $('#n3-ui_triggerTemplate').html() + '</p>').insertBefore('#n3-ui_triggerThen');
    } else {
        $('#n3-ui_triggerParent').val(trigger.type);
        
        for(var i in trigger.triggers) {
            var t = trigger.triggers[i];
            
            $('<p class="trigger">' + $('#n3-ui_triggerTemplate').html() + '</p>').insertBefore('#n3-ui_triggerThen');
            var p = $('#n3-ui_triggerTemplate').nextAll('p:eq(' + i + ')');
            
            p.find('select.trigger_type').val(t.type);
            var typeOpts = p.find('span.' + t.type + ':first');
            typeOpts.find('.where').val(t.where);
            typeOpts.find('.condition').val(t.condition);
            typeOpts.find('.value' + (t.type == 'state' ? '.' + t.where : '')).val(t.value);
            typeOpts.find('.value').hide();
            typeOpts.find('.value' + (t.type == 'state' ? '.' + t.where : '')).show();
            typeOpts.show();
            
        }
    }
    
    var then = (member.annotation) ? 
                'then show annotation ' + SHAPE_LABELS[member.annotation.type] : 
                'then set state ' + member.state.id + ' to ' + member.state.value;
        
    $('#n3-ui_triggerThen').html(then + '.');
}

function chooseTrigger(trigger) {
    var type = $(trigger).val();
    $(trigger).parent().parent().find('span.trigger_type').hide();
    $(trigger).parent().parent().find('span.' + type).show();
}

function addSubTrigger() {
    $('<p class="trigger">' + $('#n3-ui_triggerTemplate').html() + '</p>').insertBefore('#n3-ui_triggerThen');
}

function saveTriggers() {
    var memberIndex = $('#n3-ui_triggerDialog').dialog('option', 'memberIndex');
    var triggerIcon = '#n3-ui_' + scenes[sceneId].members[memberIndex].memberId + ' .ui-icon-trigger';
    
    var triggers = [];
    $('#n3-ui_triggerTemplate').nextAll('p.trigger').each(function(i, p) {
        var t = {};
        
        p = $(p);
        t.type  = p.find('select.trigger_type').val();

        if(t.type != '') {
            var typeOpts = p.find('span.' + t.type + ':first');
            t.where     = typeOpts.find('.where').val();
            t.condition = typeOpts.find('.condition').val();
            t.value     = typeOpts.find('.value' + (t.type == 'state' ? '.' + t.where : '')).val();
        
            triggers.push(t);
            
        }       
    })
    
    scenes[sceneId].members[memberIndex].trigger = {
        type:       $('#n3-ui_triggerParent').val(),
        triggers:   triggers
    };
    
    if(triggers == null)
        $(triggerIcon).addClass('ui-icon-trigger-empty');
    else
        $(triggerIcon).removeClass('ui-icon-trigger-empty');
        
    $('#n3-ui_triggerDialog').dialog('close');
}

function startDomTrigger(button) {
    $('#n3-ui_stage *').bind('mouseenter.dom_trigger', function(e) { $(e.target).addClass('hover') }); 
    $('#n3-ui_stage *').bind('mouseleave.dom_trigger', function(e) { $(e.target).removeClass('hover') });
									
	$('#n3-ui_stage').bind('click.dom_trigger', function(e) {
		$(button).next('input[name=dom_selector]').val($(e.target).getPath());
		
		$('#n3-ui_stage *').unbind('mouseenter.dom_trigger mouseleave.dom_trigger');
		$('#n3-ui_stage').unbind('click.dom_trigger');
		
		$('#n3-ui_triggerDialog').dialog('open');
	});
	
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
    var indent = "        ";
    
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
                        annotation += indent + ".radius(" + elem.attr('r') + ")\n" +
                                      indent + ".center([" + elem.attr('cx') + ", " + elem.attr('cy') + "])\n";
                    break;
                    
                    case SHAPES.ELLIPSE:
                        annotation += indent + ".radius([" + elem.attr('rx') + ", " + elem.attr('ry') + "])\n" +
                                      indent + ".center([" + elem.attr('cx') + ", " + elem.attr('cy') + "])\n";
                    break;
                    
                    case SHAPES.LINE:
                        annotation += indent + ".start([" + elem.attr('x1') + ", " + elem.attr('y1') + "])\n" +
                                      indent + ".end([" + elem.attr('x2') + ", " + elem.attr('y2') + "])\n";
                    break;
                    
                    case SHAPES.RECTANGLE:
                        annotation += indent + ".size([" + elem.attr('width') + ", " + elem.attr('height') + "])\n" +
                                      indent + ".pos([" + elem.attr('x') + ", " + elem.attr('y') + "])\n";
                    break;
                    
                    case SHAPES.LABEL:
                        var svg = d3.select('#n3-vis_' + member.visId + ' svg');
                        var x = parseFloat(elem.style('left')) - svg.property('offsetLeft');
                        var y = parseFloat(elem.style('top')) - svg.property('offsetTop');
                    
                        annotation += indent + ".html(\"" + elem.html() + "\")\n" + 
                                      indent + ".pos([" + x + ", " + y + "])\n";
                    break;
                }
                 
                annotation += indent + ".attr('id', '" + member.annotation.id + "')\n";    
                annotation += indent + ".style('fill', '" + (elem.attr('fill') || '#000000') + "')\n";
                annotation += indent + ".style('fill-opacity', '" + (elem.attr('fill-opacity') || '1') + "')\n";
                annotation += indent + ".style('stroke-width', '" + (elem.attr('stroke-width') || '1') + "')\n";
                annotation += indent + ".style('stroke', '" + (elem.attr('stroke') || '#000000') + "')";
                
                story += ".add('" + member.visId + "',\n" + annotation;
            }
            
            if(member.trigger != null) {
                story += ",\n";
                
                story += recursiveExportTrigger(member.trigger);
            }
            
            story += ")\n"
        }
    }  
    
    $('#export').val(story);  
    $('#n3-ui_exportDialog').dialog('open');
}

// We don't really need something this complex now that we've simplified the trigger UI
// but keep it around just in case!
function recursiveExportTrigger(trigger) {
    var indent = "                    ";
    var story = indent;
    
    switch(trigger.type) {
        case 'or':
        case 'and':
            story += "n3.trigger." + trigger.type + "(\n";

            for(var i in trigger.triggers)
                story += recursiveExportTrigger(trigger.triggers[i]) +
                                ((i == trigger.triggers.length - 1) ? "" : ",\n");

            story += ")\n";
        break;
        
        case 'delay':
            story += 'n3.trigger.afterPrev(' + trigger.value + ')';
        break;
        
        case 'state':
            var test = trigger.where.split('_');
        
            story += "n3.trigger('" + test[0] + "')\n" + 
                     indent + ".where('" + test[1] + "')\n" +
                     indent + "." + trigger.condition + "('" + trigger.value + "')"; // Eeks, what about numbers??
        break;
        
        case 'timeline':
            story += "n3.trigger(n3.timeline)\n" +
                     indent + ".where('elapsed')\n" +
                     indent + "." + trigger.condition + "(" + trigger.value + ")";
        break;
		
		case 'dom_click':
		case 'dom_dblclick':
		case 'dom_mousedown':
		case 'dom_mouseup':
		case 'dom_mouseover':
		case 'dom_mousemove':
			story += "n3.trigger('" + trigger.value + "').on('" + trigger.type.split(/dom_/)[1] + "')";
		break;
    }
    
    return story;
}

function playStory() {
    // Easy way to grab the n3 js
    exportStory();
    $('#n3-ui_exportDialog').dialog('close');
    
    // N3 doesn't provide an explicit way of ordering scenes, 
    // grab their linear order from the scene boxes
    var sceneOrder = [];
    $('#n3-ui_side_panel .scene').each(function(i, e) {
        sceneOrder.push($(e).attr('id').replace('n3-ui_scene', ''));
    });
    
    var json = {
        visIds: visIds,
        sceneOrder: sceneOrder,
        n3Js: $('#export').val()
    };
    
    var playWin = window.open('play.html', 'playWin', 'width=1024,height=768,status=yes,menubar=yes,titlebar=yes,toolbar=yes,location=yes,scrollbar=yes');
    var wait = setInterval(function() { 
        playWin.postMessage($.toJSON(json), 'http://' + window.location.host); 
        clearInterval(wait);
    }, 1000);
}

// Get coordinates of mouse within the svgply
function toggleShape(elem, shapeType) {
    var selected = $(elem).hasClass('selected');
    endDrawOrDrag();
    $('#n3-ui_palette a').removeClass('selected');

    if(!selected) {
        $(elem).addClass('selected');
        drawShape = shapeType;
        $('svg').parent().addClass('draw');
    }
}

function getMouseX(e) {
    var el = e.target;
    while(el != null && el.nodeName.toUpperCase() != 'SVG')
        el = el.parentNode;

    return el != null ? e.pageX - el.offsetLeft : e.pageX;
}

function getMouseY(e) {
    var el = e.target;
    while(el != null && el.nodeName.toUpperCase() != 'SVG')
        el = el.parentNode;
    
    return el != null ? e.pageY - el.offsetTop : e.pageY;
}

function startDrawOrDrag(e) {
    // If clicked on an svg, this is a draw event
    if(e.target.tagName.toUpperCase() == 'SVG') {
        switch(drawShape) {
            case SHAPES.CIRCLE:
                startCircle(e);
            break;

            case SHAPES.ELLIPSE:
                startEllipse(e);
            break;

            case SHAPES.LINE:
                startLine(e);
            break;

            case SHAPES.RECTANGLE:
                startRect(e);
            break;

            case SHAPES.LABEL:
                startLabel(e);
            break;

        }        
    } else { // Otherwise, it's a move event
        var el = d3.select(e.target);

        if(el.classed('draggable')) {
            el.attr('startX', getMouseX(e))
              .attr('startY', getMouseY(e));

            dragElement = e.target;            
            $('#n3-ui_stage').bind('mousemove.n3_move', dragAnnotation);
        }
    }

    // if(e.target.tagName.toUpperCase() != 'P') {
    //     // cancel out any text selections
    //     document.body.focus();
    //     // prevent text selection in IE
    //     document.onselectstart = function () { return false; };
    //     // prevent IE from trying to drag an image
    //     e.target.ondragstart = function() { return false; };        
    // }
}

// Called with an arg when finished drawing an individual annotation.
function endDrawOrDrag(e) {
    dragElement = null;
    $('#n3-ui_stage').unbind('mousemove.n3_move');
    $('svg').unbind('mousemove.n3_draw');
    $('svg').unbind('mouseup.n3_draw');
    
    if(e) {
        if(e.data) {
            // When a shape is finished drawing, we want to still
            // allow users to continue to draw more of the selected annotation.
            var m = {
                visId: e.data.visId.replace('n3-vis_', ''),
                annotation: {
                    type: e.data.type,
                    id: e.data.id
                }
            };

            populateMember(m);           
        }
        // 
        // if(e.target != null && e.target.tagName.toUpperCase() != 'P') {
        //     // cancel out any text selections
        //     document.body.focus();
        //     // prevent text selection in IE
        //     document.onselectstart = function () { return false; };
        //     // prevent IE from trying to drag an image
        //     e.target.ondragstart = function() { return false; };        
        // }
    } else {    // End drawing current shape annotation.
        drawShape = -1;
        $('svg').parent().removeClass('draw');
    }
}

function dragAnnotation(e) {
    var el = d3.select(dragElement);
    
    switch(dragElement.tagName.toUpperCase()) {
        case 'ELLIPSE':
            el.attr('cx', getMouseX(e))
              .attr('cy', getMouseY(e))
        break;
        
        case 'RECT':
            var x  = parseInt(el.attr('x')) + (getMouseX(e) - el.attr('startX'));
            var y  = parseInt(el.attr('y')) + (getMouseY(e) - el.attr('startY'));
                    
            el.attr('x', x)
              .attr('y', y)
              .attr('startX', getMouseX(e))
              .attr('startY', getMouseY(e))
        break;
        
        case 'LINE':
            var x1  = parseInt(el.attr('x1')) + (getMouseX(e) - el.attr('startX'));
            var x2  = parseInt(el.attr('x2')) + (getMouseX(e) - el.attr('startX'));
            var y1  = parseInt(el.attr('y1')) + (getMouseY(e) - el.attr('startY'));
            var y2  = parseInt(el.attr('y2')) + (getMouseY(e) - el.attr('startY'));
                 
            el.attr('x1', x1)
              .attr('y1', y1)
              .attr('x2', x2)
              .attr('y2', y2)
              .attr('startX', getMouseX(e))
              .attr('startY', getMouseY(e))
        break;
        
        case 'P':
            el.style('left', e.pageX + 'px')
              .style('top', e.pageY + 'px');
        break;
    }
}

function startCircle(e) {
    var id = 'circle_' + uniqueId();
    
    d3.select(e.target)
        .append('svg:circle')
        .attr('id', id)
        .attr('class', 'draggable n3-ui_scene' + sceneId)
        .attr('cx', getMouseX(e))
        .attr('cy', getMouseY(e))
        .attr('r', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 1);
        
    $(e.target).bind('mousemove.n3_draw', { id: id }, drawCircle);
    $(e.target).bind('mouseup.n3_draw', { id: id, visId: e.target.parentNode.id, type: SHAPES.CIRCLE }, endDrawOrDrag);
}

function drawCircle(e) {
    var s = d3.select('#' + e.data.id);    
    var r = Math.sqrt(Math.pow(getMouseX(e) - s.attr('cx'), 2) + Math.pow(getMouseY(e) - s.attr('cy'), 2))
    s.attr('r', r);
}

function startEllipse(e) {
    var id = 'ellipse_' + uniqueId();

    d3.select(e.target)
        .append('svg:ellipse')
        .attr('id', id)
        .attr('class', 'draggable n3-ui_scene' + sceneId)
        .attr('cx', getMouseX(e))
        .attr('cy', getMouseY(e))
        .attr('rx', 1)
        .attr('ry', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('cursor', 'move');
   
    $(e.target).bind('mousemove.n3_draw', { id: id }, drawEllipse);
    $(e.target).bind('mouseup.n3_draw', { id: id, visId: e.target.parentNode.id, type: SHAPES.ELLIPSE }, endDrawOrDrag);
}

function drawEllipse(e) {
    var s = d3.select('#' + e.data.id);    
    s.attr('rx', Math.abs(getMouseX(e) - s.attr('cx')))
     .attr('ry', Math.abs(getMouseY(e) - s.attr('cy')));
}

function startLine(e) {
    var id = 'line_' + uniqueId();

    d3.select(e.target)
        .append('svg:line')
        .attr('id', id)
        .attr('class', 'draggable n3-ui_scene' + sceneId)
        .attr('x1', getMouseX(e))
        .attr('y1', getMouseY(e))
        .attr('x2', getMouseX(e))
        .attr('y2', getMouseY(e))
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('cursor', 'move');
        
    $(e.target).bind('mousemove.n3_draw', { id: id }, drawLine);
    $(e.target).bind('mouseup.n3_draw', { id: id, visId: e.target.parentNode.id, type: SHAPES.LINE }, endDrawOrDrag);
}

function drawLine(e) {
    var s = d3.select('#' + e.data.id);    
    s.attr('x2', getMouseX(e))
     .attr('y2', getMouseY(e));
}

function startRect(e) {
    var id = 'rect_' + uniqueId();
    
    var x = getMouseX(e);
    var y = getMouseY(e);

    d3.select(e.target)
        .append('svg:rect')
        .attr('id', id)
        .attr('class', 'draggable n3-ui_scene' + sceneId)
        .attr('x', x)
        .attr('y', y)
        .attr('width', 1)
        .attr('height', 1)
        .attr('fill-opacity', 0)
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .style('cursor', 'move');
        
    $(e.target).bind('mousemove.n3_draw', { id: id, startX: x, startY: y }, drawRect);   
    $(e.target).bind('mouseup.n3_draw', { id: id, visId: e.target.parentNode.id, type: SHAPES.RECTANGLE }, endDrawOrDrag); 
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

function startLabel(e) {
    var id = 'label_' + uniqueId();
    
    var x = getMouseX(e);
    var y = getMouseY(e);

    d3.select('#n3-ui_stage')
        .append('p')
        .html('Label text')
        .attr('id', id)
        .attr('class', 'draggable editable n3-ui_scene' + sceneId)
        .attr('contenteditable', 'true')
        .style('cursor', 'move')
        .style('position', 'absolute')
        .style('left', e.pageX + 'px')
        .style('top', e.pageY + 'px')
        .style('margin', '0');

    // Labels shouldn't work like normal shapes. You don't add them repetitively because you edit. 
    endDrawOrDrag({ data: { id: id, visId: e.target.parentNode.id, type: SHAPES.LABEL }});
    toggleShape($('#n3-ui_palette a.text')[0], SHAPES.LABEL);
    $('svg').unbind('click.n3_edit');
    
    $('#' + id).focus(function() { $(this).select(); });
}

function uniqueId() {
    return sceneId.substring(0, 5) + '_' + scenes[sceneId].members.length;
}