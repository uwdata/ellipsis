describe "scene", ->
    vis = null
    scene = null
    f = null
    a = null
    
    beforeEach ->	
        vis = n3.vis('sceneTest')
                    .state('state_1', ['valid', 'values'])
                    .state('state_2', [true, false])
                    .render(->
                        console.log('render!');
                    )
                    
        f = ->
            console.log('hello')

        a = n3.annotation('f')
                .adder(f)
                    
    it "sets the state", ->
        scene = n3.scene('scene_1')
                    .set(vis, 'state_1', 'valid')
                    .set('sceneTest', 'state_2', false)
                    
        expect(scene.members[0].visId).toBe vis.visId
        expect(scene.members[0].state.id).toBe 'state_1'
        expect(scene.members[0].state.value).toBe 'valid'
        
        expect(scene.members[1].visId).toBe vis.visId
        expect(scene.members[1].state.id).toBe 'state_2'
        expect(scene.members[1].state.value).toBe false
        
    it "adds members", ->            
        scene = n3.scene('scene_2')
                    .add(vis, f)
                    .add(vis, a)
                        
        expect(scene.members[0].visId).toBe vis.visId
        expect(scene.members[0].member).toBe f

        expect(scene.members[1].visId).toBe vis.visId
        expect(scene.members[1].member).toBe a
        
    it "evaluates members", ->        
        scene = n3.scene('scene_3')
                    .set(vis, 'state_1', 'value')
                    .add(vis, f)
                    .set(vis, 'state_2', true)
                    .add(vis, a)
                    
        spyOn(vis, 'renderFn')
        scene.evalMember(0)
        expect(vis.state('state_1')).toBe 'value'
        expect(vis.renderFn).toHaveBeenCalledWith()
        
        spyOn(scene.members[1], 'member')
        scene.evalMember(1)
        expect(vis.renderFn.callCount).toBe 1   # adding an annotation shouldn't re-render
        expect(scene.members[1].member).toHaveBeenCalledWith(vis)
        
        scene.evalMember(2)
        expect(vis.state('state_2')).toBe true
        expect(vis.renderFn).toHaveBeenCalledWith()
        expect(vis.renderFn.callCount).toBe 2
        
        spyOn(a, 'adderFn')
        scene.evalMember(3)
        expect(a.adderFn).toHaveBeenCalledWith()
        
        
    it "clones a scene", ->
        scene = n3.scene('scene_4')
                    .set(vis, 'state_1', 'value')
                    .add(vis, f)
                    .set(vis, 'state_2', true)
                    
        scene2 = scene.clone('scene_5')
                        .add('sceneTest', a)
                        
        expect(scene2.members[0].visId).toBe vis.visId
        expect(scene2.members[0].state.id).toBe 'state_1'
        expect(scene2.members[0].state.value).toBe 'value'
        
        spyOn(vis, 'renderFn')
        scene2.evalMember(0)
        expect(vis.state('state_1')).toBe 'value'
        expect(vis.renderFn).toHaveBeenCalledWith()        
        
        expect(scene2.members[1].visId).toBe vis.visId
        expect(scene2.members[1].member).toBe f
        
        spyOn(scene2.members[1], 'member')
        scene2.evalMember(1)
        expect(vis.renderFn.callCount).toBe 1   # adding an annotation shouldn't re-render
        expect(scene2.members[1].member).toHaveBeenCalledWith(vis)
        
        expect(scene2.members[2].visId).toBe vis.visId
        expect(scene2.members[2].state.id).toBe 'state_2'
        expect(scene2.members[2].state.value).toBe true
        
        scene2.evalMember(2)
        expect(vis.state('state_2')).toBe true
        expect(vis.renderFn).toHaveBeenCalledWith()
        expect(vis.renderFn.callCount).toBe 2
        
        expect(scene2.members[3].visId).toBe vis.visId
        expect(scene2.members[3].member).toBe a
        
        spyOn(a, 'adderFn')
        scene2.evalMember(3)
        expect(a.adderFn).toHaveBeenCalledWith()
        
    it "is a subscene", ->
        scene = n3.scene('scene_6')
                    .set(vis, 'state_1', 'value')
                    .add(vis, f)
                    
        subScene = scene.subScene('scene_6a')
                            .set(vis, 'state_2', true)
                            .add(vis, a)
                            
        expect(subScene.parent).toBe scene
        
        expect(subScene.members[0].visId).toBe vis.visId
        expect(subScene.members[0].state.id).toBe 'state_2'
        expect(subScene.members[0].state.value).toBe true
        
        spyOn(vis, 'renderFn')
        subScene.evalMember(0)
        expect(vis.state('state_2')).toBe true
        expect(vis.renderFn).toHaveBeenCalledWith()
        expect(vis.renderFn.callCount).toBe 1
        
        expect(subScene.members[1].visId).toBe vis.visId
        expect(subScene.members[1].member).toBe a        
        
        spyOn(a, 'adderFn')
        subScene.evalMember(1)
        expect(a.adderFn).toHaveBeenCalledWith()