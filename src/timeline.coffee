class N3Timeline
    @triggers = {}
    @transitions = {}  
    @startTime = 0
    @elapsedTime = 0  
    @paused = false
        
    @switchScene: (sceneId) ->
        @prevSceneId = @currSceneId
        @currSceneId = sceneId
        prevScene    = N3Scene.scenes[@prevSceneId]
        currentScene = N3Scene.scenes[@currSceneId]
        
        if sceneId.indexOf('>') != -1   # switching to subscene
            parentSceneId = sceneId.split('>')[0].trim()
            parentScene   = N3Scene.scenes[parentSceneId]
            @currSceneId  = sceneId.split('>')[1].trim()
            currentScene  = parentScene.subScenes[@currSceneId]
        
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
        
        # Run any transitions
        if parentSceneId? and parentScene?  # Transition parsing for subscenes
            if @transitions[@prevSceneId]?[parentSceneId]?  # Transitions for parent scenes
                for transFunc in @transitions[@prevSceneId][parentSceneId]
                    transFunc(prevScene, parentScene)
                    
            if @transitions[@prevSceneId]?[sceneId]?      # Transitions defined for parent > child
                for transFunc in @transitions[@prevSceneId][sceneId]
                    transFunc(prevScene, currentScene)
            
        if @transitions[@prevSceneId]?[@currSceneId]?      
            for transFunc in @transitions[@prevSceneId][@currSceneId]
                transFunc(prevScene, currentScene)  
       
        # Start the timer for the current scene after the transition is complete
        @start(true)
        
        evaluateMembers = [];
       
        if currentScene?
            for m, i in currentScene.members            
                evaluateMembers[i] = false;
                
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
                    
                    if m.trigger.type == N3Trigger.TYPES.DOM or \
                            m.trigger.type == N3Trigger.TYPES.DELAY or \
                                m.trigger.evaluate(m.trigger.test, currentValue) == false
                           
                        @registerTrigger(m.trigger, i)
                        continue
                
                evaluateMembers[i] = true;
                
            for m, i in currentScene.members
                currentScene.evalMember(i) if evaluateMembers[i]
                                    
        true
        
    @registerTrigger: (trigger, memberIndex) ->
        return true unless trigger?
        
        @triggers[trigger.triggerId] = memberIndex
        N3Trigger.register(trigger)
        
        true
        
    @deregisterTrigger: (trigger) ->
        return true unless @triggers[trigger?.triggerId]?
        
        delete @triggers[trigger.triggerId]
        N3Trigger.deregister(trigger)
        
        true
        
    @notifyTrigger: (trigger) ->
        if @triggers[trigger.triggerId]?
            N3Scene.scenes[@currSceneId]?.evalMember(@triggers[trigger.triggerId]) 
            
            # Deregister a timeline trigger once it has fired because we can't go back in time
            @deregisterTrigger trigger if trigger.type == N3Trigger.TYPES.TIMELINE
        
        true  
        
    @parseTransSyntax: (transQ) ->
        return transQ if transQ instanceof Array
        
        scenes = []
        
        if transQ == '*'
            for sceneId of N3Scene.scenes
                scenes.push sceneId
                
                scene = N3Scene.scenes[sceneId]
                for subSceneId of scene.subScenes
                    scenes.push subSceneId
                
        else    # To allow individual sceneIds just to be passed without being arrays
            scenes.push transQ
                
        return scenes
        
    @transition: (fromScenes, toScenes, func) ->   
        fromScenes = @parseTransSyntax fromScenes
        toScenes = @parseTransSyntax toScenes
         
        for fromScene in fromScenes
            # Allow people to pass in scene objs too
            fromSceneId = if typeof fromScene == 'object' then fromScene.sceneId else fromScene
            
            @transitions[fromSceneId] or= {}
            
            for toScene in toScenes
                # Allow people to pass in scene objs too
                toSceneId = if typeof toScene == 'object' then toScene.sceneId else toScene
                            
                @transitions[fromSceneId][toSceneId] or= []
                @transitions[fromSceneId][toSceneId].push func
                
        return this
                
        
    @start: (reset) ->  
        if reset
            @startTime   = Date.now() 
            @elapsedTime = 0
        
        @paused = false
        d3.timer(=> @incrementTime())
        
    @incrementTime: ->
        @elapsedTime = Date.now() - @startTime
        N3Trigger.notify(N3Trigger.TYPES.TIMELINE, N3Trigger.WHERE.ELAPSED, @elapsedTime)

        return @paused
        
    @pause: ->
        @paused = true
    
n3.timeline or= {}    
n3.timeline.switchScene = (sceneId) ->
    N3Timeline.switchScene(sceneId)
    
n3.timeline.pause = ->
    N3Timeline.pause()
    
n3.timeline.resume = ->
    N3Timeline.start(false)
    
n3.timeline.elapsedTime = ->
    N3Timeline.elapsedTime
    
n3.timeline.transition = (fromScenes, toScenes, func) ->   
    N3Timeline.transition(fromScenes, toScenes, func)