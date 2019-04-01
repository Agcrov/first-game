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
    food = undefined,
    gameover = false,
    score = 0,
    dir = 0;

var wall = new Array();

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
        if (gameover) {
            reset();
        }
        // Move Body
        for (i = body.length - 1; i > 0; i -= 1) {
            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }
        // Change Direction
        if (lastPress === KEY_UP) {
            dir = 0;
        }
        if (lastPress === KEY_RIGHT) {
            dir = 1;
        }
        if (lastPress === KEY_DOWN) {
            dir = 2;
        }
        if (lastPress === KEY_LEFT) {
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



    wall.push(new Rectangle(100, 50, 10, 10));
    wall.push(new Rectangle(100, 100, 10, 10));
    wall.push(new Rectangle(200, 50, 10, 10));
    wall.push(new Rectangle(200, 100, 10, 10));
    
    run();
    repaint();
}
function reset() {
    score = 0;
    dir = 1;

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