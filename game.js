/*jslint bitwise:true, es5: true */

var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    
    canvas = undefined,
    iBody = new Image(),
    iFood = new Image(),
    aEat = new Audio(),
    aDie = new Audio(),
    ctx = undefined,
    lastPress = undefined,
    pause = true,
    body = [],
    lvls = [],
    actualLvl = undefined,
    food = undefined,
    gameover = false,
    score = 0,
    dir = 0;

var wall = [];
var lvl1walls = [];
lvl1walls.push([400-150,400+150,150,0]);
lvl1walls.push([400-150,400+150,450,0]);
lvl1walls.push([100,500,100,1]);
lvl1walls.push([100,500,700,1]);
  
var lvl1 = new Level(0,2,lvl1walls);
lvls.push(lvl1);

var lvl2walls = [];
lvl2walls.push([400-200,400+200,100,0]);
lvl2walls.push([400-200,400+200,200,0]);
lvl2walls.push([400-200,400+200,300,0]);
lvl2walls.push([400-200,400+200,400,0]);
var lvl2 = new Level(3, 5, lvl2walls);
lvls.push(lvl2);

var lvl3walls = [];
lvl3walls.push([400-150,400+150,150,0]);
lvl3walls.push([400-150,400+150,450,0]);
lvl3walls.push([100,500,100,1]);
lvl3walls.push([100,500,700,1]);
var lvl3 = new Level(6, 8, lvl3walls);
lvls.push(lvl3);

function horizontalWalls(a,b,c){
    for(var start = a; start <= b; start +=1){
        wall.push(new Rectangle(start,c,10,10));
    }
}
function verticalWalls(a,b,c){
    for(var start = a; start <= b; start +=1){
        wall.push(new Rectangle(c,start,10,10));
    }
}

function canPlayOgg() {
    var aud = new Audio();
    if (aud.canPlayType('audio/ogg').replace(/no/, '')) {
        return true;
    } else {
        return false;
    }
}

document.addEventListener('keydown', evt => {
    lastPress = evt.which;
}, false);

function random(max) {
    return ~~(Math.random() * max);
}
// wallsArray should have initial point, ending point, constant value and orientation
function Level(minScore,maxScore, wallsArray = [0,0,0,0]){
    this.minScore = minScore;
    if (this.minScore === undefined) {
        window.console.warn('Missing parameters on level structure');
    } 
    this.maxScore = maxScore;
    if (this.maxScore === undefined) {
        window.console.warn('Missing parameters on level structure');
    }
    this.wallsArray = wallsArray;
}
Level.prototype = {
    constructor: Level,
    draw: function() {
        if (this.wallsArray === undefined || this.wallsArray.length === 0) {
            window.console.warn('Missing parameters on level structure');
        } else{
            this.wallsArray.forEach((array) =>{
                wall = []
                (array[3] === 0) ? horizontalWalls(array[0],array[1],array[2]): verticalWalls(array[0],array[1],array[2]);    
            });
        }
    }
    
}
function Rectangle(x, y, width, height) {
    this.x = (x === undefined) ? 0 : x;
    this.y = (y === undefined) ? 0 : y;
    this.width = (width === undefined) ? 0 : width;
    this.height = (height === undefined) ? this.width : height;
}

Rectangle.prototype = {
    constructor: Rectangle,
    
    intersects: function (rect) {
        if (rect === undefined) {
            window.console.warn('Missing parameters on function intersects');
        } else {
            return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
        }
    },
    
    fill: function (ctx) {
        if (ctx === undefined) {
            window.console.warn('Missing parameters on function fill');
        } else {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },
    
    drawImage: function (ctx, img) {
        if (img === undefined) {
            window.console.warn('Missing parameters on function drawImage');
        } else {
            if (img.width) {
                ctx.drawImage(img, this.x, this.y);
            } else {
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    }
};

function act(){
    if (!pause) {
        console.log(gameover,pause);
        if (gameover) {
            reset();
        }
        if(score === actualLvl.maxScore){
            pause = !pause;
            actualLvl = lvls[lvls.indexOf(actualLvl)+1];
            wall = [];
            for (var i = 0; i < actualLvl.wallsArray.length; i++) {
                const wallLine = actualLvl.wallsArray[i];
                (wallLine[3] === 0) ? horizontalWalls(wallLine[0],wallLine[1],wallLine[2]): verticalWalls(wallLine[0],wallLine[1],wallLine[2]);
            }
        }

        // Move Body
        for (i = body.length - 1; i > 0; i -= 1) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }
        // Change Direction
        if (lastPress === KEY_UP && dir !== 2) {
            dir = 0;
        }
        if (lastPress === KEY_RIGHT && dir !== 3) {
            dir = 1;
        }
        if (lastPress === KEY_DOWN && dir !== 0) {
            dir = 2;
        }
        if (lastPress === KEY_LEFT && dir !== 1) {
            dir = 3;
        }
        

        // Move Rect
        if (dir === 0) {
            body[0].y -= 10;
        }
        if (dir === 1) {
            body[0].x += 10;
        }
        if (dir === 2) {
            body[0].y += 10;
        }
        if (dir === 3) {
            body[0].x -= 10;
        }
       

        // Out Screen
        if (body[0].x > canvas.width) {
            body[0].x = 0;
        }
        if (body[0].y > canvas.height) {
            body[0].y = 0;
        }
        if (body[0].x < 0) {
            body[0].x = canvas.width;
        }
        if (body[0].y < 0) {
            body[0].y = canvas.height;
        }
        if (body[0].intersects(food)) {
            aEat.play();
            // body.push(new Rectangle(food.x, food.y, 10, 10));
            body.push(new Rectangle(body[body.length-1].x, body[body.length-1].y, 10, 10));
            score += 1;
            food.x = random(canvas.width / 10 - 1) * 10;
            food.y = random(canvas.height / 10 - 1) * 10;
        }
        // Body Intersects
        for (i = 2, l = body.length; i < l; i += 1) {
            if (body[0].intersects(body[i])) {
                aDie.play();
                gameover = true;
                pause = true;
            }
        }
        // Wall Intersects
        for (i = 0, l = wall.length; i < l; i += 1) {
            if (food.intersects(wall[i])) {
                food.x = random(canvas.width / 10 - 1) * 10;
                food.y = random(canvas.height / 10 - 1) * 10;
            }

            if (body[0].intersects(wall[i])) {
                aDie.play();
                pause = true;
                gameover = true;
            }
        }
    }
    
    // Pause/Unpause
    if (lastPress === KEY_ENTER) {
        pause = !pause;
        lastPress = undefined;
    }
}
function paint(ctx) {
    // Clean canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw body[0]
    for (i = 0, l = body.length; i < l; i += 1) {
        body[i].drawImage(ctx,iBody);
    }
    
    // Draw food
    food.drawImage(ctx, iFood);

    // Debug last key pressed
    ctx.fillStyle = '#fff';
    //ctx.fillText('Last Press: '+lastPress,0,20);
    
    // Draw score
    ctx.fillText('Score: ' + score, 0, 10);
    ctx.fillText('Level: ' + (lvls.indexOf(actualLvl)+1), 0, 20);

    ctx.fillStyle = '#999';
    
    for (i = 0, l = wall.length; i < l; i += 1) {
        wall[i].fill(ctx);
    }
    // Draw pause
    if (pause) {
        ctx.textAlign = 'center';
        if (gameover) {
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        } else {
            ctx.fillText('PAUSE', canvas.width/2, canvas.height/2);
        }
        ctx.textAlign = 'left';
    }
    
}

function repaint() {
    window.requestAnimationFrame(repaint);
    paint(ctx);
}

function run() {
    setTimeout(run, 50);
    act();
}

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    if (canPlayOgg()) {
        aEat.src = 'assets/chomp.oga';
        aDie.src = 'assets/dies.oga';
    } else {
        aDie.src = 'assets/dies.m4a';
        aEat.src = "assets/chomp.m4a";
    }
    iBody.src = 'assets/body.png';
    iFood.src = 'assets/fruit.png';

    food = new Rectangle(80, 80, 10, 10);
    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    actualLvl = lvls[0]; 
    wall = [];
    for (var i = 0; i < actualLvl.wallsArray.length; i++) {
        const wallLine = actualLvl.wallsArray[i];
        (wallLine[3] === 0) ? horizontalWalls(wallLine[0],wallLine[1],wallLine[2]): verticalWalls(wallLine[0],wallLine[1],wallLine[2]);
    }  
    run();
    repaint();
}
function reset() {
    score = 0;
    dir = 1;
    actualLvl = lvls[0];    

    body.length = 0;
    body.push(new Rectangle(40, 40, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));
    body.push(new Rectangle(0, 0, 10, 10));

    body[0].x = canvas.width/2;
    body[0].y = canvas.height/2;
    food.x = random(canvas.width / 10 - 1) * 10;
    food.y = random(canvas.height / 10 - 1) * 10;
    gameover = false;
}
window.addEventListener('load', init, false);