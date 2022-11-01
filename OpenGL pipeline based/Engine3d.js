class Engine3d {
    constructor(ctx){
        this.ctx = ctx
        this.time = 0;
        this.timeStart = 0

        this.cube = this.makeCubeMesh()
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
        console.log(cube)
        return cube
    }

    drawTriangles(ctx, fTheta){
        let rotMatrices = Matrix.getRotationMatrices(fTheta)
        let rotMatZ = rotMatrices[0]
        let rotMatX = rotMatrices[1]

        for(let i=0; i<this.cube.triangles.length; i++){
            let triangleProjected = new Triangle()
            let triangleRotatedZ  = new Triangle()
            let triangleRotatedZX = new Triangle()

            let triangleTranslated = JSON.parse(JSON.stringify(this.cube.triangles[i]))  //because for some motherfucking reason thing before is fucking shallow copy, and references values in original arr
            triangleRotatedZ.vec[0] = Matrix.MultiplyMatrixVector(triangleTranslated.vec[0], rotMatZ)
            triangleRotatedZ.vec[1] = Matrix.MultiplyMatrixVector(triangleTranslated.vec[1], rotMatZ)
            triangleRotatedZ.vec[2] = Matrix.MultiplyMatrixVector(triangleTranslated.vec[2], rotMatZ)
            
            triangleRotatedZX.vec[0] = Matrix.MultiplyMatrixVector(triangleRotatedZ.vec[0], rotMatX)
            triangleRotatedZX.vec[1] = Matrix.MultiplyMatrixVector(triangleRotatedZ.vec[1], rotMatX)
            triangleRotatedZX.vec[2] = Matrix.MultiplyMatrixVector(triangleRotatedZ.vec[2], rotMatX)



            let triTranslated = triangleRotatedZX.vec
            triTranslated[0].z = triTranslated[0].z + 3
            triTranslated[1].z = triTranslated[1].z + 3 
            triTranslated[2].z = triTranslated[2].z + 3

            let v1 = Matrix.MultiplyMatrixVector(triTranslated[0], Matrix.projectionMatrix)
            let v2 = Matrix.MultiplyMatrixVector(triTranslated[1], Matrix.projectionMatrix)
            let v3 = Matrix.MultiplyMatrixVector(triTranslated[2], Matrix.projectionMatrix)

            triangleProjected.vec = [v1, v2, v3]
            //---------

            //before depth added 
            // let v1 = Matrix.MultiplyMatrixVector(this.cube.triangles[i].vec[0])
            // let v2 = Matrix.MultiplyMatrixVector(this.cube.triangles[i].vec[1])
            // let v3 = Matrix.MultiplyMatrixVector(this.cube.triangles[i].vec[2])
            //---------
            // let triangleProjected = new Triangle()


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
            
            triangleProjected.draw(ctx)

            console.log(triangleProjected.vec)
        }
    }

    render(time){
        let ctx = this.ctx
        ctx.clearRect(0,0, window.innerWidth, window.innerHeight)
        let fTheta = 0
        
        if(this.time == 0) {
            this.timeStart = time
            this.time = time
        }
        else fTheta = (((time - this.timeStart))/30)
        this.time = time
        console.log(fTheta, 'dupa')

        this.drawTriangles(ctx, fTheta)

        console.log(this.cube.triangles)
        console.log('here')
    }
}