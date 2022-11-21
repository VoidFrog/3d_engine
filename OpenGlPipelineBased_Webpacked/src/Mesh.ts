import Triangle from "./Triangle";

export default class Mesh {
    triangles:Array<Triangle>;

    constructor(triangles:Array<Triangle>){
        this.triangles = triangles
    }
}