var visIds = [];
var sceneOrder = [];

window.addEventListener('message',function(event) {
    var json = $.evalJSON(event.data);
    visIds = json.visIds;
    sceneOrder = json.sceneOrder;
    eval(json.n3Js);    
    
    createVisStages();
    populatePlayBar();    
    
    switchScene(sceneOrder[0]);
},false);

function createVisStages() {
    for(var i in visIds) {
        var visId = visIds[i];
        var vis = n3.vis(visId);
        
        $('#n3-ui_stage')           // Need to replace this for other selector types
            .append('<div id="n3-vis_' + visId + '" class="n3-vis_stage">' + 
                        '<svg id="' + vis.stageSelector.replace('#', '') + '" width="' + vis.width() + 
                            '" height="' + vis.height() + '"></svg></div>');
    }
}

function populatePlayBar() {
    $('#n3-ui_playbar ul').html('');
    
    for(var i in sceneOrder) {
        var s = sceneOrder[i];
        $('#n3-ui_playbar ul').append('<li><a href="#" onclick="switchScene(\'' + s + '\')" id="n3-ui_' + s + '">' + s + '</a></li>');
    }
}

function switchScene(id) {
    $('.selected').removeClass('selected');
    $('#n3-ui_' + id).addClass('selected');
    
    n3.timeline.switchScene(id);
}