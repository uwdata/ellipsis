describe 'annotation', ->
    it 'sets/gets data', ->  
        d = ['do', 're', 'mi', 'fa', 'so']
        
        # Testing if .data() sets and is chainable
        expect(n3.annotation('custom').data(d).data()).toBe d
        
        # Testing if .data() supports different data types
        d1 = {Jagger: 'Rock', Elvis: 'Roll'}
        expect(n3.annotation('custom').data(d1).data()).toBe d1
        
        d2 = 
            brother:
                name: 'Max'
                age:  11
              sister:
                name: 'Ida'
                age:  9
        
        expect(n3.annotation('custom').data(d2).data()).toBe d2
        
        # Tests that .data is not set for another vis
        expect(n3.annotation('custom2').data()).toBeUndefined
        
    it 'is a custom annotation', ->
        f = (arg1, arg2) ->
            console.log('Arg1: ' + arg1 + ' Arg2: ' + arg2)
            
        a = n3.annotation('custom')
        expect(a.templateFn).toBeUndefined
        
        a.template(f)
            .args('hello', [1, 2, 3], { 'foo': 'bar' }, 'world')
                
        expect(a.templateFn).toBe f
        
        spyOn(a, 'templateFn')
        a.draw()
        
        expect(a.templateFn).toHaveBeenCalledWith('hello', [1, 2, 3], { 'foo': 'bar' }, 'world')
        
    it 'is a circle', ->
        a = n3.annotation('circle')
                .center([15, 45])
                .radius(5)
                .data([1])  # to test chaining
                
        spyOn(a, 'templateFn')
        a.draw()
        
        expect(a.templateFn).toHaveBeenCalledWith(5, [15, 45])
        
    it 'is an ellipse', ->
        a = n3.annotation('ellipse')
                .radius([3, 7])
                .center([11, 21])
                .data([2])  # to test chaining
                
        spyOn(a, 'templateFn')
        a.draw()

        expect(a.templateFn).toHaveBeenCalledWith([3, 7], [11, 21])        
        
    it 'is a line', ->
        a = n3.annotation('line')
                .start([6, 8], true)
                .end([32, 12], false)
                .data([3])  # to test chaining
                
        spyOn(a, 'templateFn')
        a.draw()
        
        expect(a.templateFn).toHaveBeenCalledWith([6, 8], true, [32, 12], false)
        
    it 'is a rectangle', ->
        a = n3.annotation('rectangle')
                .pos([17, 14])
                .size([42, 91])
                .data([4])  # to test chaining

        spyOn(a, 'templateFn')
        a.draw()

        expect(a.templateFn).toHaveBeenCalledWith([42, 91], [17, 14]) 
        
    it 'is a label', ->
        a = n3.annotation('label')
                .html('<p>Hello</p>')
                .text('world')
                .pos([3, 7])
                .data([4])  # to test chaining

        spyOn(a, 'templateFn')
        a.draw()

        expect(a.templateFn).toHaveBeenCalledWith('world', '<p>Hello</p>', [3, 7])               
        