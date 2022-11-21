import Engine3d from "./Engine3d";
import Vec3d from "./Vec3d";

export default class CameraControls {
    w:boolean;
    s:boolean;
    a:boolean;
    d:boolean;

    up:boolean;
    down:boolean;
    left:boolean;
    right:boolean;

    engine:Engine3d;

    constructor(engine:Engine3d){
        this.w = false
        this.s = false
        this.a = false
        this.d = false

        this.up = false
        this.down = false
        this.left = false
        this.right = false
        this.engine = engine
    }

    move(){
        let deltaTime = 30
        let vForward = Vec3d.mul_vectors(this.engine.vLookDirection, 8/deltaTime)

        if(this.w) this.engine.vCamera = Vec3d.add_vectors(this.engine.vCamera, vForward)
        if(this.s) this.engine.vCamera = Vec3d.sub_vectors(this.engine.vCamera, vForward)
        if(this.a) this.engine.fYaw -= 30/deltaTime
        if(this.d) this.engine.fYaw += 30/deltaTime

        if(this.up) this.engine.vCamera.y += 0.1
        if(this.down) this.engine.vCamera.y -= 0.1
        if(this.left) this.engine.vCamera.x += 0.1
        if(this.right) this.engine.vCamera.x -= 0.1
        console.log(this.engine.fYaw)
    }

    enable(){
        window.addEventListener('keydown', (e) => {
            let key = e.key
            key = key.toLowerCase()
            console.log(key)

            if(key == 'w') this.w = true
            if(key == 's') this.s = true
            if(key == 'a') this.a = true
            if(key == 'd') this.d = true
            
            if(key == 'arrowup') this.up = true
            if(key == 'arrowdown') this.down = true
            if(key == 'arrowleft') this.left = true
            if(key == 'arrowright') this.right = true
        })
        window.addEventListener('keyup', (e) => {
            let key = e.key
            key = key.toLowerCase()
            
            if(key == 'w') this.w = false
            if(key == 's') this.s = false
            if(key == 'a') this.a = false
            if(key == 'd') this.d = false 

            if(key == 'arrowup') this.up = false
            if(key == 'arrowdown') this.down = false
            if(key == 'arrowleft') this.left = false
            if(key == 'arrowright') this.right = false
        })
    }
}