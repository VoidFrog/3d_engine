import Engine3d from "./Engine3d";
import Matrix from "./Matrix";
import Mesh from "./Mesh";
import Vec3d from "./Vec3d";

export default class ObjectControls {
    w:boolean;
    s:boolean;
    a:boolean;
    d:boolean;
    gear:string; //change gear LOW||HIGH 
    breaksOn:boolean; //breaks 
    
    fYawMesh:number;
    unrotatedModel:Mesh;
    engine:Engine3d;
    distanceFromCenter:Vec3d;
    currentMovementVector:Vec3d;

    tilt:number;
    MAX_TILT:number;

    velocity:Vec3d;
    
    acceleration:number;
    MAX_ACCELERATION:number;
    MAX_VELOCITY:number;
    lastDirection:string;
    accelerationDirection:string;
    gearAccelerationChange:number;

    constructor(engine:Engine3d){
        this.w = false
        this.s = false
        this.a = false
        this.d = false

        this.tilt = 0
        this.MAX_TILT = 10
        this.distanceFromCenter = new Vec3d(0,0,0)

        this.fYawMesh = 0
        this.engine = engine
        this.unrotatedModel = JSON.parse(JSON.stringify(this.engine.playerMesh))

        this.velocity = new Vec3d(0,0,0)
        this.acceleration = 0
        this.accelerationDirection = ''
        this.MAX_ACCELERATION = 2
        this.MAX_VELOCITY = 0.5
        this.gearAccelerationChange = 1

        this.gear = 'LOW'
        this.breaksOn = false
        
        this.lastDirection = '';
        this.offsetStartingPosition()
    }

    offsetStartingPosition(){
        let vForward = new Vec3d(150, 0, -175)
        for(let i=0; i<this.engine.playerMesh.triangles.length; i++){
            for(let j=0; j<3; j++){
                let currentVector = this.engine.playerMesh.triangles[i].points[j]
                this.engine.playerMesh.triangles[i].points[j] = Vec3d.add_vectors(currentVector, vForward)
            }
        }

        this.distanceFromCenter = Vec3d.add_vectors(this.distanceFromCenter, vForward)
        this.engine.vCamera = Vec3d.add_vectors(this.engine.vCamera, vForward)

        this.engine.fYaw = -10
        this.fYawMesh = -10
        this.setRotation()
    }

    move(){
        // these two lines force you to move forward at all times
        // so you cannot move backwards
        // this.s = false
        // this.w = true


        let deltaTime = 30
        let tiltFade = 0.2
        let deceleration = 0.01

        let vTarget = new Vec3d(0,0,1)
        let cameraRotationY = Matrix.getRotationMatriceY(this.fYawMesh)
        let vLookDirection = Matrix.multiplyMatrixVector(vTarget, cameraRotationY)
        let vForward = Vec3d.mul_vectors(vLookDirection, 8/deltaTime)
        this.currentMovementVector = vForward
        this.velocity = Vec3d.mul_vectors(vForward, this.acceleration)
        
        // console.log(this.gear)

        if(this.gear == 'LOW') this.MAX_VELOCITY = 0.3
        else if(this.gear == 'HIGH')  this.MAX_VELOCITY = 0.5
        if(this.gear == 'HIGH' && Vec3d.vector_length(this.velocity) > 0.30){
            this.gearAccelerationChange += 0.02
            this.gearAccelerationChange = this.gearAccelerationChange > 1.25 ? 1.25 : this.gearAccelerationChange
        }
        else if (this.gear == 'HIGH' && Vec3d.vector_length(this.velocity) <= 0.30){
            this.gearAccelerationChange -= 0.02
            this.gearAccelerationChange = this.gearAccelerationChange < 0.5 ? 0.5 : this.gearAccelerationChange
            deceleration = 0.017
        }
        else if (this.gear == 'LOW' && Vec3d.vector_length(this.velocity) < 0.3){
            this.gearAccelerationChange += 0.02
            this.gearAccelerationChange = this.gearAccelerationChange > 1.25 ? 1.25 : this.gearAccelerationChange
        }
        else if (this.gear == 'LOW' && Vec3d.vector_length(this.velocity) >= 0.3){
            this.gearAccelerationChange -= -0.2
            this.gearAccelerationChange = this.gearAccelerationChange < 0.75 ? 0.75 : this.gearAccelerationChange
            deceleration = 0.10
        }

        this.velocity = Vec3d.mul_vectors(this.velocity, this.gearAccelerationChange)
        this.applyBreaks()

        if (Vec3d.vector_length(this.velocity) > this.MAX_VELOCITY) {
            // let div = this.MAX_VELOCITY/Vec3d.vector_length(this.velocity)
            this.velocity = Vec3d.mul_vectors(this.velocity, 0.999)
        }
        if(this.w){
            this.acceleration += 0.02
            this.moveForward()       //  this.engine.playerMesh = //Vec3d.add_vectors(this.engine.vCamera, vForward)
            this.engine.vCamera = Vec3d.add_vectors(this.engine.vCamera, this.velocity)
            this.lastDirection =  'w'
        }
        if(this.s){
            this.acceleration += 0.02
            this.moveBackward()      //  this.engine.playerMesh = //Vec3d.sub_vectors(this.engine.vCamera, vForward)
            this.engine.vCamera = Vec3d.sub_vectors(this.engine.vCamera, this.velocity)
            this.lastDirection =  's'
        }
        if(this.a){
            this.fYawMesh -= 30/deltaTime
            if(this.tilt < this.MAX_TILT) this.tilt += 1 
        }
        if(this.d){
            this.fYawMesh += 30/deltaTime
            if(this.tilt > -this.MAX_TILT) this.tilt -= 1
        }

        if(this.lastDirection == 'w'){
            this.moveForward()
            this.engine.vCamera = Vec3d.add_vectors(this.engine.vCamera, this.velocity)
        }
        else if(this.lastDirection == 's'){
            this.moveBackward()
            this.engine.vCamera = Vec3d.sub_vectors(this.engine.vCamera, this.velocity)
        }

        if(this.acceleration > this.MAX_ACCELERATION) this.acceleration = this.MAX_ACCELERATION
        if(this.acceleration < 0) this.acceleration = 0
        if(this.acceleration != 0) this.acceleration -= deceleration
        
        this.engine.fYaw = this.fYawMesh + 2*this.tilt  
        if(this.tilt > this.MAX_TILT) this.tilt = this.MAX_TILT
        if(this.tilt < -this.MAX_TILT) this.tilt = -this.MAX_TILT
        if(this.tilt != 0) this.tilt = this.tilt > 0 ? Number((this.tilt-tiltFade).toFixed(2)) : Number((this.tilt+tiltFade).toFixed(2))
        this.setRotation()
    }

    applyBreaks(){
        if(this.breaksOn){
            this.acceleration *= 0.95
            this.velocity = Vec3d.mul_vectors(this.velocity, 0.7)
        }
    }

    setRotation(){
        let Yrotation = Matrix.getRotationMatriceY(this.fYawMesh)
        let model = this.engine.playerMesh

        for(let i=0; i<model.triangles.length; i++){
            for(let j=0; j<3; j++){
                //rotated
                let point = Matrix.multiplyMatrixVector(this.unrotatedModel.triangles[i].points[j], Yrotation)
                //translated
                point = Vec3d.add_vectors(point, this.distanceFromCenter)
                model.triangles[i].points[j] = point
            }
        }    
        
        this.engine.playerMesh = model
    }

    moveForward(){
        let vForward = this.velocity
        for(let i=0; i<this.engine.playerMesh.triangles.length; i++){
            for(let j=0; j<3; j++){
                let currentVector = this.engine.playerMesh.triangles[i].points[j]
                this.engine.playerMesh.triangles[i].points[j] = Vec3d.add_vectors(currentVector, vForward)
            }
        }

        this.distanceFromCenter = Vec3d.add_vectors(this.distanceFromCenter, vForward)
    }

    moveBackward(){
        let vForward = this.velocity
        for(let i=0; i<this.engine.playerMesh.triangles.length; i++){
            for(let j=0; j<3; j++){
                let currentVector = this.engine.playerMesh.triangles[i].points[j]
                this.engine.playerMesh.triangles[i].points[j] = Vec3d.sub_vectors(currentVector, vForward)
            }
        }

        this.distanceFromCenter = Vec3d.sub_vectors(this.distanceFromCenter, vForward)
    }

    enable(){
        window.addEventListener('keydown', (e) => {
            let key = e.key
            key = key.toLowerCase()

            // console.log(key, this.gear);
            

            if(key == 'w') this.w = true
            if(key == 's') this.s = true
            if(key == 'a') this.a = true
            if(key == 'd') this.d = true
            if(key == " ") this.breaksOn = true 

            if(key == 'shift' && this.gear == 'LOW') this.gear = 'HIGH'
            else if(key == 'shift' && this.gear == 'HIGH') this.gear = 'LOW' 
        })
        window.addEventListener('keyup', (e) => {
            let key = e.key
            key = key.toLowerCase()

            if(key == 'w') this.w = false
            if(key == 's') this.s = false
            if(key == 'a') this.a = false
            if(key == 'd') this.d = false 
            if(key == " ") this.breaksOn = false
        })
    }
}