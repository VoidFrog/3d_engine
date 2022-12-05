import Engine3d from "./Engine3d";
import CameraControls from "./CameraControls";
import ObjectControls from "./ObjectControls";

export default class Game {
    engine:Engine3d;
    cameraControls:CameraControls;
    playerControls:ObjectControls;

    constructor(engine:Engine3d){
        this.engine = engine

        this.audioController()
    }

    makeCameraControl(){
        let controls = new CameraControls(this.engine)
        this.cameraControls = controls
    }

    enableCameraControl(movement=false){
        this.cameraControls.enable(movement)
    }

    createPlayerControls(){
        this.playerControls = new ObjectControls(this.engine)
        this.playerControls.enable()
    }

    ControlsTick(){
        this.playerControls.move()
        this.cameraControls.move(this.playerControls.velocity)
    }

    tick(time:number){
        let ctx = this.engine.ctx
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,window.innerWidth, window.innerHeight)

        ctx.font = "30px Arial";
        ctx.fillStyle = 'white'
        ctx.fillText("camera position:", 10, 50); 
        ctx.fillText(`x: ${(this.engine.vCamera.x).toFixed(3)}`, 10, 80); 
        ctx.fillText(`y: ${(this.engine.vCamera.y).toFixed(3)}`, 10, 110); 
        ctx.fillText(`z: ${(this.engine.vCamera.z).toFixed(3)}`, 10, 145); 
        ctx.fillText(`velocity: ${this?.playerControls?.velocity ? (Math.abs(this?.playerControls.velocity.x)+ Math.abs(this?.playerControls.velocity.z)).toFixed(3): 0}`, 10, 175); 
        ctx.fillText(`acceleration: ${this?.playerControls?.acceleration ? this?.playerControls.acceleration.toFixed(3) : 0}`, 10, 210); 
        ctx.fillText(`tilt: ${this?.playerControls?.tilt ? this?.playerControls.tilt : 0}`, 10, 245); 
        
        this.drawMovementVector(ctx)

        ctx.fillStyle = 'black'
        this.engine.render(time)
    }
    
    audioController(){
        if(true){
            let engineRoarPath = 'audio/engine_roar.mp3'
            let engineRoar = new Audio(engineRoarPath)
            engineRoar.loop = true
            engineRoar.volume = 0
            engineRoar.play()
            
            let engineSoundPath = 'audio/Engine_speeding_up1.mp3'
            let engineSound = new Audio(engineSoundPath)
            engineSound.loop = true
            engineSound.volume = 0
            engineSound.play()
            setInterval(() => {
                // console.log(engineSound.currentTime)
                engineRoar.volume = 0.4 * this.playerControls.acceleration + 0.2
                engineSound.volume = 0.45*this.playerControls.acceleration + 0.05
            }, 100)
        }
    }

    drawMovementVector(ctx:CanvasRenderingContext2D){
        if(!this.playerControls) return
        ctx.fillText(`Movement Vector:`, window.innerWidth-350, 50); 
        ctx.fillText(`x: ${(this.playerControls.currentMovementVector.x).toFixed(3)}`, window.innerWidth-120, 100); 
        ctx.fillText(`y: ${(this.playerControls.currentMovementVector.y).toFixed(3)}`, window.innerWidth-120, 150);
        ctx.fillText(`z: ${(this.playerControls.currentMovementVector.z).toFixed(3)}`, window.innerWidth-120, 200); 
        let vec = {
            x:Number(this.playerControls.currentMovementVector.x.toFixed(3)),
            z:Number(this.playerControls.currentMovementVector.z.toFixed(3))
        }
        let localStart = {
            x:window.innerWidth-310,
            y:75
        }
        ctx.fillRect(localStart.x, localStart.y, 150, 150)
        ctx.beginPath()
        ctx.moveTo(localStart.x+75, localStart.y+75)
        let maxVecValue = 0.266

        //x is up, z is sideways
        let ratioZ = vec.z/maxVecValue
        let ratioX = vec.x/maxVecValue

        let zChange = ratioZ*75
        let xChange = ratioX*75
        ctx.lineTo(localStart.x+75+zChange, localStart.y+75-xChange)
        ctx.stroke()
    }

}