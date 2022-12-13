import Engine3d from './Engine3d'
import { f1Model, mountains, map, road, finish, botCar } from './ModelLoader'
import Game from './Game'
import Vec3d from './Vec3d'

let canvas = document.getElementById('root') as HTMLCanvasElement
let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
let sliderX = 0;
let inDemo = false
let demo:NodeJS.Timer
let startScreen:NodeJS.Timer
let demoStopped = false
let gameStart = true 

function main(){
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    manageStartingScreen()
}

function manageStartingScreen(){
    let startingScreenAudio = new Audio('./audio/getReady_start_screen.mp3')
    startingScreenAudio.play()
    startScreen = setInterval(welcomeScreen, 10)

    const start = () => {
        if (demoStopped && gameStart){
            engineGameInit()
            gameStart = false
        }
    }

    let tryStarting = setInterval(start, 100)
}

function playDemo(){
    window.addEventListener('click', ()=>{
        clearInterval(demo)
        demoStopped = true
    })

    let engine = new Engine3d(ctx)
    engine.setPlayerMesh(f1Model())
    engine.setMapMesh(map())         //MAP HAS 500width AND 500height
    engine.setRoadMesh(road())
    engine.addMesh(finish())

    let game = new Game(engine)
    game.demoMode = true
    game.makeCameraControl()
    game.enableCameraControl()  //add true if you want to add movement
    game.createPlayerControls() //created and enabled

    const render = () => {
        let time = Date.now()
        // game.controlsTick() //uses camera and object controls  || comment if you want to move around with camera only

        game.engine.vCamera = Vec3d.add_vectors(new Vec3d(0,10,0), game.botCars[2].positionVector)
        game.engine.fYaw = game.botCars[2].fYawMesh + 90
        game.cameraControls.move(new Vec3d(0,0,0)) //uncomment if you want to move camera around after disabling playerControls
        game.tick(time) //this is basically a render call        
    }

    demo = setInterval(render, 50)
}

function engineGameInit(){
    // Vec3d.clippingDebug = true    //enable this if you want to see the clipped triangles colored
    let engine = new Engine3d(ctx)
    // engine.showTriangleOutlines = true  // enable this if you want to see clearly outline of each triangle
    engine.setPlayerMesh(f1Model())
    engine.setMapMesh(map())         //MAP HAS 500width AND 500height
    engine.setRoadMesh(road())
    engine.addMesh(finish())
    // engine.addMesh(botCar())      //model of an bot controlled car
    
    // let controls = new CameraControls(game.engine)
    let game = new Game(engine)
    game.makeCameraControl()
    game.enableCameraControl()  //add true if you want to add movement
    game.createPlayerControls() //created and enabled

    // engine.addMesh(mountains())

    const render = () => {
        let time = Date.now()
        game.controlsTick() //uses camera and object controls  || comment if you want to move around with camera only

        // game.cameraControls.move() uncomment if you want to move camera around after disabling playerControls
        game.tick(time) //this is basically a render call

        window.requestAnimationFrame(render)
    }
    window.requestAnimationFrame(render)
}

function welcomeScreen(){
    let startingImg = document.createElement('img')
    startingImg.src = './models/startingScreen.png'
    ctx.drawImage(startingImg, 0,0, window.innerWidth, window.innerHeight)
    ctx.save()

    let image = document.createElement('img')
    image.src = './models/prepareToQualifySlider.png'

    ctx.drawImage(image, window.innerWidth-sliderX, window.innerHeight/3, window.innerWidth/2, window.innerHeight/10)
    sliderX += 8

    ctx.restore()

    if(sliderX > window.innerWidth*2){
        inDemo = true
        clearInterval(startScreen)
        playDemo()
    }
}

main()