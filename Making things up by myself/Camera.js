let canvas = document.getElementById('root')
let ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

let width = canvas.offsetWidth
let height = canvas.offsetHeight

class Camera {
    static PERSPECTIVE = width*0.8   //field of view of 3d scene    
    static PROJECTION_CENTER_X = width/2   //x center of canvas
    static PROJECTION_CENTER_Y = height/2   //y center of canvas
    static PARTICLES = []            //all particles to render
    
    static X = 0
    static Y = 0
    static Z = -300

    static applyPerspectiveToCube(cube){


        let x = cube.centralPoint.x
        let y = cube.centralPoint.y
        let z = cube.centralPoint.z

        //hypotenuse
        //let distance = Math.sqrt(Math.pow(this.X - x, 2) + Math.pow(this.Y - y, 2) + Math.pow(this.Z - z, 2))
        //console.log(distance)

        //angle between camera and X axis
        //y diff
        let dheightY = Math.abs(y-this.Y)
        //distance on zx plane
        let dzx = Math.hypot(x-this.X, z-this.Z) || 1
        //getting tangent
        let tanX = dheightY/dzx
        let angleX = Math.atan(tanX)
        angleX = angleX*180/Math.PI
        angleX = Math.round(angleX)
        if(Camera.Y < y) angleX = -angleX
        //---------------------------------

        //angle between camera and Y axis
        let dheightX = Math.abs(x-this.X)
        let dyz = Math.hypot(z-this.Z, y-this.Y)
        let tanY = dheightX/dyz
        let angleY = Math.atan(tanY)
        angleY = angleY*180/Math.PI
        angleY = Math.round(angleY)
        if(Camera.X < x) angleY = -angleY


        //angle between camera and Z axis
        let dheightZ = Math.abs(z-this.Z)
        let dxy = Math.hypot(x-this.X, y-this.Y) || 1 
        let tanZ = dheightZ/dxy
        let angleZ = Math.atan(tanZ)
        angleZ = angleZ*180/Math.PI
        angleZ = Math.round(angleZ)
        // if(Camera.Z < z) angleZ = -angleZ

        console.log(dheightX, dzx, 'distances', tanX, angleX, angleY)

        cube.setRotation(angleX, angleY, null)
    }
}

window.addEventListener('keydown', (e) => {
    let key = e.key
    key = key.toLowerCase()

    if(key == 'arrowup'){
        Camera.Y += 3
    }
    if(key == 'arrowdown'){
        Camera.Y -= 3
    }
    if(key == 'arrowleft'){
        Camera.X -= 3 
    }
    if(key == 'arrowright'){
        Camera.X += 3 
    }
    if(key == 'n') Camera.Z += 3
    if(key == 'm') Camera.Z -= 3

    console.log(Camera.X, Camera.Y, Camera.Z, 'camera coordinates', cube.centralPoint.x,cube.centralPoint.y,cube.centralPoint.z)
    Camera.applyPerspectiveToCube(cube)
})
