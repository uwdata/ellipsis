class N3Trigger
    @TYPES =
        VIS: 'vis'
        TIMELINE: 'timeline'
        DOM: 'dom'
        OR: 'or'
        AND: 'and'

    @CONDITIONS =
        IS: 'is'
        NOT: 'not'
        GT: 'gt'
        LT: 'lt'
        GTE: 'gte'
        LTE: 'lte'
    
    @registered = {}
    
    @register = (trigger) ->
        @registered[trigger.type][trigger.test] or= {}
        @registered[trigger.type][trigger.test][trigger.triggerId] = trigger
        
        # If we're a OR or AND trigger, register the individual sub-triggers
        # for fast look up, but have them point to the parent OR/AND trigger
        if trigger.type == @Types.OR or trigger.type == @TYPES.AND
            if trigger.triggers?
                for t in trigger.triggers
                    @registered[t.type][t.test] or= {}
                    @registered[t.type][t.test][t.triggerId] = trigger
        
        # If we're listening for a DOM event, use d3 to add an event listener
        # to the DOM node
        if trigger.type == @TYPES.DOM
            d3.select(trigger.test)
                .on(trigger.value, ->
                    return n3.trigger.notify(@TYPES.DOM, trigger.test, trigger.value)
                )
                
        true
        
    @deregister = (trigger) ->
        [type, test, triggerId] = [trigger.type, trigger.test, trigger.triggerId]
        
        trigger = @registered[type][test][triggerId]
        
        delete @registered[type][test][triggerId]
        delete @registered[type][test] if d3.keys(@registered[type][test]).length == 0
        
        # If the trigger was a DOM event, use d3 to remove the event listener    
        if type == @TYPES.DOM
            d3.select(trigger.test)
                .on(trigger.value, null)
            
        true
        
    @notify = (type, test, value) ->
        if @registered[type]?[test]? and type != @TYPES.DOM
            for trigger in @registered[type][test]
                n3.timeline().notifyTrigger(trigger.triggerId) \
                    if trigger.evaluate(value)

    
    constructor: (binding, triggers...) ->      
        for t of N3Trigger.TYPES
            N3Trigger.registered[t] or= {}
        
        if arguments.length == 1            # Only a single trigger
            if typeof binding == 'object'   # could be an n3.vis or n3.timeline
                if binding.visId?
                    @type = N3Trigger.TYPES.VIS
                    @test or= [binding.visId, undefined]
                else
                    @type = N3Trigger.TYPES.TIMELINE
            else if typeof binding == 'string'  # could be a visID or a dom selector
                if N3Vis.lookup[binding]?
                    @type = N3Trigger.TYPES.VIS
                    @test or= [binding, undefined]
                else
                    @type = N3Trigger.TYPES.DOM
                    @test = binding
        else    # n3.trigger.or / n3.trigger.and
            @type = binding
            @triggers = triggers
                
        @triggerId = @type + '' + new Date().getTime()   
                
        return this
        
    where: (test) ->
        if @type == N3Trigger.TYPES.VIS
            @test[1] = test
        else
            @test = test
            
        return this
        
    is: (@value) ->
        @condition = N3Trigger.CONDITIONS.IS
        
        return this
        
    not: (@value) ->
        @condition = N3Trigger.CONDITIONS.NOT
        
        return this
        
    gt: (@value) ->
        @condition = N3Trigger.CONDITIONS.GT
        
        return this
        
    greaterThan: (@value) ->
        @gt @value
        
    lt: (@value) ->
        @condition = N3Trigger.CONDITIONS.LT
        
        return this
        
    lessThan: (@value) ->
        @lt @value
        
    gte: (@value) ->
        @condition = N3Trigger.CONDITIONS.GTE
        
        return this
        
    greaterThanOrEqual: (@value) ->
        @gte @value    
        
    lte: (@value) ->
        @condition = N3Trigger.CONDITIONS.LTE
        
        return this
        
    lessThanOrEqual: (@value) ->
        @lte @value
        
    on: (@value) ->        
        return this
        
    evaluate: (notifiedVal) ->
        if @type == N3Trigger.TYPES.DOM
            return true
        else if @type == N3Trigger.TYPES.OR
            for trigger in @triggers
                result = trigger.evaluate(notifiedVal)
                return true if result == true   # If at least one is true, then return
                            # If we've made it through all triggers without
            return false    # returning, then none of them were true
        else if @type == N3Trigger.TYPES.AND
            for trigger in @triggers
                result = trigger.evaluate(notifiedVal)
                return false if result == false   # If at least one is false, then return
                            # If we've made it through all triggers without
            return true     # returning, then none of them were false               
        else
            return true if (type == @TYPES.DOM) or 
                (trigger.condition == @CONDITIONS.IS  and notifiedVal == trigger.value) or \ 
                (trigger.condition == @CONDITIONS.NOT and notifiedVal != trigger.value) or \ 
                (trigger.condition == @CONDITIONS.GT  and notifiedVal >  trigger.value) or \ 
                (trigger.condition == @CONDITIONS.LT  and notifiedVal <  trigger.value) or \ 
                (trigger.condition == @CONDITIONS.GTE and notifiedVal >= trigger.value) or \ 
                (trigger.condition == @CONDITIONS.LTE and notifiedVal <= trigger.value)        
        
n3.trigger = (binding) ->
    new N3Trigger(binding)
    
n3.trigger.or = (triggers...) ->
    new N3Trigger(N3Trigger.TYPES.OR, triggers...)
    
n3.trigger.and = (triggers...) ->
    new N3Trigger(N3Trigger.TYPES.AND, triggers...)
    
n3.trigger.notify = (type, test, value) ->
    N3Trigger.notify(type, test, value)