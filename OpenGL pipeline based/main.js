function main(){
    let canvas = document.getElementById('root')
    let ctx = canvas.getContext('2d')
    
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let game = new Engine3d(ctx)

    setInterval(() => {
        time = Date.now()
        game.render(time)
        
    }, 1000/50);
}

main()