class N3Timeline
    constructor: ->
        @triggers = {}
        
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
                  @deregisterTrigger m.trigger
                  
                  continue if m.state?                  
                  continue unless m.member?.annotId?  # check for N3Annotation
                  
                  m.member.vis(m.visId) # just in case
                  m.member.remove()

        if currentScene?
            for m, i in currentScene.members            
                if m.trigger?
                    # If we see a trigger, feed it current possible values, to see
                    # if the trigger conditions have already been met. If it has,
                    # evaluate the member. If not, register the trigger and skip
                    # evaluation.
                    currentValue = null
                    if m.trigger.type == N3Trigger.TYPES.VIS
                        visId = m.trigger.test[0]
                        stateId = m.trigger.test[1]
                    
                        currentValue = N3Vis.lookup[visId]?.state(stateId)
                
                    if m.trigger.evaluate(currentValue) == false or \
                                        m.trigger.type == N3Trigger.TYPES.DOM
                        registerTrigger(m.trigger, i)
                        continue
                
                currentScene.evalMember(i)
                                    
        true
        
    registerTrigger: (trigger, memberIndex) ->
        return true unless trigger?
        
        @triggers[trigger.triggerId] = memberIndex
        N3Trigger.register(trigger)
        
        true
        
    deregisterTrigger: (trigger) ->
        return true unless trigger?
        
        delete @triggers[trigger.triggerId]
        N3Trigger.deregister(trigger)
        
        true
        
    notifyTrigger: (triggerId) ->
        N3Scene.scenes[@currSceneId]?.evalMember(i)
        
        true
    
n3.timeline = ->
    new N3Timeline()
