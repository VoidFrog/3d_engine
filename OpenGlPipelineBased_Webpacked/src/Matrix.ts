import Vec3d from "./Vec3d";

export default class Matrix {
    static projectionMatrix = this.getProjectionMatrix()

    static getProjectionMatrix(fFovDegrees:number=90, fAspectRatio:number=window.innerHeight/window.innerWidth, fNear:number=0.1, fFar:number=1000):number[][] {
        let fFovRad = 1 / Math.tan(fFovDegrees * 0.5/180 * Math.PI)

        let projectionMatrix = this.createMatrix4x4()
        projectionMatrix[0][0] = fAspectRatio * fFovRad
        projectionMatrix[1][1] = fFovRad
        projectionMatrix[2][2] = fFar/(fFar - fNear)
        projectionMatrix[3][2] = (-fFar * fNear)/(fFar - fNear)
        projectionMatrix[2][3] = 1
        projectionMatrix[3][3] = 0

        return projectionMatrix
    }

    static multiplyMatrixMatrix(m1:number[][], m2:number[][]):number[][]{
        let m = this.createMatrix4x4()

        for(let col=0; col<4; col++){
            for(let row=0; row<4; row++){
                m[row][col] = m1[row][0] * m2[0][col] + m1[row][1] * m2[1][col] + m1[row][2] * m2[2][col] + m1[row][3] * m2[3][col];
            }
        }
        return m
    }

    //multiplies vec3d by projection matrix
    static multiplyMatrixVector(inputVector:Vec3d, matrix:number[][]): Vec3d{
        let m = matrix
        let i = inputVector
        let vector = new Vec3d() 

        vector.x = i.x*m[0][0] + i.y*m[1][0] + i.z*m[2][0] + i.w*m[3][0]
        vector.y = i.x*m[0][1] + i.y*m[1][1] + i.z*m[2][1] + i.w*m[3][1]
        vector.z = i.x*m[0][2] + i.y*m[1][2] + i.z*m[2][2] + i.w*m[3][2]
        vector.w = i.x*m[0][3] + i.y*m[1][3] + i.z*m[2][3] + i.w*m[3][3]

        return vector
    }
                                        //forward
    static matrixPointAt(position:Vec3d, target:Vec3d, up:Vec3d):number[][]{
        //calculate new forward direction
        let newForward = Vec3d.sub_vectors(target, position)
        newForward = Vec3d.vector_normalise(newForward)

        //calculate new up direction 
        let a = Vec3d.mul_vectors(newForward, Vec3d.dot_product(up, newForward))
        let newUp = Vec3d.sub_vectors(up, a)

        //calculate new right direction - its just a cross product 
        let newRight = Vec3d.cross_product(newUp, newForward)

        //making translation matrix for directions
        let m = Matrix.createMatrix4x4()
        m[0][0] = newRight.x
        m[0][1] = newRight.y
        m[0][2] = newRight.z
        m[0][3] = 0
        m[1][0] = newUp.x
        m[1][1] = newUp.y
        m[1][2] = newUp.z
        m[1][3] = 0
        m[2][0] = newForward.x
        m[2][1] = newForward.y
        m[2][2] = newForward.z
        m[2][3] = 0
        m[3][0] = position.x
        m[3][1] = position.y
        m[3][2] = position.z
        m[3][3] = 1
        
        return m
    }

    static matrixQuickInverse(m:number[][]):number[][]{ //only works for rotation and translation matrices
        let inversedMatrix = this.createMatrix4x4()
        
        inversedMatrix[0][0] = m[0][0]
        inversedMatrix[0][1] = m[1][0]
        inversedMatrix[0][2] = m[2][0]
        inversedMatrix[0][3] = 0
		inversedMatrix[1][0] = m[0][1]
        inversedMatrix[1][1] = m[1][1]
        inversedMatrix[1][2] = m[2][1]
        inversedMatrix[1][3] = 0
		inversedMatrix[2][0] = m[0][2]
        inversedMatrix[2][1] = m[1][2]
        inversedMatrix[2][2] = m[2][2]
        inversedMatrix[2][3] = 0
		inversedMatrix[3][0] = -(m[3][0] * inversedMatrix[0][0] + m[3][1] * inversedMatrix[1][0] + m[3][2] * inversedMatrix[2][0]);
		inversedMatrix[3][1] = -(m[3][0] * inversedMatrix[0][1] + m[3][1] * inversedMatrix[1][1] + m[3][2] * inversedMatrix[2][1]);
		inversedMatrix[3][2] = -(m[3][0] * inversedMatrix[0][2] + m[3][1] * inversedMatrix[1][2] + m[3][2] * inversedMatrix[2][2]);
		inversedMatrix[3][3] = 1

        return inversedMatrix
    }

    static getIdentityMatrix(){
        let m = this.createMatrix4x4()
        for(let i=0; i<m.length; i++){
            m[i][i] = 1
        }

        return m
    }
    //get rotation matrices of a given angle
    static getRotationMatriceX(fTheta:number){
        let fThetaRad = fTheta * Math.PI/180
        let matRotX = this.createMatrix4x4()

        //X rotation
        matRotX[0][0] =  1
        matRotX[1][1] =  Math.cos(fThetaRad)
        matRotX[1][2] =  Math.sin(fThetaRad)
        matRotX[2][1] = -Math.sin(fThetaRad)
        matRotX[2][2] =  Math.cos(fThetaRad)
        matRotX[3][3] =  1

        return matRotX
    }

    static getRotationMatriceY(fTheta:number){
        let fThetaRad = fTheta * Math.PI/180
        let matRotY = this.createMatrix4x4()

        //Y rotation-----------------------------------
        matRotY[0][0] =  Math.cos(fThetaRad)
        matRotY[0][2] =  Math.sin(fThetaRad)
        matRotY[2][0] = -Math.sin(fThetaRad)
        matRotY[1][1] =  1
        matRotY[2][2] =  Math.cos(fThetaRad)
        matRotY[3][3] =  1

        return matRotY
    }

    static getRotationMatriceZ(fTheta:number){
        let fThetaRad = fTheta * Math.PI/180
        let matRotZ = this.createMatrix4x4()

        //Z rotation-----------------------------------
        matRotZ[0][0] =  Math.cos(fThetaRad)
        matRotZ[0][1] =  Math.sin(fThetaRad)
        matRotZ[1][0] = -Math.sin(fThetaRad)
        matRotZ[1][1] =  Math.cos(fThetaRad)
        matRotZ[2][2] =  1
        matRotZ[3][3] =  1

        return matRotZ
    }

    static getTranslationMatrix(x:number, y:number, z:number):number[][]{
        let m = this.createMatrix4x4()
        m[0][0] = 1
        m[1][1] = 1
        m[2][2] = 1
        m[3][3] = 1
        m[3][0] = x
        m[3][1] = y
        m[3][2] = z

        return m 
    }

    static createMatrix4x4():number[][]{
        return [
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0],
            [0,0,0,0]
        ]
    }
} 
