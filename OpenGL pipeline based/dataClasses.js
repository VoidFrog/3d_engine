class Vec3d {
    constructor(x,y,z){
        this.x = x
        this.y = y
        this.z = z
        this.pos = [x, y, z]
    }
}

//takes Vec3d objects
class Triangle {
    constructor(v1, v2, v3){
        this.vec = [v1, v2, v3]
    }

    draw(ctx){
        ctx.beginPath()
        ctx.moveTo(this.vec[2].x, this.vec[2].y)
        for(let i=0; i<this.vec.length; i++){
            ctx.lineTo(this.vec[i].x, this.vec[i].y)
        }
        ctx.stroke()
    }
}

//takes Array<Triangle> 
class Mesh {
    constructor(triangles){
        this.triangles = triangles
    }
}

class Matrix {
    static projectionMatrix = this._getProjectionMatrix()

    constructor(){

    }

    static _getProjectionMatrix(){
        let fNear = 0.1;
        let fFar  = 1000;
        let fFov  = 90; //degrees
        let fAspectRatio = window.innerHeight/window.innerWidth
        let fFovRad = 1 / Math.tan(fFov * 0.5/180 * Math.PI)

        let projectionMatrix = [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]

        projectionMatrix[0][0] = fAspectRatio * fFovRad
        projectionMatrix[1][1] = fFovRad
        projectionMatrix[2][2] = fFar/(fFar - fNear)
        projectionMatrix[3][2] = (-fFar * fNear)/(fFar - fNear)
        projectionMatrix[2][3] = 1
        projectionMatrix[3][3] = 0

        return projectionMatrix
    }

    //multiplies vec3d by projection matrix
    static MultiplyMatrixVector(inputVector, matrix){
        let m = matrix
        let i = inputVector
        let vector = new Vec3d() 

        vector.x = i.x*m[0][0] + i.y*m[1][0] + i.z*m[2][0] + m[3][0]
        vector.y = i.x*m[0][1] + i.y*m[1][1] + i.z*m[2][1] + m[3][1]
        vector.z = i.x*m[0][2] + i.y*m[1][2] + i.z*m[2][2] + m[3][2]
        let    w = i.x*m[0][3] + i.y*m[1][3] + i.z*m[2][3] + m[3][3]

        if(w != 0){
            vector.x = vector.x/w
            vector.y = vector.y/w
            vector.z = vector.z/w
        }

        return vector
    }

    static getRotationMatrices(fTheta){
        let matRotZ = this.createMatrix4x4()
        let matRotX = this.createMatrix4x4()

        //Z rotation-----------------------------------
        matRotZ[0][0] =  Math.cos(fTheta * Math.PI/180)
        matRotZ[0][1] =  Math.sin(fTheta * Math.PI/180)
        matRotZ[1][0] = -Math.sin(fTheta * Math.PI/180)
        matRotZ[1][1] =  Math.cos(fTheta * Math.PI/180)
        matRotZ[2][2] = 1
        matRotZ[3][3] = 1
        //---------------------------------------------
        //X rotation
        matRotX[0][0] =  1
        matRotX[1][1] =  Math.cos(0.5*fTheta * Math.PI/180)
        matRotX[1][2] =  Math.sin(0.5*fTheta * Math.PI/180)
        matRotX[2][1] = -Math.sin(0.5*fTheta * Math.PI/180)
        matRotX[2][2] =  Math.cos(0.5*fTheta * Math.PI/180)
        matRotX[3][3] = 1
        //---------------------------------------------

        return [matRotZ, matRotX]
    }

    static createMatrix4x4(){
        return [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]
    }
} 