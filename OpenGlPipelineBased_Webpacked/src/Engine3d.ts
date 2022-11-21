import Mesh from "./Mesh";
import Triangle from "./Triangle";
import Vec3d from "./Vec3d";
import Matrix from "./Matrix";

export default class Engine3d {
    ctx:CanvasRenderingContext2D;
    time:number;
    timeStart:number;

    cube:Mesh;
    vCamera:Vec3d;
    vLookDirection:Vec3d;
    
    fYaw:number; //rotation around Y axis of camera looking direction

    meshes:Mesh[];

    constructor(ctx:CanvasRenderingContext2D){
        this.meshes = []
        this.ctx = ctx
        this.time = 0
        this.timeStart = 0
        this.fYaw = 0

        // this.cube = this.makeCubeMesh()
        this.vCamera = new Vec3d(0,0,0)
        this.vLookDirection = new Vec3d(0,0,1)

    }

    makeCubeMesh():Mesh {
        //Array<Triangles>
        //-- Array<Vec3d>
        //-- -- Vec3d.pos --> [x,y,z]
        let vertices:number[][] = [
            [0,0,0,   0,1,0,   1,1,0],//south
            [0,0,0,   1,1,0,   1,0,0],//
            [1,0,0,   1,1,0,   1,1,1],//east
            [1,0,0,   1,1,1,   1,0,1],//
            [1,0,1,   1,1,1,   0,1,1],//north
            [1,0,1,   0,1,1,   0,0,1],//
            [0,0,1,   0,1,1,   0,1,0],//west
            [0,0,1,   0,1,0,   0,0,0],//
            [0,1,0,   0,1,1,   1,1,1],//top
            [0,1,0,   1,1,1,   1,1,0],//
            [1,0,1,   0,0,1,   0,0,0],//bottom
            [1,0,1,   0,0,0,   1,0,0] //
        ]

        let triangles:Triangle[] = []
        for(let i=0; i<vertices.length; i++){
            let vectors3d:Vec3d[] = []
            for(let j=0; j<vertices[i].length; j+=3){
                let vector = new Vec3d(vertices[i][j], vertices[i][j+1], vertices[i][j+2])
                vectors3d.push(vector)
            }

            let triangle = new Triangle(vectors3d[0], vectors3d[1], vectors3d[2])
            triangles.push(triangle)
        }
        
        let cube =  new Mesh(triangles)
        // console.log(cube)
        return cube
    }

    allTriangles():Triangle[]{
        let allTriangles:Triangle[] = []
        for(let mesh of this.meshes){
            for(let triangle of mesh.triangles){
                allTriangles.push(triangle)
            }
        }
        return allTriangles
    }

    drawTriangles(fTheta:number){
        const ctx:CanvasRenderingContext2D = this.ctx 

        //setting up rotation and translation matrices------------------------------------
        let rotationMatriceX = Matrix.getRotationMatriceX(fTheta-fTheta)
        // let rotationMatriceY = Matrix.getRotationMatriceY(fTheta)
        let rotationMatriceZ = Matrix.getRotationMatriceZ(fTheta/2 - fTheta/2)

        let translationMatrix = Matrix.getTranslationMatrix(0,0,16)
        let worldMatrix = Matrix.getIdentityMatrix()
        worldMatrix = Matrix.multiplyMatrixMatrix(rotationMatriceZ, rotationMatriceX) //rotation
        worldMatrix = Matrix.multiplyMatrixMatrix(worldMatrix, translationMatrix)     //translation

        let vUp = new Vec3d(0,1,0)
        let vTarget = new Vec3d(0,0,1)
        let cameraRotationY = Matrix.getRotationMatriceY(this.fYaw)
        this.vLookDirection = Matrix.multiplyMatrixVector(vTarget, cameraRotationY)
        vTarget = Vec3d.add_vectors(this.vCamera, this.vLookDirection)

        let cameraMatrix = Matrix.matrixPointAt(this.vCamera, vTarget, vUp)
        let viewMatrix = Matrix.matrixQuickInverse(cameraMatrix) //this is our axis translation 
        //--------------------------------------------------------------------------------
        let trianglesToDraw:Triangle[] = this.allTriangles()
        let trianglesToRaster:Triangle[] = []

        for(let i=0; i<trianglesToDraw.length; i++){
            let triangleTransformed = new Triangle()
            let triangleProjected = new Triangle()
            let triangleViewed = new Triangle()

            let triangleOriginal:Triangle = JSON.parse(JSON.stringify(trianglesToDraw[i]))  //because for some motherfucking reason thing before is fucking shallow copy, and references values in original arr
            triangleTransformed.points[0] = Matrix.multiplyMatrixVector(triangleOriginal.points[0], worldMatrix)
            triangleTransformed.points[1] = Matrix.multiplyMatrixVector(triangleOriginal.points[1], worldMatrix)
            triangleTransformed.points[2] = Matrix.multiplyMatrixVector(triangleOriginal.points[2], worldMatrix)
            let triTranslated = triangleTransformed.points

            //getting normal----------------------------------------------
            let normal:Vec3d;
            let line1: Vec3d;
            let line2: Vec3d;
            line1 = Vec3d.sub_vectors(triTranslated[1], triTranslated[0])
            line2 = Vec3d.sub_vectors(triTranslated[2], triTranslated[0])
            
            normal = Vec3d.cross_product(line1, line2)
            normal = Vec3d.vector_normalise(normal)

            let vCameraRay = Vec3d.sub_vectors(triTranslated[0], this.vCamera)
            //draw only visible faces (dot product between normal and triTranslated-camera)
            if (Vec3d.dot_product(normal, vCameraRay) < 0){
                //illumination------------------------- wont be needed after, for the game coding, but ill add it cuz i can 
                //light direction normal
                let lightDirection = new Vec3d(0,1,-1)
                lightDirection = Vec3d.vector_normalise(lightDirection)

                //how 'aligned' is light direction to triangle surface normal
                let dotProduct = Math.max(0.1, Vec3d.dot_product(lightDirection, normal))
                //---------------------------------------------------------------------------------------------------------
                //convert World space into view space
                triangleViewed.points[0] = Matrix.multiplyMatrixVector(triTranslated[0], viewMatrix) 
                triangleViewed.points[1] = Matrix.multiplyMatrixVector(triTranslated[1], viewMatrix)
                triangleViewed.points[2] = Matrix.multiplyMatrixVector(triTranslated[2], viewMatrix)

                //may end up with more than one triangle so i'll need to loop through them at the projection time
                let {nClippedTriangles, clipped} = Vec3d.triangleClipAgainstPlane(new Vec3d(0,0,0.01), new Vec3d(0,0,1), triangleViewed)
                
                // console.log(nClippedTriangles);
                
                //project triangles from 3D ---> 2D
                for(let i=0; i<nClippedTriangles; i++){
                    triangleProjected = clipped[i]
                    triangleProjected.points[0] = Matrix.multiplyMatrixVector(clipped[i].points[0], Matrix.projectionMatrix)
                    triangleProjected.points[1] = Matrix.multiplyMatrixVector(clipped[i].points[1], Matrix.projectionMatrix)
                    triangleProjected.points[2] = Matrix.multiplyMatrixVector(clipped[i].points[2], Matrix.projectionMatrix)
    
                    triangleProjected.points[0] = Vec3d.div_vectors(triangleProjected.points[0], triangleProjected.points[0].w)
                    triangleProjected.points[1] = Vec3d.div_vectors(triangleProjected.points[1], triangleProjected.points[1].w)
                    triangleProjected.points[2] = Vec3d.div_vectors(triangleProjected.points[2], triangleProjected.points[2].w)

                    //x and y are inverted so we need to invert them again
                    for(let j=0; j<3; j++){
                        triangleProjected.points[j].x *= -1
                        triangleProjected.points[j].y *= -1
                    }
                    
                    //scale into view ---> offset vertices into visible normalised space
                    let offsetVector = new Vec3d(1,1,0)
                    triangleProjected.points[0] = Vec3d.add_vectors(triangleProjected.points[0], offsetVector)
                    triangleProjected.points[1] = Vec3d.add_vectors(triangleProjected.points[1], offsetVector)
                    triangleProjected.points[2] = Vec3d.add_vectors(triangleProjected.points[2], offsetVector)
                    
                    triangleProjected.points[0].x *= 0.5*window.innerWidth
                    triangleProjected.points[1].x *= 0.5*window.innerWidth
                    triangleProjected.points[2].x *= 0.5*window.innerWidth
                    triangleProjected.points[0].y *= 0.5*window.innerHeight
                    triangleProjected.points[1].y *= 0.5*window.innerHeight
                    triangleProjected.points[2].y *= 0.5*window.innerHeight
                    //------------------------------------------------------------------
                    triangleProjected.dp = dotProduct
                    // if(triangleProjected.color != '') console.log(triangleProjected.color)
                    trianglesToRaster.push(triangleProjected)
                }
            }
        }

        trianglesToRaster.sort((t1, t2) => {
            let t1Depth = (t1.points[0].z + t1.points[1].z + t1.points[2].z)/3
            let t2Depth = (t2.points[0].z + t2.points[1].z + t2.points[2].z)/3

            return t2Depth - t1Depth 
        })
        // console.log(trianglesToRaster)

        for(let i=0; i<trianglesToRaster.length; i++){

            // trianglesToRaster[i].fill(ctx) //change to .draw(ctx) to see outlines only
            // trianglesToRaster[i].draw(ctx) //used to see the outlines of triangles clearly
            
            let triangleList:Triangle[] = []
            let clippedTrianglesArray:Triangle[] = []

            triangleList.push(trianglesToRaster[i])
            let nNewTriangles = 1

            for(let p=0; p<4; p++){
                let nTrianglesToAdd = 0
                 
                while(nNewTriangles > 0){
                    let test:Triangle = triangleList.shift()
                    // console.log(test.color, 'dupa')
                    nNewTriangles -= 1

                    let clipped:Triangle[];
                    let nClippedTriangles:number;
                    let destructured;
                    switch(p){
                        case 0:
                            destructured = {nClippedTriangles, clipped} = Vec3d.triangleClipAgainstPlane(new Vec3d(0,0,0), new Vec3d(0,1,0), test)
                            nTrianglesToAdd = nClippedTriangles
                            clippedTrianglesArray = clipped
                            break
                        case 1:
                            destructured = {nClippedTriangles, clipped} = Vec3d.triangleClipAgainstPlane(new Vec3d(0,window.innerHeight-1,0), new Vec3d(0,-1,0), test)
                            nTrianglesToAdd = nClippedTriangles
                            clippedTrianglesArray = clipped
                            break
                        case 2:
                            destructured = {nClippedTriangles, clipped} = Vec3d.triangleClipAgainstPlane(new Vec3d(0,0,0), new Vec3d(1,0,0), test)
                            nTrianglesToAdd = nClippedTriangles
                            clippedTrianglesArray = clipped
                            break
                        case 3:
                            destructured = {nClippedTriangles, clipped} = Vec3d.triangleClipAgainstPlane(new Vec3d(window.innerWidth-1,0,0), new Vec3d(-1,0,0), test)
                            nTrianglesToAdd = nClippedTriangles
                            clippedTrianglesArray = clipped
                            break
                    }

                    // console.log(clipped);
                    

                    for(let w=0; w<nTrianglesToAdd; w++){
                        triangleList.push(clippedTrianglesArray[w])
                    }
                }
                nNewTriangles = triangleList.length
            }
            
            // console.log(triangleList.length)
            for(let n=0; n<triangleList.length; n++){
                // triangleList[n].color = 'rgb(0,0,255)'
                triangleList[n].fill(ctx) //change to .draw(ctx) to see outlines only
                triangleList[n].draw(ctx) //used to see the outlines of triangles clearly
            }
        }

    }

    addMesh(mesh:Mesh){
        this.meshes.push(mesh)
    }

    render(time:number){
        let ctx = this.ctx
        ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
        ctx.fillStyle = 'black'
        ctx.fillRect(0,0,window.innerWidth, window.innerHeight)
        
        // ctx.globalAlpha = 1
        // ctx.fillStyle = 'white'

        let fTheta = 0
        
        if(this.time == 0) {
            this.timeStart = time
            this.time = time
        }
        else fTheta = (((time - this.timeStart))/30)
        this.time = time
        // console.log(fTheta, 'dupa')

        // this.drawTriangles(ctx, fTheta, this.cube)

        this.drawTriangles(fTheta)
        // console.log(this.cube.triangles)
        // console.log('here')
    }
}