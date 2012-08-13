class N3Timeline
    @triggers = {}
    @deferredTriggers = {}
    @transitions = {}  
    @startTime = 0
    @elapsedTime = 0  
    @paused = false
        
    @switchScene: (sceneId) ->
        @prevSceneId = @currSceneId
        @prevParentId = @currParentId
        prevScene    = if @prevParentId? then \
                                N3Scene.scenes[@prevParentId].subScenes[@prevSceneId] else \
                                                                N3Scene.scenes[@prevSceneId]
        
        if sceneId.indexOf('>') != -1   # switching to subscene
            @currParentId = sceneId.split('>')[0].trim()
            currParent    = N3Scene.scenes[@currParentId]
            @currSceneId  = sceneId.split('>')[1].trim()
            currentScene  = currParent.subScenes[@currSceneId]
        else
            @currParentId = undefined
            currParent    = undefined
            @currSceneId  = sceneId
            currentScene  = N3Scene.scenes[@currSceneId]
        
        # We want to remove annotations only if prevScene and currentScene
        # aren't subscenes of the same parent scene
        if prevScene?
            unless prevScene.parent? and currentScene.parent? and \
                        prevScene.parent.sceneId == currentScene.parent.sceneId
                        
                members = []
                members.push m for m in prevScene.members
                if prevScene.parent?
                    for subSceneId, subScene of prevScene.parent.subScenes
                        continue unless subScene.members?
                        members.push m for m in subScene.members                
                
                for m in members
                    @deregisterTrigger m.trigger
                  
                    continue if m.state?                  
                    continue unless m.member?.annotId?  # check for N3Annotation
                  
                    m.member.vis(m.visId) # just in case
                    m.member.remove() if m.member.autoExitFlag 
                  
        # Run any transitions
        if @transitions[@prevSceneId]?[@currSceneId]?      
            for transFunc in @transitions[@prevSceneId][@currSceneId]
                transFunc(prevScene, currentScene)
                
        # TODO: TRANSITIONS for Parents/Subscenes
                
        # if prevParent? or currParent?  # Transition parsing for subscenes
        #     
        #     
        #     
        #     if @transitions[@prevSceneId]?[currParentId]?  # Transitions for parent scenes
        #         for transFunc in @transitions[@prevSceneId][currParentId]
        #             transFunc(prevScene, currParent)
        #             
        #     if @transitions[@prevSceneId]?[sceneId]?      # Transitions defined for parent > child
        #         for transFunc in @transitions[@prevSceneId][sceneId]
        #             transFunc(prevScene, currentScene)
            
        # Start the timer for the current scene after the transition is complete
        @start(true)
        
        evaluateMembers = [];
       
        if currentScene?
            for m, i in currentScene.members            
                evaluateMembers[i] = false;
                
                if m.trigger?                    
                    # If we see a trigger, feed it ambient values, to see
                    # if the trigger conditions have already been met. If it has,
                    # evaluate the member. If not, register the trigger and skip
                    # evaluation.
                    # ACTUALLY -- since we register triggers first, don't check ambience. 
                    # currentValue = null
                    # 
                    # if m.trigger.type == N3Trigger.TYPES.VIS
                    #     visId = m.trigger.test[0]
                    #     stateId = m.trigger.test[1]
                    # 
                    #     currentValue = N3Vis.lookup[visId]?.state(stateId)
                    # 
                    # if m.trigger.type == N3Trigger.TYPES.DOM or \
                    #         m.trigger.type == N3Trigger.TYPES.DELAY or \
                    #             m.trigger.evaluate(m.trigger.test, currentValue) == false
                           
                    @registerTrigger(m.trigger, i)
                    continue
                
                evaluateMembers[i] = true;

            # In case the first member has a delay trigger
            N3Trigger.notify(N3Trigger.TYPES.DELAY, N3Trigger.WHERE.DELAY + '-1', 1)
                
            for m, i in currentScene.members
                currentScene.evalMember(i) if evaluateMembers[i]
                
            # Now that all members have been added, see if we can register
            # some of our defered triggers.
            for id, t of @deferredTriggers
                @registerTrigger(t.trigger, t.memberIndex)
                                    
        true
        
    @registerTrigger: (trigger, memberIndex) ->
        return true unless trigger?

        bindDelay = (trigger) ->
            # If it's a delay trigger, automatically bind it to the prev
            # member's index
            if trigger.type == N3Trigger.TYPES.DELAY
                trigger.where(N3Trigger.WHERE.DELAY + (memberIndex - 1))

            # For OR or AND triggers, recursively apply this. 
            if trigger.triggers?
                trigger.triggers = (bindDelay(t) for t in trigger.triggers)

            return trigger

        trigger = bindDelay(trigger);

        @triggers[trigger.triggerId] = 
            sceneId: @currSceneId
            parentId: @currParentId
            memberIndex: memberIndex
            
        success = N3Trigger.register(trigger)
        if success
            delete @deferredTriggers[trigger.triggerId]
        else
            @deferredTriggers[trigger.triggerId] = 
                trigger: trigger
                memberIndex: memberIndex
        
        true
        
    @deregisterTrigger: (trigger) ->
        return true unless @triggers[trigger?.triggerId]?
        
        delete @triggers[trigger.triggerId]
        delete @deferredTriggers[trigger.triggerId]
        N3Trigger.deregister(trigger)
        
        true
        
    @notifyTrigger: (trigger, eval) ->
        if @triggers[trigger.triggerId]?
            t = @triggers[trigger.triggerId]
            
            if t['eval'] == eval    # If the trigger has already been evaluated
                return;             # to this value, do nothing
            
            scene = if t.parentId? then \
                         N3Scene.scenes[t.parentId].subScenes[t.sceneId] \ 
                    else N3Scene.scenes[t.sceneId]
            
            if eval == true            
                if t.memberIndex?       # Member triggers
                    scene?.evalMember(t.memberIndex)
                # else                    # Scene triggers
                    # if t.parentId? then @switchScenes(t.parentId + '>' + t.sceneId) else @switchScenes(t.sceneId)
            else
                m = if t.memberIndex? then scene.members[t.memberIndex] else null
                if m?.member.annotId?
                    m.member.vis(m.visId) # just in case
                    m?.member.remove()
                    
            # See if this trigger has caused some member to be added such that
            # we can now register some of our defered triggers.
            for id, t of @deferredTriggers
                @registerTrigger(t.trigger, t.memberIndex)
            
            # Deregister a timeline trigger once it has fired because we can't go back in time
            @deregisterTrigger trigger if trigger.type == N3Trigger.TYPES.TIMELINE
            
            @triggers[trigger.triggerId]['eval'] = eval
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
        else if transQ.indexOf('>') != -1   # Subscening
            scenes.push (id.trim() for id in transQ.split('>')).join('>')
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