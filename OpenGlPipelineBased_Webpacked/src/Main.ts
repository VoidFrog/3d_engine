import Engine3d from './Engine3d'
import { f1Model, mountains, map } from './ModelLoader'
import Vec3d from './Vec3d'
import Game from './Game'

function main(){
    let canvas = document.getElementById('root') as HTMLCanvasElement
    let ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Vec3d.clippingDebug = true    //enable this if you want to see the clipped triangles colored
    let engine = new Engine3d(ctx)
    engine.setPlayerMesh(f1Model())
    engine.setMapMesh(map())         //MAP HAS 500width AND 500height
    
    // let controls = new CameraControls(game.engine)
    let game = new Game(engine)
    game.makeCameraControl()
    game.enableCameraControl()  //add true if you want to add movement
    game.createPlayerControls() //created and enabled

    // engine.addMesh(mountains())

    const render = () => {
        let time = Date.now()
        game.ControlsTick() //uses camera and object controls  || comment if you want to move around with camera only

        // game.cameraControls.move() uncomment if you want to move camera around after disabling playerControls
        game.tick(time)

        window.requestAnimationFrame(render)
    }
    window.requestAnimationFrame(render)
}

main()