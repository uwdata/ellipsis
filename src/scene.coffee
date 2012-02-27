class N3Scene
    @scenes = {}
    
    constructor: (@sceneId) ->
        # members = [
        #   {
        #        vis: visObj,
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
        
    set: (visObj, stateId, val, triggerObj) ->
        visObj = N3Vis.lookup[visObj] unless typeof visObj == 'object'
        
        member =
            vis: visObj
            state:
                id: stateId
                value: val
            trigger: triggerObj
        
        @members.push member
        
        return this
        
    add: (visObj, memberObj, triggerObj) ->
        visObj = N3Vis.lookup[visObj] unless typeof visObj == 'object'
        
        member =
            vis: visObj
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
        @subScenes[subSceneId] or= new N3Scene(subSceneId)
        
n3.scene = (sceneId) ->
    N3Scene.scenes[sceneId] or= new N3Scene(sceneId)