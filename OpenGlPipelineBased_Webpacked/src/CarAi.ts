import Matrix from "./Matrix"
import Vec3d from "./Vec3d"
import Mesh from "./Mesh"
import Triangle from "./Triangle"
import { botCar } from "./ModelLoader"
import { pathLeft, pathMiddle, pathRight  } from "./PathsForAi"

export default class CarAi {
    fYawMesh:number;
    mesh:Mesh;

    currentPath:Vec3d[];
    prevPath:Vec3d[];
    nextPath:Vec3d[];
    originalPath:Vec3d[];
    positionVector:Vec3d;

    offsetZ:number;
    offsetX:number;
    startingOffset:Vec3d;
    pathPoint:number;
    
    finalTriangles:Triangle[];
    mapPosition:number[];
    angles:number[];

    randomVelocityModifierLongs:number;
    randomVelocityModifierShorts:number;

    timeOffset:number;
    color:string;

    constructor(){
        this.fYawMesh = 0
        this.mesh = botCar()

        this.offsetX = 0
        this.offsetZ = 0
        this.startingOffset = new Vec3d(0,0,0)
        this.positionVector = new Vec3d(0,0,0)

        this.pathPoint = 0
        this.timeOffset = 0
        
        this.randomizePaths()
        
        this.finalTriangles = botCar().triangles
        this.mapPosition = [0,0]
        this.angles = this.getAngles()

        this.randomVelocityModifierLongs = Math.round(Math.random()*30)-15
        this.randomVelocityModifierShorts = Math.round(Math.random()*20)-10

        // console.log(this.prevPath, this.currentPath, this.nextPath, 'paths')

    }

    randomizePaths(){
        let pathNumber1 = Math.floor(Math.random()*3-0.001)
        let pathNumber2 = Math.floor(Math.random()*3-0.001)
        let paths = [pathLeft, pathMiddle, pathRight]

        this.currentPath = paths[pathNumber1]
        this.originalPath = paths[pathNumber1]
        this.prevPath = paths[pathNumber1]

        this.nextPath = paths[pathNumber2]
    }

    getNewPath(){
        let pathNumber = Math.floor(Math.random()*3-0.001)
        let paths = [pathLeft, pathMiddle, pathRight]

        return paths[pathNumber]
    }

    setRotation(){
        let Yrotation = Matrix.getRotationMatriceY(this.fYawMesh)
        let model = botCar()

        for(let i=0; i<model.triangles.length; i++){
            for(let j=0; j<3; j++){
                //rotated
                let point = Matrix.multiplyMatrixVector(model.triangles[i].points[j], Yrotation)
                //translated
                model.triangles[i].points[j] = point
            }
        }    
        
        return model
    }

    offset(offset:Vec3d, mesh:Mesh){
        for(let i=0; i<mesh.triangles.length; i++){
            for(let j=0; j<3; j++){
                let currentVector = mesh.triangles[i].points[j]
                mesh.triangles[i].points[j] = Vec3d.add_vectors(currentVector, offset)
            }
        }

        return mesh
    }

    move(){
        if(this.timeOffset > 0){
            this.timeOffset -= 0.01
            return
        }
        let rotated = this.setRotation()
        
        // console.log(angleChange, 'angle')
        

        let offset = Vec3d.add_vectors(this.currentPath[0], new Vec3d(this.offsetX, -10, this.offsetZ))
        this.positionVector = offset
        let offsettedModel = this.offset(offset, rotated)

        for(let i in offsettedModel.triangles){
            offsettedModel.triangles[i].color = this.color//'rgb(204,204,0)'
        }

        this.finalTriangles = this.offset(this.startingOffset,offsettedModel).triangles
        this.mapPosition = [offset.x, offset.z]
        this.moveToNextPoint(offset.x, offset.z, this.originalPath[0])
        // this.drawTriangles(fTheta, false, false, triangles)
    }

    getAngles(){
        let angles:number[] = [210, -80, 10, 20, 45, 40, 50, 40, -10, -40, -70, -100, -40, 0, 10, 50, 80, 100, 140, 180, 180, 200, 210]
        return angles 
    }

    changePaths(){
        this.prevPath = this.currentPath
        this.currentPath = this.nextPath
        this.nextPath = this.getNewPath()
    }

    adjustAngle(){
        let currAngle = this.angles[this.pathPoint]
        let nextAngle = this.pathPoint+1 < this.angles.length-1 ? this.angles[this.pathPoint+1] : this.angles[0]
        let angle = Math.abs(currAngle - nextAngle)
        angle = currAngle > nextAngle ? -angle : angle
        this.fYawMesh += angle/200
    }

    moveToNextPoint(posX:number, posZ:number, origin:Vec3d){
        let path = this.currentPath

        let prevPosition = this.pathPoint > 0 ? this.prevPath[this.pathPoint-1] : this.prevPath[this.prevPath.length-1]
        let currentDestination = path[this.pathPoint]

        let dx = Math.abs(prevPosition.x - currentDestination.x)
        let dz = Math.abs(prevPosition.z - currentDestination.z)

        this.adjustAngle()

        let velocity = 1/(100+this.randomVelocityModifierLongs)
        if (dx < 75 && dz < 75) velocity = 1/(50+this.randomVelocityModifierShorts)
        
        if(prevPosition.x < currentDestination.x){
            posX += dx*velocity
            this.offsetX += dx*velocity
        }
        else{
            posX -= dx*velocity
            this.offsetX -= dx*velocity
        } 

        if(prevPosition.z < currentDestination.z){
            posZ += dz*velocity
            this.offsetZ += dz*velocity
        }
        else{
            posZ -= dz*velocity
            this.offsetZ -= dz*velocity
        }
        
        if((Math.round(posX) == currentDestination.x || Math.ceil(posX) == currentDestination.x || Math.floor(posX) == currentDestination.x) && (Math.round(posZ) == currentDestination.z || Math.ceil(posZ) == currentDestination.z || Math.floor(posZ) == currentDestination.z)){
            this.pathPoint += 1
            if(this.pathPoint > path.length-1) this.pathPoint = 1

            //x + cubeX ~= currentDestination.x
            // this.cubeX = 
            // this.cubeZ = 
            this.offsetX = currentDestination.x - origin.x
            this.offsetZ = currentDestination.z - origin.z

            let angleChange
            if(this.pathPoint < this.angles.length-1){
                angleChange = this.angles[this.pathPoint]
                this.fYawMesh = angleChange
            }

            // console.log(posX, this.offsetX, currentDestination.x)
            // console.log(this.pathPoint, path.length-1)

            // this.changePaths()
        }

        // console.log(this.pathPoint, dx, dz, currentDestination.x, currentDestination.z, Math.round(posX), Math.round(posZ), posX)
        // console.log(dx, dz, dx*velocity, dz*velocity, currentDestination.x, currentDestination.z, Math.round(posX), Math.round(posZ))
    }
}