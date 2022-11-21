import Vec3d from "./Vec3d";

export default class Triangle {
    v1:Vec3d;
    v2:Vec3d;
    v3:Vec3d;
    points:Array<Vec3d>;
    //dot product - illumination percent
    dp:number;
    color:string;

    constructor(v1:Vec3d=new Vec3d(), v2:Vec3d=new Vec3d(), v3:Vec3d=new Vec3d()){
        this.points = [v1, v2, v3]
        this.color = ''
    }

    draw(ctx:CanvasRenderingContext2D){
        ctx.beginPath()
        ctx.moveTo(this.points[2].x, this.points[2].y)
        for(let i=0; i<this.points.length; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }
        ctx.stroke()
    }

    //dp - dotproduct, determines color intensity
    fill(ctx:CanvasRenderingContext2D, ){
        //light from camera to item
        if(this.color != '') ctx.fillStyle = this.color
        else ctx.fillStyle = `rgb(${this.dp*255},${this.dp*255},${this.dp*255})`

        ctx.beginPath()
        ctx.moveTo(this.points[2].x, this.points[2].y)
        for(let i=0; i<this.points.length; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }
        ctx.fill() 
    }
}