function onResize () {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    
    // If the screen device has a pixel ratio over 1
    // We render the canvas twice bigger to make it sharper (e.g. Retina iPhone)
    if (window.devicePixelRatio > 1) {
      canvas.width = canvas.clientWidth * 2;
      canvas.height = canvas.clientHeight * 2;
      ctx.scale(2, 2);
    } else {
      canvas.width = width;
      canvas.height = height;
    }

}
window.addEventListener("resize", onResize)
onResize()
console.log(Camera.PERSPECTIVE);

let cube = new Cube()
// cube.setRotation(0,0,-10)
// cube.setRotation(0,0,10)

function render(){
  ctx.clearRect(0,0, width, height)

  cube.draw()
  // cube.rotateX(1)
  

  for(let i=0; i<Camera.PARTICLES.length; i++){
    Camera.PARTICLES[i].draw()
    Math.abs(1 - this.z / width)
    // console.log(Camera.PARTICLES[0].z, Camera.PARTICLES[0].z/width);
  }

  window.requestAnimationFrame(render)
}

window.addEventListener('keydown', (event)=>{
  let key = event.key
  key = key.toLowerCase()
  console.log(key)

  // if(key == 'a') cube.rotateZ(-2)
  if(key == 'a') cube.moveX(-10)
  if(key == 'd') cube.moveX(10)
  if(key == 'w') cube.moveZ(10)
  if(key == 's') cube.moveZ(-10)
  if(key == ' ') cube.moveY(10)
  if(key == 'shift') cube.moveY(-10)
  if(key == 'j') cube.rotateX(1)
  if(key == 'u') cube.rotateX(-1)
  if(key == 'k') cube.rotateY(1)
  if(key == 'i') cube.rotateY(-1)
  if(key == 'l') cube.rotateZ(1)
  if(key == 'o') cube.rotateZ(-1)

  // Camera.applyPerspectiveToCube(cube)
})

render()
