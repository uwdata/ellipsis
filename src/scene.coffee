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
        
n3.scene = (sceneId) ->
    N3Scene.scenes[sceneId] or= new N3Scene(sceneId)