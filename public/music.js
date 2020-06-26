var handle = window.Framework.EventBus.handle
var Howl = window.Framework.Sounds.Howl

var music = new Howl({
    src: ['Komiku_-_02_-_Chill_Out_Theme.mp3'],
    loop: true,
    autoplay: false,
    volume: 0.3
})

handle("startGame", function() {
    music.play()
    music.volume(0.05)
})

handle("nextLevel", function() {
    music.fade(0.3, 0.05, 400)
})

handle("startLevel", function() {
    music.fade(0.05, 0.3, 1000)
})


handle("gameOver", function() {
    music.stop()
})
