describe "trigger", ->
    vis = null
    
    beforeEach ->
        vis = n3.vis('triggerTest')
                    .state('state_1', ['valid', 'value'])
                    .state('state_2', [1, 2, 3, 4, 5, 6])
                    .render(->
                        console.log('triggerTest render');
                    )
        
    it "is equal", ->
        t = n3.trigger(vis)
                .where('state_1')
                .is('value')
                
        expect(t.evaluate([vis.visId, 'state_1'], 'valid')).toBe false
        expect(t.evaluate([vis.visId, 'state_1'], 'value')).toBe true
        
    it "is not", ->
        t = n3.trigger(vis)
                .where('state_1')
                .not('value')
                
        expect(t.evaluate([vis.visId, 'state_1'], 'valid')).toBe true
        expect(t.evaluate([vis.visId, 'state_1'], 'value')).toBe false
        
    it "is greater than", ->
        t = n3.trigger(vis)
                .where('state_2')
                .gt(3)
                
        expect(t.evaluate([vis.visId, 'state_2'], 1)).toBe false
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe false
        expect(t.evaluate([vis.visId, 'state_2'], 5)).toBe true
        
    it "is greater than or equal to", ->
        t = n3.trigger(vis)
                .where('state_2')
                .gte(3)

        expect(t.evaluate([vis.visId, 'state_2'], 1)).toBe false
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe true
        expect(t.evaluate([vis.visId, 'state_2'], 5)).toBe true
        
    it "is less than", ->
        t = n3.trigger(vis)
                .where('state_2')
                .lt(3)
                
        expect(t.evaluate([vis.visId, 'state_2'], 1)).toBe true
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe false
        expect(t.evaluate([vis.visId, 'state_2'], 5)).toBe false
        
    it "is less than", ->
        t = n3.trigger(vis)
                .where('state_2')
                .lte(3)

        expect(t.evaluate([vis.visId, 'state_2'], 1)).toBe true
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe true
        expect(t.evaluate([vis.visId, 'state_2'], 5)).toBe false
        
    it "is and trigger", ->
        t = n3.trigger.and(
                n3.trigger(vis)
                        .where('state_1')
                        .is('value'),
                
                n3.trigger(vis)
                        .where('state_2')
                        .is(3)                
            )

        vis.state('state_1', 'valid')
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe false
        expect(t.evaluate([vis.visId, 'state_1'], 'value')).toBe false
        
        vis.state('state_1', 'value')
        expect(t.evaluate([vis.visId, 'state_2'], 4)).toBe false
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe true
        
    it "is or", ->
        t = n3.trigger.or(
                n3.trigger(vis)
                        .where('state_1')
                        .is('value'),
                        
                n3.trigger(vis)
                        .where('state_2')
                        .is(3)
            )
            
        expect(t.evaluate([vis.visId, 'state_1'], 'valid')).toBe false
        expect(t.evaluate([vis.visId, 'state_1'], 'value')).toBe true
        expect(t.evaluate([vis.visId, 'state_2'], 5)).toBe false
        expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe true
        
        t = n3.trigger.or(
                n3.trigger(vis)
                        .where('state_1')
                        .is(5),
                        
                n3.trigger(vis)
                        .where('state_2')
                        .lt(3)
            )  
            
         expect(t.evaluate([vis.visId, 'state_1'], 5)).toBe true
         expect(t.evaluate([vis.visId, 'state_2'], 4)).toBe false     
         expect(t.evaluate([vis.visId, 'state_2'], 5)).toBe false
         expect(t.evaluate([vis.visId, 'state_2'], 3)).toBe false
         expect(t.evaluate([vis.visId, 'state_2'], 2)).toBe true
        
    # it "registers and is notified by state change", ->
    #     t = n3.trigger(vis)
    #             .where('state_1')
    #             .is('value')
    #             
    #     t1 = n3.trigger(vis)
    #             .where('state_2')
    #             .lte(3)     
    #             
    #     n3.trigger.register(t)
    #     n3.trigger.register(t1)   
    #     
    #     
    #     spyOn(t,  'evaluate')
    #     spyOn(t1, 'evaluate')
    #     
    #     vis.state('state_1', 'valid')
    #     expect(t.evaluate).toHaveBeenCalledWith('valid')
        