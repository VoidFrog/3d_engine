import Engine3d from "./Engine3d";
import Matrix from "./Matrix";
import Mesh from "./Mesh";
import Vec3d from "./Vec3d";

export default class ObjectControls {
    w:boolean;
    s:boolean;
    a:boolean;
    d:boolean;
    
    fYawMesh:number;
    unrotatedModel:Mesh;
    engine:Engine3d;
    distanceFromCenter:Vec3d;
    currentMovementVector:Vec3d;

    tilt:number;
    MAX_TILT:number;

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
    }

    move(){
        let deltaTime = 30
        let tiltFade = 0.2

        let vTarget = new Vec3d(0,0,1)
        let cameraRotationY = Matrix.getRotationMatriceY(this.fYawMesh)
        let vLookDirection = Matrix.multiplyMatrixVector(vTarget, cameraRotationY)
        let vForward = Vec3d.mul_vectors(vLookDirection, 8/deltaTime)

        this.currentMovementVector = vForward
        
        if(this.w){
            this.moveForward(vForward)       //  this.engine.playerMesh = //Vec3d.add_vectors(this.engine.vCamera, vForward)
            this.engine.vCamera = Vec3d.add_vectors(this.engine.vCamera, vForward)
        }
        if(this.s){
            this.moveBackward(vForward)      //  this.engine.playerMesh = //Vec3d.sub_vectors(this.engine.vCamera, vForward)
            this.engine.vCamera = Vec3d.sub_vectors(this.engine.vCamera, vForward)
        }
        if(this.a){
            this.fYawMesh -= 30/deltaTime
            if(this.tilt < this.MAX_TILT) this.tilt += 1 
        }
        if(this.d){
            this.fYawMesh += 30/deltaTime
            if(this.tilt > -this.MAX_TILT) this.tilt -= 1
        }

        this.engine.fYaw = this.fYawMesh + 2*this.tilt  
        if(this.tilt > this.MAX_TILT) this.tilt = this.MAX_TILT
        if(this.tilt < -this.MAX_TILT) this.tilt = -this.MAX_TILT
        if(this.tilt != 0) this.tilt = this.tilt > 0 ? Number((this.tilt-tiltFade).toFixed(2)) : Number((this.tilt+tiltFade).toFixed(2))
        this.setRotation()
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

    moveForward(vForward:Vec3d){
        for(let i=0; i<this.engine.playerMesh.triangles.length; i++){
            for(let j=0; j<3; j++){
                let currentVector = this.engine.playerMesh.triangles[i].points[j]
                this.engine.playerMesh.triangles[i].points[j] = Vec3d.add_vectors(currentVector, vForward)
            }
        }

        this.distanceFromCenter = Vec3d.add_vectors(this.distanceFromCenter, vForward)
    }

    moveBackward(vForward:Vec3d){
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

            if(key == 'w') this.w = true
            if(key == 's') this.s = true
            if(key == 'a') this.a = true
            if(key == 'd') this.d = true
        })
        window.addEventListener('keyup', (e) => {
            let key = e.key
            key = key.toLowerCase()
            
            if(key == 'w') this.w = false
            if(key == 's') this.s = false
            if(key == 'a') this.a = false
            if(key == 'd') this.d = false 
        })
    }
}