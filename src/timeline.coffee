class N3Timeline
    @triggers = {}
    
    @paused = false
        
    @switchScene: (sceneId) ->
        @prevSceneId = @currSceneId
        @currSceneId = sceneId
        prevScene    = N3Scene.scenes[@prevSceneId]
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
                  m.member.remove() if m.member.autoRemoveFlag
        
        @start(true)          
       
        if currentScene?
            for m, i in currentScene.members            
                if m.trigger?
                    # If it's a delay trigger, automatically bind it to the prev
                    # member's index
                    if m.trigger.type == N3Trigger.TYPES.DELAY
                        m.trigger.where(N3Trigger.WHERE.DELAY + (i - 1))
                    
                    # If we see a trigger, feed it ambient values, to see
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
        
    @registerTrigger: (trigger, memberIndex) ->
        return true unless trigger?
        
        @triggers[trigger.triggerId] = memberIndex
        N3Trigger.register(trigger)
        
        true
        
    @deregisterTrigger: (trigger) ->
        return true unless trigger?
        
        delete @triggers[trigger.triggerId]
        N3Trigger.deregister(trigger)
        
        true
        
    @notifyTrigger: (triggerId) ->
        N3Scene.scenes[@currSceneId]?.evalMember(i)
        
        true  
        
    @start: (reset) ->    
        if reset
            @startTime   = Date.now() 
            @elapsedTime = 0
        
        @pause = false
        d3.timer(@incrementTime)
        
    @incrementTime = ->
        @elapsedTime = Date.now() - @startTime
        N3Trigger.notify(N3Trigger.TYPES.TIMELINE, N3Trigger.WHERE.ELAPSED, @elapsedTime)

        return @paused
        
    @pause: ->
        @pause = true
    
n3.timeline or= {}    
n3.timeline.switchScene = (sceneId) ->
    N3Timeline.switchScene(sceneId)
    
n3.timeline.pause = ->
    N3Timeline.pause()
    
n3.timeline.resume = ->
    N3Timeline.start(false)