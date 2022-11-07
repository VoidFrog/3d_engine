class Engine3d {
    constructor(ctx){
        this.ctx = ctx
        this.time = 0;
        this.timeStart = 0

        this.cube = this.makeCubeMesh()
        this.vCamera = new Vec3d(0,0,0)
    }

    makeCubeMesh(){
        //Array<Triangles>
        //-- Array<Vec3d>
        //-- -- Vec3d.pos --> [x,y,z]
        let vertices = [
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

        let triangles = []
        for(let i=0; i<vertices.length; i++){
            let triangle;
            let vectors3d = []
            for(let j=0; j<vertices[i].length; j+=3){
                let vector = new Vec3d(vertices[i][j], vertices[i][j+1], vertices[i][j+2])
                vectors3d.push(vector)
            }

            triangle = new Triangle(vectors3d[0], vectors3d[1], vectors3d[2])
            triangles.push(triangle)
        }
        
        let cube =  new Mesh(triangles)
        // console.log(cube)
        return cube
    }

    drawTriangles(ctx, fTheta, object){
        let mesh = object

        let rotMatrices = Matrix.getRotationMatrices(fTheta)
        let rotMatZ = rotMatrices[0]
        let rotMatX = rotMatrices[1]
        console.log(rotMatZ, rotMatX)

        for(let i=0; i<mesh.triangles.length; i++){
            let triangleProjected = new Triangle()
            let triangleRotatedZ  = new Triangle()
            let triangleRotatedZX = new Triangle()

            let triangleTranslated = JSON.parse(JSON.stringify(mesh.triangles[i]))  //because for some motherfucking reason thing before is fucking shallow copy, and references values in original arr
            //rotate in Z axis
            triangleRotatedZ.vec[0] = Matrix.MultiplyMatrixVector(triangleTranslated.vec[0], rotMatZ)
            triangleRotatedZ.vec[1] = Matrix.MultiplyMatrixVector(triangleTranslated.vec[1], rotMatZ)
            triangleRotatedZ.vec[2] = Matrix.MultiplyMatrixVector(triangleTranslated.vec[2], rotMatZ)
            //rotate in X axis
            triangleRotatedZX.vec[0] = Matrix.MultiplyMatrixVector(triangleRotatedZ.vec[0], rotMatX)
            triangleRotatedZX.vec[1] = Matrix.MultiplyMatrixVector(triangleRotatedZ.vec[1], rotMatX)
            triangleRotatedZX.vec[2] = Matrix.MultiplyMatrixVector(triangleRotatedZ.vec[2], rotMatX)            



            let triTranslated = triangleRotatedZX.vec
            //offset into the screen
            triTranslated[0].z = triTranslated[0].z + 3
            triTranslated[1].z = triTranslated[1].z + 3 
            triTranslated[2].z = triTranslated[2].z + 3

            //getting crossproduct, to get a normal----------------------------------------------
            let normal = new Vec3d()
            let line1 = new Vec3d()
            let line2 = new Vec3d()
            line1.x = triTranslated[1].x - triTranslated[0].x
            line1.y = triTranslated[1].y - triTranslated[0].y
            line1.z = triTranslated[1].z - triTranslated[0].z

            line2.x = triTranslated[2].x - triTranslated[0].x
            line2.y = triTranslated[2].y - triTranslated[0].y
            line2.z = triTranslated[2].z - triTranslated[0].z
            
            //crossproduct
            normal.x = line1.y*line2.z - line1.z*line2.y
            normal.y = line1.z*line2.x - line1.x*line2.z
            normal.z = line1.x*line2.y - line1.y*line2.x

            let len = Math.sqrt(normal.x*normal.x + normal.y*normal.y + normal.z*normal.z)
            normal.x /= len
            normal.y /= len
            normal.z /= len
            //----------------------------------------------------------------------------------

            //draw only visible faces (dot product between normal and triTranslated-camera)
            // if(normal.z < 0)
            if(normal.x * (triTranslated[0].x - this.vCamera.x) +
               normal.y * (triTranslated[0].y - this.vCamera.y) +
               normal.z * (triTranslated[0].z - this.vCamera.z) < 0)
               {
                //illumination------------------------- wont be needed after, for the game coding, but ill add it cuz i can 
                //light direction normal
                let lightDirection = new Vec3d(0,0,-1)
                let l = Math.sqrt(lightDirection.x*lightDirection.x + lightDirection.y*lightDirection.y + lightDirection.z*lightDirection.z)
                lightDirection.x /= l
                lightDirection.y /= l
                lightDirection.z /= l

                let dotProduct = normal.x*lightDirection.x + normal.y*lightDirection.y + normal.z*lightDirection.z
                // console.log(dotProduct, 'dotproduct color')
                //---------------------------------------------------------------------------------------------------------

                // console.log(triTranslated, 'tritranslated', )
                //project triangles from 3D ---> 2D
                let v1 = Matrix.MultiplyMatrixVector(triTranslated[0], Matrix.projectionMatrix)
                let v2 = Matrix.MultiplyMatrixVector(triTranslated[1], Matrix.projectionMatrix)
                let v3 = Matrix.MultiplyMatrixVector(triTranslated[2], Matrix.projectionMatrix)
                // console.log(v1, v2, v3, 'chuj');
                triangleProjected.vec = [v1, v2, v3]
    
                //scale into view--------------------------------------
                triangleProjected.vec[0].x += 1
                triangleProjected.vec[1].x += 1
                triangleProjected.vec[2].x += 1
                triangleProjected.vec[0].y += 1
                triangleProjected.vec[1].y += 1
                triangleProjected.vec[2].y += 1
                
                triangleProjected.vec[0].x *= 0.5*window.innerWidth
                triangleProjected.vec[1].x *= 0.5*window.innerWidth
                triangleProjected.vec[2].x *= 0.5*window.innerWidth
                triangleProjected.vec[0].y *= 0.5*window.innerHeight
                triangleProjected.vec[1].y *= 0.5*window.innerHeight
                triangleProjected.vec[2].y *= 0.5*window.innerHeight
                //-----------------------------------------------------

                triangleProjected.fill(ctx, dotProduct) //change to .draw(ctx) to see outlines only
                triangleProjected.draw(ctx)             //used to see the outlines of triangles clearly

                // console.log(triangleProjected.vec)
            }

        }
    }

    render(time){
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
        this.drawTriangles(ctx, 130, bolidMesh)

        // console.log(this.cube.triangles)
        // console.log('here')
    }
}