class Cube {
    constructor(){
        this.VERTICES = [[-1, -1, -1],[1, -1, -1],[-1, 1, -1],[1, 1, -1],[-1, -1, 1],[1, -1, 1],[-1, 1, 1],[1, 1, 1]];
        this.LINES = [[0, 1], [1, 3], [3, 2], [2, 0], [2, 6], [3, 7], [0, 4], [1, 5], [6, 7], [6, 4], [7, 5], [4, 5]];
        this.points = []
        
        this.scale = 100//Math.random() * width/3
        this.scaleVertices()
        
        this.centralPoint = this.getCentralPoint()

        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.radius = (Math.abs(this.points[0].x-this.points[1].x)*Math.SQRT2)/2
    }

    scaleVertices(){
        for(let i=0; i<this.VERTICES.length; i++){
            let point = new Point(this.VERTICES[i][0]*this.scale, this.VERTICES[i][1]*this.scale, this.VERTICES[i][2]*this.scale)
            this.points.push(point)
        }
    }

    getCentralPoint(){
        let pX = (this.points[0].x+this.points[7].x)/2
        let pY = (this.points[0].y+this.points[7].y)/2
        let pZ = (this.points[0].z+this.points[7].z)/2
        return this.centralPoint = new Point(pX, pY, pZ)
    }

    draw(){
        this.setRotation(this.rotationX, this.rotationY, this.rotationZ)

        //draw vertices
        for(let i=0; i<this.points.length; i++){
            this.points[i].draw()
        }
        //draw lines
        for(let i=0; i<this.LINES.length; i++){
            let p1 = this.LINES[i][0]
            let p2 = this.LINES[i][1]

            let v1 = this.points[p1]
            let v2 = this.points[p2]

            ctx.beginPath()
            ctx.moveTo(v1.xProjected, v1.yProjected)
            ctx.lineTo(v2.xProjected, v2.yProjected)
            ctx.stroke()
        }
        
        this.centralPoint.draw()
        // this.rotateY()
        // this.rotateZ()
        // this.rotateX()
    }

    rotateZ(angle){
        this.rotationZ += angle
        this.rotationZ = this.rotationZ%360

        for(let i=0; i<this.points.length; i++){
            // let newX = this.points[i].x*Math.cos(this.rotationY*(Math.PI/180))*(this.radius/this.points[i].x)
            // let newY = this.points[i].z*Math.sin(this.rotationY*(Math.PI/180))*(this.radius/this.points[i].z)
            
            let dx = this.points[i].x - this.centralPoint.x
            let dy = this.points[i].y - this.centralPoint.y
            
            let x = dx * Math.cos(angle*(Math.PI/180)) - dy * Math.sin(angle*(Math.PI/180))
            let y = dx * Math.sin(angle*(Math.PI/180)) + dy * Math.cos(angle*(Math.PI/180))
            
            let newX = x + this.centralPoint.x 
            let newY = y + this.centralPoint.y
            
            this.points[i].y = newY
            this.points[i].x = newX
            // let newPoint = new Point(newX, newY, this.points[i].z)
            // newPoint.draw()

        }
    }

    rotateY(angle){
        this.rotationY += angle
        this.rotationY = this.rotationY%360


        for(let i=0; i<this.points.length; i++){
            let dx = this.points[i].x - this.centralPoint.x
            let dz = this.points[i].z - this.centralPoint.z
            
            let x = dx * Math.cos(angle*(Math.PI/180)) - dz * Math.sin(angle*(Math.PI/180))
            let z = dx * Math.sin(angle*(Math.PI/180)) + dz * Math.cos(angle*(Math.PI/180))
            
            let newX = x + this.centralPoint.x 
            let newZ = z + this.centralPoint.z
            
            this.points[i].x = newX
            this.points[i].z = newZ
        }
    }

    rotateX(angle){
        this.rotationX += angle
        this.rotationX = this.rotationX%360


        for(let i=0; i<this.points.length; i++){
            let dy = this.points[i].y - this.centralPoint.y
            let dz = this.points[i].z - this.centralPoint.z
            
            let y = dy * Math.cos(angle*(Math.PI/180)) - dz * Math.sin(angle*(Math.PI/180))
            let z = dy * Math.sin(angle*(Math.PI/180)) + dz * Math.cos(angle*(Math.PI/180))
            
            let newY = y + this.centralPoint.y
            let newZ = z + this.centralPoint.z
            
            this.points[i].y = newY
            this.points[i].z = newZ
        }
    }

    //if null dont change
    setRotation(x,y,z){
        //console.log(this.rotationX, this.rotationY, this.rotationZ)
        //console.log(x,y,z)
        if(x != null){
            this.rotateX(-this.rotationX)
            this.rotateX(x)
        } 
        if(y != null){
            this.rotateY(-this.rotationY)
            this.rotateY(y)
        }
        if(z != null){
            this.rotateZ(-this.rotationZ)
            this.rotateZ(z)
        }

        //console.log(this.rotationX, this.rotationY, this.rotationZ)
    }


    moveX(x){
        this.centralPoint.x += x
        for(let i=0; i<this.points.length; i++){
            this.points[i].x += x 
        }
    }

    moveY(y){
        this.centralPoint.y += y
        for(let i=0; i<this.points.length; i++){
            this.points[i].y += y
        }
    }

    moveZ(z){
        this.centralPoint.z += z
        for(let i=0; i<this.points.length; i++){
            this.points[i].z += z 

        }
    }
}

class Point {
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = 5;
   
        this.xProjected = 0;        //x coordinate on the 2D world
        this.yProjected = 0;        //y coordinate on the 2D world
        this.scaleProjected = 0;    //Scale of the element on the 2D world (further = smaller)
    }

    project(){
        // The scaleProjected will store the scale of the element based on its distance from the 'camera'
        this.scaleProjected = Camera.PERSPECTIVE / (Camera.PERSPECTIVE + this.z + Camera.Z) || 1;
        // The xProjected is the x position on the 2D world
        this.xProjected = (this.x * this.scaleProjected) + Camera.PROJECTION_CENTER_X + Camera.X;
        // The yProjected is the y position on the 2D world
        this.yProjected = (this.y * this.scaleProjected) + Camera.PROJECTION_CENTER_Y + Camera.Y;
    }

    draw(){
        let ctx = document.getElementById('root').getContext('2d');
        this.project();                                             // We first calculate the projected values of our dot
        ctx.globalAlpha = Math.abs(1 - this.z / width);             // We define the opacity of our element based on its distance
        
        // We draw a rectangle based on the projected coordinates and scale
        ctx.fillRect(this.xProjected - this.radius, this.yProjected - this.radius, this.radius * 2 * this.scaleProjected, this.radius * 2 * this.scaleProjected);
    }
}