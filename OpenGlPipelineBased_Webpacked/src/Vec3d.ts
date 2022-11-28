import Triangle from "./Triangle";

export default class Vec3d {
    x:number;
    y:number;
    z:number;
    w:number;
    pos:Array<number>;
    
    constructor(x:number=0, y:number=0, z:number=0, w:number=1){
        this.x = x
        this.y = y 
        this.z = z
        this.w = w
        this.pos = [x, y, z, w]
    }

    static clippingDebug = false

    static add_vectors(v1:Vec3d, v2:Vec3d):Vec3d{   
        return new Vec3d(v1.x+v2.x, v1.y+v2.y, v1.z+v2.z) 
    }

    static sub_vectors(v1:Vec3d, v2:Vec3d):Vec3d{   
        return new Vec3d(v1.x-v2.x, v1.y-v2.y, v1.z-v2.z) 
    }

    static mul_vectors(v:Vec3d, k:number):Vec3d{   
        return new Vec3d(v.x*k, v.y*k, v.z*k) 
    }

    static div_vectors(v:Vec3d, k:number):Vec3d{   
        return new Vec3d(v.x/k, v.y/k, v.z/k) 
    }

    static dot_product(v1:Vec3d, v2:Vec3d):number{
        return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z
    }

    static vector_length(v:Vec3d):number{
        return Math.sqrt(this.dot_product(v, v))
    }

    static vector_normalise(v:Vec3d):Vec3d{
        let l = this.vector_length(v)
        return new Vec3d(v.x/l, v.y/l , v.z/l)
    }
    
    static cross_product(v1:Vec3d, v2:Vec3d):Vec3d{
        let v = new Vec3d()
        v.x = v1.y*v2.z - v1.z*v2.y
        v.y = v1.z*v2.x - v1.x*v2.z
        v.z = v1.x*v2.y - v1.y*v2.x

        return v
    }
    //plane_p - point on the plane || plane_n - normal on the plane || lineStart - starting point of line || lineEnd - ending point of line  
    static vector_intersect_plane(plane_p:Vec3d, plane_n:Vec3d, lineStart:Vec3d, lineEnd:Vec3d):Vec3d{
        plane_n = this.vector_normalise(plane_n)

        let plane_d = -this.dot_product(plane_n, plane_p)
        let ad = this.dot_product(lineStart, plane_n)
        let bd = this.dot_product(lineEnd, plane_n)
        let t = (-plane_d - ad)/(bd - ad)

        let lineStartToEnd = this.sub_vectors(lineEnd, lineStart)
        let lineToIntersect = this.mul_vectors(lineStartToEnd, t)

        return this.add_vectors(lineStart, lineToIntersect)
    }

    static triangleClipAgainstPlane(plane_p:Vec3d, plane_n:Vec3d, in_triangle:Triangle, outTriangles:Triangle[]):number{
        plane_n = this.vector_normalise(plane_n)

        //shortest distance from plane to point
        //used for distinguishing on which side the given point is placed 
        let distance = (p:Vec3d):number => {
            // let n = this.vector_normalise(p)
            return (plane_n.x*p.x + plane_n.y*p.y + plane_n.z*p.z - this.dot_product(plane_n, plane_p))
        }

        let inside_points:Vec3d[] = []
        let outside_points:Vec3d[] = []
        let nInsidePointCount:number = 0
        let nOutsidePointCount:number = 0

        let d0 = distance(in_triangle.points[0])
        let d1 = distance(in_triangle.points[1])
        let d2 = distance(in_triangle.points[2])

        if (d0 >= 0)  inside_points[nInsidePointCount++] = in_triangle.points[0]; 
		else  outside_points[nOutsidePointCount++] = in_triangle.points[0]; 
		if (d1 >= 0)  inside_points[nInsidePointCount++] = in_triangle.points[1]; 
		else  outside_points[nOutsidePointCount++] = in_triangle.points[1]; 
		if (d2 >= 0)  inside_points[nInsidePointCount++] = in_triangle.points[2]; 
		else  outside_points[nOutsidePointCount++] = in_triangle.points[2]; 

        if(nInsidePointCount == 0) return 0
        if(nInsidePointCount == 3){
            outTriangles[0] = in_triangle
            return 1
        }
        if(nInsidePointCount == 1 && nOutsidePointCount == 2){
            outTriangles[0] = new Triangle()
            if(this.clippingDebug) outTriangles[0].color = 'rgb(0,255,0)'
            outTriangles[0].dp = in_triangle.dp

            
            outTriangles[0].points[0] = inside_points[0]
            outTriangles[0].points[1] = this.vector_intersect_plane(plane_p, plane_n, inside_points[0], outside_points[0])
            outTriangles[0].points[2] = this.vector_intersect_plane(plane_p, plane_n, inside_points[0], outside_points[1])
            return 1
        }
        if(nInsidePointCount == 2 && nOutsidePointCount == 1){ //if(nInsidePointCount == 2 && nOutsidePointCount == 1)
            outTriangles[0] = new Triangle()
            outTriangles[1] = new Triangle()
            
            if(this.clippingDebug){
                outTriangles[0].color = 'rgb(255,0,0)'
                outTriangles[1].color = 'rgb(0,0,255)'
            }

            outTriangles[0].dp = in_triangle.dp
            outTriangles[1].dp = in_triangle.dp

        
            outTriangles[0].points[0] = inside_points[0]
            outTriangles[0].points[1] = inside_points[1]
            outTriangles[0].points[2] = this.vector_intersect_plane(plane_p, plane_n, inside_points[0], outside_points[0])
        
            outTriangles[1].points[0] = inside_points[1]
            outTriangles[1].points[1] = outTriangles[0].points[2]
            outTriangles[1].points[2] = this.vector_intersect_plane(plane_p, plane_n, inside_points[1], outside_points[0])
            return 2
        }

    }
}