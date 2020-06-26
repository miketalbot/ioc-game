var handle = window.Framework.EventBus.handle
var Howl = window.Framework.Sounds.Howl

var pops = []
var popIndex = 0
var produce = new Howl({
    src:['zapsplat_cartoon_bubble_002_46660.mp3'],
    loop: false,
    volume: 0.1
})

for(var i = 0; i < 10; i++) {
    pops.push(new Howl({
        src: ['zapsplat_cartoon_bubble_pop_005_40277.mp3'],
        loop: false,
        autoplay: false,
        volume: 0.7
    }))
}

let lastTime = 0

handle("bob", function() {
    if(Date.now() - lastTime > 300) {
        lastTime = Date.now()
        produce.play()
    }
})

handle("popped", function() {
    pops[popIndex ++ % pops.length].play()
})

