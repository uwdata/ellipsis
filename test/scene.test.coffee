describe "scene", ->
    vis = null
    scene = null
    
    beforeEach ->
        vis = n3.vis('sceneTest')
                    .state('state_1', ['valid', 'values'])
                    .state('state_2', [true, false])
                    
    it "sets the state", ->
        scene = n3.scene('scene_1')
                    .set(vis, 'state_1', 'valid')
                    .set('sceneTest', 'state_2', false)
                    
        expect(scene.members[0].vis).toBe vis
        expect(scene.members[0].state.id).toBe 'state_1'
        expect(scene.members[0].state.value).toBe 'valid'
        
        expect(scene.members[1].vis).toBe vis
        expect(scene.members[1].state.id).toBe 'state_2'
        expect(scene.members[1].state.value).toBe false
        
    it "adds members", ->
        f = ->
            console.log('hello')
            
        a = n3.annotation('f')
                .adder(f)
            
        scene = n3.scene('scene_2')
                    .add(vis, f)
                    .add(vis, a)
                        
        expect(scene.members[0].vis).toBe vis
        expect(scene.members[0].member).toBe f

        expect(scene.members[1].vis).toBe vis
        expect(scene.members[1].member).toBe a