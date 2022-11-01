class Particle {
    constructor(){
        this.x = (Math.random() - 0.5) * width;     //Give a random x position
        this.y = (Math.random() - 0.5) * height;    //Give a random y position
        this.z = Math.random() * width;             //Give a random z position
        this.radius = 10;                           //Size of our element in the 3D world
   
        this.xProjected = 0;        //x coordinate on the 2D world
        this.yProjected = 0;        //y coordinate on the 2D world
        this.scaleProjected = 0;    //Scale of the element on the 2D world (further = smaller)

        this.moveRange = Math.random() * 1000
        this.movementDirection = Math.round(Math.random()) //0-in || 1-out
        this.innerBound = this.z - this.moveRange
        if(this.innerBound < 0) this.innerBound = 0
        this.outerBound = this.z + this.moveRange
    }

    project(){
        // The scaleProjected will store the scale of the element based on its distance from the 'camera'
        this.scaleProjected = Camera.PERSPECTIVE / (Camera.PERSPECTIVE + this.z + Camera.Z);
        // The xProjected is the x position on the 2D world
        this.xProjected = (this.x * this.scaleProjected) + Camera.PROJECTION_CENTER_X + Camera.X;
        // The yProjected is the y position on the 2D world
        this.yProjected = (this.y * this.scaleProjected) + Camera.PROJECTION_CENTER_Y + Camera.Y;
    }

    draw(){
        let ctx = document.getElementById('root').getContext('2d');

        this.move();
        this.project();                                             // We first calculate the projected values of our dot
        ctx.globalAlpha = Math.abs(1 - this.z / width);             // We define the opacity of our element based on its distance
        
        // We draw a rectangle based on the projected coordinates and scale
        ctx.fillRect(this.xProjected - this.radius, this.yProjected - this.radius, this.radius * 2 * this.scaleProjected, this.radius * 2 * this.scaleProjected);
    }

    move(){
        if(this.movementDirection == 0){
            if(this.z > this.innerBound){
                this.z -= 2
            }
            else this.movementDirection = 1 
        }
        else if(this.movementDirection == 1){
            if(this.z < this.outerBound){
                this.z += 2
            }
            else this.movementDirection = 0
        }

    }
}