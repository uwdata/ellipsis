class N3Timeline
    switchScene: (sceneId) ->
        @prevSceneId = @currSceneId
        @currSceneId = sceneId
        prevScene = N3Scene.scenes[@prevSceneId]
        currentScene = N3Scene.scenes[@currSceneId]
        
        # We want to remove annotations only if prevScene and currentScene
        # aren't subscenes of the same parent scene
        if prevScene?
            unless prevScene.parent? and currentScene.parent? and \
                        prevScene.parent.sceneId == currentScene.parent.sceneId
                        
              for m in prevScene.members
                  continue if m.state?                  
                  continue unless m.member.removerFn?  # check for N3Annotation
                  
                  m.member.vis(m.visId) # just in case
                  m.member.remove()
        
        for m in currentScene.members
            vis = N3Vis.lookup[m.visId]
            
            if m.trigger?
                console.log('TODO: Triggers!')
            else
                if m.state?
                    vis.set(m.state.id, m.state.value)        
                else
                    if typeof m.member == 'function'
                        m.member(vis)    # call the function, pass vis as arg
                    else if m.member.adderFn?   # check for N3Annotation
                        m.member.vis(m.visId)
                        m.member.add()
    
n3.timeline = ->
    new N3Timeline