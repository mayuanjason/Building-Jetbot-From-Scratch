$(function() {
    $('#forward').click(function() {
        $.ajax({
            url: '/teleop/forward',
            type: 'get',
        })
    })
    
    $('#left').click(function() {
        $.ajax({
            url: '/teleop/left',
            type: 'get',
        })
    })

    $('#stop').click(function() {
        $.ajax({
            url: '/teleop/stop',
            type: 'get',
        })
    })

    $('#right').click(function() {
        $.ajax({
            url: '/teleop/right',
            type: 'get',
        })
    })

    $('#backward').click(function() {
        $.ajax({
            url: '/teleop/backward',
            type: 'get',
        })
    })
})