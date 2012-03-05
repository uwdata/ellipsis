class N3Scene
    @scenes = {}
    
    constructor: (@sceneId) ->
        # members = [
        #   {
        #        visId: visId,
        #        state: {
        #            id: stateId
        #            value: value
        #        },
        #        member: annotation || function
        #        trigger: triggerObj
        #        
        #   }
        # ]
        @members = []
        @subScenes = 
            order: ''
        
        return this
        
    set: (vis, stateId, val, triggerObj) ->
        vis = vis.visId if typeof vis == 'object'
        
        member =
            visId: vis
            state:
                id: stateId
                value: val
            trigger: triggerObj
        
        @members.push member
        
        return this
        
    add: (vis, memberObj, triggerObj) ->
        vis = vis.visId if typeof vis == 'object'
        
        member =
            visId: vis
            member: memberObj
            trigger: triggerObj
        
        @members.push member
        
        return this
    
    # 1-index    
    member: (memberIndex) ->
        return @members[memberIndex + 1]?.member

    clone: (sceneID) ->
        newScene = n3.scene(sceneID)
        newScene.members = n3.util.clone @members
        newScene.subScenes = n3.util.clone @subScenes
        
        return newScene
        
    subScene: (subSceneId) ->
        if @subScenes[subSceneId]?
            return @subScenes
        else
            subScene = new N3Scene(subSceneId)
            subScene.parent = this
            
            @subScenes[subSceneId] = subScene
            
            return subScene
            
    evalMember: (memberIndex) ->
        m = @members[memberIndex]
        return true unless m?
        
        vis = N3Vis.lookup[m.visId]
        
        if m.state?
            val = m.state.value
            if typeof val == 'function'     # states can be set with a fn
                val = val(vis)              # pass it the vis as an arg
            
            vis?.state(m.state.id, val)        
        else
            if typeof m.member == 'function'
                m.member(vis)    # call the function, pass vis as arg
            else if m.member?.annotId?   # check for N3Annotation
                m.member.vis(m.visId)
                m.member.add()
        
        N3Trigger.notify(N3Trigger.TYPES.DELAY, N3Trigger.WHERE.DELAY + memberIndex, 1)
                
        true
        
n3.scene = (sceneId) ->
    N3Scene.scenes[sceneId] or= new N3Scene(sceneId)