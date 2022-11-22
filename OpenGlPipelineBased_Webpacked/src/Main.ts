import Engine3d from './Engine3d'
import { f1Model, mountains } from './ModelLoader'
import CameraControls from './Controls'

function main(){
    let canvas = document.getElementById('root') as HTMLCanvasElement
    let ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let engine = new Engine3d(ctx)
    engine.addMesh(f1Model())
    engine.addMesh(mountains())
    
    let controls = new CameraControls(engine)
    controls.enable()

    setInterval(() => {
        let time = Date.now()
        controls.move()
        engine.render(time)
    }, 1000/50)
}

main()