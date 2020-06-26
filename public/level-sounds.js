var handle = window.Framework.EventBus.handle
var Howl = window.Framework.Sounds.Howl

var complete = new Howl({
    src: [
        "zapsplat_multimedia_game_sound_relaxed_zen_warm_positive_ending_complete_52080.mp3"
    ],
    loop: false,
    preload: true,
    volume: 1
})
var gameOver = new Howl({
    src: ["cartoon_fail_trumpet_002.mp3"],
    loop: false,
    preload: true,
    volume: 1
})
var heartBeat = new Howl({
    src: ["human_heart_beat.mp3"],
    loop: false,
    preload: true,
    volume: 1
})

handle("timeRemaining", time => {
    if (time === 10) {
        heartBeat.play()
    }
})

handle("nextLevel", function() {
    heartBeat.stop()
    complete.play()
})

handle("gameOver", function() {
    heartBeat.stop()
    gameOver.play()
})
