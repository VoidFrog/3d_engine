import Engine3d from "./Engine3d";
import CameraControls from "./CameraControls";
import ObjectControls from "./ObjectControls";
import Vec3d from "./Vec3d";
import { pathLeft, pathMiddle, pathRight } from "./PathsForAi";
import CarAi from "./CarAi";
import Mesh from "./Mesh";

export default class Game {
    engine:Engine3d;
    cameraControls:CameraControls;
    playerControls:ObjectControls;
    botCars:CarAi[];
    demoMode:boolean;

    time:number;
    startingTime:number;
    score:number;

    constructor(engine:Engine3d){
        this.engine = engine
        this.demoMode = false
        
        this.score = 0
        this.time = 0 
        this.startingTime = Date.now()

        this.generateAiCars()
        this.audioController()
    }

    makeCameraControl(){
        let controls = new CameraControls(this.engine, )
        this.cameraControls = controls
    }

    enableCameraControl(movement=false){
        this.cameraControls.enable(movement)
    }

    createPlayerControls(){
        this.playerControls = new ObjectControls(this.engine)
        if(!this.demoMode)this.playerControls.enable()
    }

    controlsTick(){
        this.playerControls.move()
        this.cameraControls.move(this.playerControls.velocity)
    }

    tick(time:number){
        this.time = (time-this.startingTime)/1000

        let ctx = this.engine.ctx
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,window.innerWidth, window.innerHeight)
        this.setBackgroundImage('./models/background.png')

        // console.log(this.engine.meshes, 'meshes')
        this.engine.render(time)

        if(this.engine.meshes.length > 1){
            this.engine.meshes = [this.engine.meshes[0]]
        }
        for(let i in this.botCars){
            this.botCars[i].move()
            // this.engine.drawTriangles(time, false, false, this.botCars[i].finalTriangles)
            this.engine.addMesh(new Mesh(this.botCars[i].finalTriangles))
        }

        if(!this.demoMode) this.drawOutAdditionalData(ctx)
        if(!this.demoMode) this.drawOutBasicInfo(ctx)
    }

    drawOutBasicInfo(ctx:CanvasRenderingContext2D){
        ctx.font = "30px Arial"
        ctx.fillStyle = 'white'
        this.score = Math.floor(parseInt(String(this?.time)))*50

        ctx.fillText(`SPEED ${this?.playerControls?.velocity ? (Vec3d.vector_length(this?.playerControls?.velocity) * 300).toFixed(0): 0}`,  window.innerWidth/1.5-200, 175)
        ctx.fillText(`${this?.playerControls?.gear ? this?.playerControls.gear[0] + this?.playerControls.gear[1] : '???'}`, window.innerWidth/1.5, 175)
        ctx.fillText(`TIME`, window.innerWidth/2, 100)
        ctx.fillText(`${this?.time.toFixed(0)}`, window.innerWidth/2+10, 150)
        ctx.fillText(`SCORE`, window.innerWidth/2.5-150, 175)
        ctx.fillText(`${this.score}`, window.innerWidth/2.5, 175)
    }

    drawOutAdditionalData(ctx:CanvasRenderingContext2D){
        ctx.font = "30px Arial"
        ctx.fillStyle = 'white'
        ctx.fillText("camera position:", 10, 50)
        ctx.fillText(`x: ${(this.engine.vCamera.x).toFixed(3)}`, 10, 80)
        ctx.fillText(`y: ${(this.engine.vCamera.y).toFixed(3)}`, 10, 110)
        ctx.fillText(`z: ${(this.engine.vCamera.z).toFixed(3)}`, 10, 145)
        ctx.fillText(`velocity: ${this?.playerControls?.velocity ? Vec3d.vector_length(this?.playerControls?.velocity).toFixed(3): 0}`, 10, 175)
        ctx.fillText(`acceleration: ${this?.playerControls?.acceleration ? this?.playerControls.acceleration.toFixed(3) : 0}`, 10, 210)
        ctx.fillText(`tilt: ${this?.playerControls?.tilt ? this?.playerControls.tilt : 0}`, 10, 245)
        ctx.fillText(`gear: ${this?.playerControls?.gear ? this?.playerControls.gear : '???'}`, 10, 275)
        this.drawMovementVector(ctx)
        this.drawMap(ctx)
    }
    
    audioController(){
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

        let turningNoisePath = 'audio/turn.mp3'
        let turningNoise = new Audio(turningNoisePath)
        turningNoise.loop = true
        turningNoise.volume = 0
        turningNoise.play()


        setInterval(() => {
            // console.log(engineSound.currentTime)
            engineRoar.volume = 0.4 * this.playerControls.acceleration + 0.2
            engineSound.volume = 0.45*this.playerControls.acceleration + 0.05
            turningNoise.volume = Math.abs(this.playerControls.tilt)*0.025 * this.playerControls.acceleration
        }, 100)
    }

    setBackgroundImage(path:string){
        let ctx = this.engine.ctx
        let img = document.createElement('img')
        img.src = path
        
        let rotation = this.engine.fYaw%360
        let rotWidth = window.innerWidth/360 * rotation

        ctx.drawImage(img, -1-rotWidth, 0, window.innerWidth, window.innerHeight/1.9)
        ctx.drawImage(img, -window.innerWidth-1-rotWidth, 0, window.innerWidth, window.innerHeight/1.9)
        ctx.drawImage(img, window.innerWidth-rotWidth-1, 0, window.innerWidth, window.innerHeight/1.9)

        ctx.fillStyle = 'rgb(30,222,60)'
        ctx.fillRect(0, window.innerHeight/1.9, window.innerWidth, window.innerHeight/2)
        ctx.fillStyle = 'black'
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

    drawMap(ctx:CanvasRenderingContext2D){
        ctx.font = "30px Arial";
        ctx.fillStyle = 'white'

        let localStart = {
            x:window.innerWidth-400,
            y:250
        }

        let width = 350
        let height = 350
        let ratio = width/400
        const normalise = (vec:Vec3d) => {
            let z = vec.z
            let x = vec.x

            z += 200    //adding 200 to x and z to make both of their ranges -200~200 --> 0~400
            x += 200    //0 - 400
            z *= ratio
            x *= ratio

            return [z,x]
        }  


        ctx.fillRect(localStart.x, localStart.y, width, height)
        this.drawPath(ctx, localStart, normalise, pathLeft)
        this.drawPath(ctx, localStart, normalise, pathMiddle)
        this.drawPath(ctx, localStart, normalise, pathRight)

        //drawing bots---------------------------------------------
        for(let i in this.botCars){
            let carPosition = this.botCars[i].mapPosition
            let x = (carPosition[0]+200)*ratio
            let z = (carPosition[1]+200)*ratio
    
            ctx.fillStyle = 'red'
            ctx.fillRect(localStart.x+z, localStart.y+x, 10, 10)
        }
        //---------------------------------------------------------

        //drawing player--------------------------------------------------
        ctx.fillStyle = 'orange'
        let playerX = (this.engine.vCamera.x+200)*ratio
        let playerZ = (this.engine.vCamera.z+200)*ratio
        ctx.fillRect(localStart.x+playerZ, localStart.y+playerX, 10, 10)
        //----------------------------------------------------------------
        
        ctx.fillStyle = 'black'
    }

    drawPath(ctx:CanvasRenderingContext2D, localStart:any, normalise:Function, currentPath:Vec3d[]){
        let [startZ,startX] = normalise(currentPath[currentPath.length-1])
        ctx.moveTo(localStart.x+startZ, localStart.y+startX)  
        ctx.beginPath()
        for(let i in currentPath){
            let [z,x] = normalise(currentPath[i])
            ctx.font = "20px Arial";
            ctx.fillStyle = 'black'

            if(Number(i) > currentPath.length-2){
                ctx.lineTo(localStart.x+z, localStart.y+x)
                break
            }
            ctx.fillText(`${i}`, localStart.x+z, localStart.y+x)
            ctx.fillRect(localStart.x+z, localStart.y+x, 5, 5)
            ctx.lineTo(localStart.x+z, localStart.y+x)

        }
        ctx.stroke()
    }

    generateAiCars(){
        this.botCars = []

        for(let i=0; i<7; i++){
            let car = new CarAi()
            car.fYawMesh = -100
            car.color = this.genColor()
            car.move()
            car.timeOffset = i/4
            this.botCars.push(car)
        }
    }

    genColor(){
        const randomBetween = (min:number=0, max:number=255) => min + Math.floor(Math.random() * (max - min + 1))
        const r = randomBetween()
        const g = randomBetween()
        const b = randomBetween()
        const rgb = `rgb(${r},${g},${b})`

        return rgb
    }
}