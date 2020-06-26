var handle = window.Framework.EventBus.handle
var Howl = window.Framework.Sounds.Howl

var success = new Howl({
    src: ['zapsplat_multimedia_game_sound_soft_warm_watery_positive_tone_001_52087.mp3'],
    loop: false,
    preload: true,
    volume: 1
})
var error = new Howl({
    src: ['zapsplat_multimedia_error_tone_buzz_17636.mp3'],
    loop: false,
    preload: true,
    volume: 1
})

handle("success", function() {
    success.play()
})

handle("nextLevel", function() {
    success.stop()
})

handle("bonus", function() {
    success.play()
})

handle("error", function() {
    error.play()
})

