class N3Trigger
    @TYPES =
        VIS: 'vis'
        TIMELINE: 'timeline'
        DELAY: 'delay'
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
        
    @WHERE =
        ELAPSED: 'elapsed'
        DELAY: 'delay_'
    
    @registered = {}
    
    @register = (trigger) ->
        success = true
        
        @registered[trigger.type] or= {}
        @registered[trigger.type][trigger.test] or= {}
        @registered[trigger.type][trigger.test][trigger.triggerId] = trigger
        
        # If we're a OR or AND trigger, register the individual sub-triggers
        # for fast look up, but have them point to the parent OR/AND trigger
        if trigger.type == @TYPES.OR or trigger.type == @TYPES.AND
            if trigger.triggers?
                for t in trigger.triggers
                    @registered[t.type] or= {}
                    @registered[t.type][t.test] or= {}
                    @registered[t.type][t.test][t.triggerId] = trigger
                    
                    if t.type == @TYPES.DOM
                        success = @bindDomTrigger(t)
        
        # If we're listening for a DOM event, use d3 to add an event listener
        # to the DOM node
        if trigger.type == @TYPES.DOM
            success = @bindDomTrigger(trigger)
                
        return success
        
    @deregister = (trigger) ->
        [type, test, triggerId] = [trigger.type, trigger.test, trigger.triggerId]
        
        trigger = @registered[type][test]?[triggerId]
        
        # If the trigger was a DOM event, use d3 to remove the event listener    
        if type == @TYPES.DOM
            d3.select(trigger.test)
                .on(trigger.value, null)
        
        delete @registered[type][test]?[triggerId]
            
        true
        
    @bindDomTrigger = (trigger) ->
        elems = d3.select(trigger.test)
        return false unless elems[0][0]?   # If elem doesn't exist, defer registration
          
        d3.select(trigger.test)
            .on(trigger.value, =>
                return n3.trigger.notify(@TYPES.DOM, trigger.test, trigger.value)
            )
        
        true
        
    @notify = (type, test, value) ->
        if @registered[type]?[test]?
            for triggerId, trigger of @registered[type][test]
                eval = trigger.evaluate(test, value);
                N3Timeline.notifyTrigger(trigger, eval) 
                        
        true;

    
    constructor: (binding, triggers...) ->  
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
                
        @triggerId = @type + @test + '' + Date.now() + (Math.random() * 11)
                
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
        
    # Delay triggers always evaluate as false but a d3.timer registers that calls
    # this function to manually notify the timeline.     
    fireDelay: () ->             
        N3Timeline.notifyTrigger(this, true)        
        return true
        
    evaluate: (notifiedTest, notifiedVal, parent) ->
        if @type == N3Trigger.TYPES.DOM
            return true
        else if @type == N3Trigger.TYPES.OR
            for trigger in @triggers
                result = if (trigger.test + "") == (notifiedTest + "") then trigger.evaluate(notifiedTest, notifiedVal, this) else false
                return true if result == true   # If at least one is true, then return
                            # If we've made it through all triggers without
            return false    # returning, then none of them were true
        else if @type == N3Trigger.TYPES.AND
            for trigger in @triggers
                result = if (trigger.test + "") == (notifiedTest + "") then trigger.evaluate(notifiedTest, notifiedVal, this) else false

                # In AND triggers, we want to check the ambient value of states
                # because they may have been triggered previously
                if result == false and trigger.type == N3Trigger.TYPES.VIS
                    result = trigger.evaluate(trigger.test, N3Vis.lookup[trigger.test[0]]?.state(trigger.test[1]))

                return false if result == false   # If at least one is false, then return
                            # If we've made it through all triggers without
            return true     # returning, then none of them were false
        else if @type == N3Trigger.TYPES.DELAY  # If it's a delay, register a timer
            c = => return if parent? then parent.fireDelay() else @fireDelay()
            d3.timer(c, @value)        # and evaluate this trigger as false
            return false
        else
            return true if (@type == N3Trigger.TYPES.DOM) or 
                (@condition == N3Trigger.CONDITIONS.IS   and notifiedVal == @value) or \ 
                (@condition == N3Trigger.CONDITIONS.NOT  and notifiedVal != @value) or \ 
                (@condition == N3Trigger.CONDITIONS.GT   and notifiedVal >  @value) or \ 
                (@condition == N3Trigger.CONDITIONS.LT   and notifiedVal <  @value) or \ 
                (@condition == N3Trigger.CONDITIONS.GTE  and notifiedVal >= @value) or \ 
                (@condition == N3Trigger.CONDITIONS.LTE  and notifiedVal <= @value) 
                
        return false 
        
n3.trigger = (binding) ->
    new N3Trigger(binding)
    
n3.trigger.or = (triggers...) ->
    new N3Trigger(N3Trigger.TYPES.OR, triggers...)
    
n3.trigger.and = (triggers...) ->
    new N3Trigger(N3Trigger.TYPES.AND, triggers...)
    
n3.trigger.notify = (type, test, value) ->
    N3Trigger.notify(type, test, value)
    
n3.trigger.afterPrev = (delay) ->
    t = new N3Trigger(N3Trigger.TYPES.DELAY, N3Trigger.WHERE.DELAY)
    t.gte(delay)