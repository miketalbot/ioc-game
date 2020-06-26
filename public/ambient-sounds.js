var handle = window.Framework.EventBus.handle
var Howl = window.Framework.Sounds.Howl

var ripples = []
var rippleIndex = 0

for (var i = 0; i < 20; i++) {
    ripples.push(
        new Howl({
            preload: true,
            src: [
                "zapsplat_sport_diving_stick_throw_into_swiming_pool_water_splash_11427.mp3"
            ],
            sprite: {
                splash0: [500, 2000],
                splash1: [250, 1800],
                splash2: [700, 2000],
                splash3: [400, 2000]
            },
            loop: false,
            autoplay: false,
            volume: 0.1
        })
    )
}

let last = 0
let dedupe = 0
handle("player", function ({ distance }) {
    if (distance < 10 || Date.now() - last < 250) return
    dedupe++
    last = Date.now()
    let ripple = ripples[rippleIndex++ % ripples.length]
    ripple.play(`splash${dedupe & 3}`)
    ripple.volume(Math.min(1, distance / 100))
})
