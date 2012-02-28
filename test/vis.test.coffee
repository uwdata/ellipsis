describe "vis", ->        
    vis = null
    vis2 = null
    
    beforeEach ->
        vis = n3.vis('visTest')
        vis2 = n3.vis('visTest2')
        
    it "sets/gets the stage", ->
        stage = d3.select('body')
                    .append('div')
                        .attr('id', 'stage')
        
        # Testing if .stage() sets all properties and is chainable
        expect(vis.stage('#stage', 100, 200).width()).toBe 100
        expect(vis.height()).toBe 200
        expect(vis.stage()).toEqual d3.select('#stage')
        
        # Tests .width() setter/getter/chaining
        expect(vis.width(150).height()).toBe 200
        expect(vis.width()).toBe 150
        
        # Tests .height() setter/getter/chaining
        expect(vis.height(250).width()).toBe 150
        expect(vis.height()).toBe 250
        
        # Tests that the stage has not been set for any other vis
        expect(vis2.width()).toBeUndefined
        
    it "sets/gets readOnly consts", ->        
        # Testing if .const() sets and is chainable
        expect(vis.const('foo', 'bar').const('foo')).toBe 'bar'
        
        # Testing to ensure consts are readOnly
        expect(vis.const('foo', 'baz').const('foo')).toBe 'bar'
        
        # Testing setting multiple consts
        expect(vis.const('hello', 'world').const('top', 'cat').const('foo')).toBe 'bar'
        expect(vis.const('hello')).toBe 'world'
        expect(vis.const('top')).toBe 'cat'
        
        # Testing to ensure consts not set on any other vis
        expect(vis2.const('foo')).toBeUndefined
        expect(vis2.const('hello')).toBeUndefined
        expect(vis2.const('top')).toBeUndefined
        
    it "sets/gets the data", ->  
        d = ["do", "re", "mi", "fa", "so"]
        
        # Testing if .data() sets and is chainable
        expect(vis.data(d).data()).toBe d
        
        # Testing if .data() supports different data types
        d1 = {Jagger: "Rock", Elvis: "Roll"}
        expect(vis.data(d1).data()).toBe d1
        
        d2 = 
            brother:
                name: "Max"
                age:  11
              sister:
                name: "Ida"
                age:  9
        
        expect(vis.data(d2).data()).toBe d2
        
        # Tests that .data is not set for another vis
        expect(vis2.data()).toBeUndefined

    it "sets/gets the state", ->
        vis.state('state1', ['va1', 'va2'])
            .state('state2', ['foo', 'bar', 'hello', 'world'])
            .render(->
                console.log('hello');
            )
         
        expect(vis.states['state1'].visId).toBe 'visTest'  
        expect(vis.states['state1'].validValues).toEqual ['va1', 'va2']
        expect(vis.states['state2'].validValues).toEqual ['foo', 'bar', 'hello', 'world']
        
        spyOn(vis, 'renderFn')
        
        vis.states['state1'].set('va1')
        expect(vis.renderFn).toHaveBeenCalled
        
        vis.state('state2', 'foo')
        expect(vis.renderFn).toHaveBeenCalled
        