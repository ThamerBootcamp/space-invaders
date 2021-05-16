let canvas = document.querySelector("#canvas");
let context = canvas.getContext("2d");

const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;
const KEY_CODE_ENTER = 13;


const PLAYER_MAX_SPEED = 500.0;
var playerImg = new Image(); 
playerImg.src = './img/1spaceship.png';

const LASER_MAX_SPEED = 500.0;
const LASER_COOLDOWN = 0.2;
let LASER_DAMAGE = 20;
var laserImg = new Image();   
laserImg.src = './img/beam1.png';

var enemyImg = new Image();   
enemyImg.src = './img/enemy.png';

var wallImg = new Image();   
wallImg.src = './img/wall.png';

var bossImg = new Image();   
bossImg.src = './img/boss.png';

let BOSS_LASER_MAX_SPEED = 450.0;
let BOSS_LASER_COOLDOWN = 0.75;
var bossLaserImg = new Image();   
bossLaserImg.src = './img/bossLaser.png';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;
let GRAVITY_FORCE = 1;
let isStart = true; 

let isBossReady = false;
let isBossFirstSpawn = true;
let NUMBER_OF_ENEMIES= 10;
const MAX_ENEMIES_PER_ROW = 8;
const ENEMY_HORIZONTAL_PADDING = 50;
const ENEMY_VERTICAL_PADDING = 70;
const ENEMY_VERTICAL_SPACING = 60;
const ENEMY_COOLDOWN = 5.0;

let GAME_STATE = {
  playerX: 0,
  playerY: 0,
  loss: false,
  win:false,
  bossX: 0,
  bossY: 0,
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  playerCooldown: 0,
  bossCooldown: 0,
  bossHealth: 100,
  lasers:[],
  enemies: [],
  walls: [],
  bossLasers:[],
};
const PLAYER ={
  width: 75,
  height: 75
} 
const LASER ={
  width: 15,
  height: 40
} 
const ENEMY ={
  width: 50,
  height: 50
} 
const WALL ={
  width: 100,
  height: 50
} 
const BOSS ={
  width: 75,
  height: 75
} 

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

window.addEventListener('keydown', onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);

draw()

function draw(){
    if(isStart){
      initEnemies();
      initWalls();
    }
    context.clearRect(0, 0, CANVAS_WIDTH,CANVAS_HEIGHT);

    render();
}
function setHard(){
  if(GAME_STATE.spacePressed ==false){
    context.clearRect(0, 0, CANVAS_WIDTH,CANVAS_HEIGHT);
    NUMBER_OF_ENEMIES = 25
    WALL.width=30 
    LASER_DAMAGE = 10
    BOSS_LASER_COOLDOWN = 0.2
    BOSS_LASER_MAX_SPEED = 600
    GRAVITY_FORCE = 2
  
    restart()
  }
  
}
function setMed(){
  if(GAME_STATE.spacePressed ==false){
    context.clearRect(0, 0, CANVAS_WIDTH,CANVAS_HEIGHT);
    NUMBER_OF_ENEMIES = 20
    WALL.width= 50
    LASER_DAMAGE = 15
    BOSS_LASER_COOLDOWN = 0.5
    BOSS_LASER_MAX_SPEED = 500
    GRAVITY_FORCE = 1.5
  
    restart()
  }
  
}
function restart(){
  isStart = true
  isBossReady = false
  GAME_STATE.walls = []
  GAME_STATE.enemies = []
  GAME_STATE.loss = false
  GAME_STATE.win = false

}

function render() {
  context.fillStyle = 'rgba(0,0,0,0.5)';
  context.rect(0,0,window.innerWidth,window.innerHeight);
  context.fill();
  createPlayer();
  renderLasers();
  renderEnemies();
  renderWalls();
  if(isBossReady){
    createBoss()
    bossHealthbar(100,0, GAME_STATE.bossHealth, 500, 20);  
    renderBossLasers();
  }
  if (GAME_STATE.loss){
    lossMsg();
  }
  if (GAME_STATE.win){
    winMsg();
  }
}

function update(e) {
  const currentTime = Date.now();
  const dt = (currentTime - GAME_STATE.lastTime) / 1000.0;

  if(!GAME_STATE.win && !GAME_STATE.loss){
    updatePlayer(dt);
    updateLasers(dt);
    updateEnemies(dt);
    updateBoss(dt);
    updateBossLasers(dt);
  }
  draw()
  GAME_STATE.lastTime = currentTime;
  window.requestAnimationFrame(update);
}

function rectsIntersect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}
function lossMsg(){
  context.lineWidth = 4;
  context.strokeStyle = "#000000";
  context.fillStyle = "#b90404";
  var rectHeight = 50;
  var rectWidth = 100;
  var rectX = CANVAS_WIDTH/2 -rectWidth/2 ;
  var rectY = CANVAS_HEIGHT/2 - rectHeight/2;
  context.fillRect(rectX, rectY, rectWidth, rectHeight, 10, true);
  context.font="20px Georgia";
  context.textAlign="center"; 
  context.textBaseline = "middle";
  context.fillStyle = "#000000";

  context.fillText("You Lost!",rectX+(rectWidth/2),rectY+(rectHeight/2));
  context.stroke();
}
function winMsg(){
  context.lineWidth = 4;
  context.strokeStyle = "#000000";
  context.fillStyle = "#1bb904";
  var rectHeight = 50;
  var rectWidth = 100;
  var rectX = CANVAS_WIDTH/2 -rectWidth/2 ;
  var rectY = CANVAS_HEIGHT/2 - rectHeight/2;
  context.fillRect(rectX, rectY, rectWidth, rectHeight, 10, true);
  context.font="20px Georgia";
  context.textAlign="center"; 
  context.textBaseline = "middle";
  context.fillStyle = "#000000";

  context.fillText("You Won!",rectX+(rectWidth/2),rectY+(rectHeight/2));
  context.stroke();
}
//create 
function createPlayer(){
    if(isStart){
        GAME_STATE.playerX = CANVAS_WIDTH/2 - PLAYER.width/2;
        GAME_STATE.playerY = CANVAS_HEIGHT -PLAYER.height-10;
        playerImg.addEventListener('load', function() {
          context.drawImage(playerImg, GAME_STATE.playerX, GAME_STATE.playerY,PLAYER.width,PLAYER.height);
        }, false);
        isStart = false;
    }
    context.drawImage(playerImg, GAME_STATE.playerX, GAME_STATE.playerY,PLAYER.width,PLAYER.height);
}

function createLaser(x,y){
  var laser = {laserX:x,laserY:y}
  context.drawImage(laserImg, x, y,LASER.width,LASER.height);
  GAME_STATE.lasers.push(laser)
}
function renderLasers(){
  GAME_STATE.lasers.forEach(element => {
    if(!element.isDead)
      context.drawImage(laserImg, element.laserX, element.laserY,LASER.width,LASER.height);
  });
}
function createBoss(){
  if(isBossFirstSpawn){
    GAME_STATE.bossX = CANVAS_WIDTH/2 - BOSS.width/2;
    GAME_STATE.bossY = CANVAS_HEIGHT/8 ;
    isBossFirstSpawn = false;
  }
  context.drawImage(bossImg, GAME_STATE.bossX, GAME_STATE.bossY,BOSS.width,BOSS.height);
}
function renderEnemies(){
  GAME_STATE.enemies.forEach(element => {
    if(!element.isDead)
      context.drawImage(enemyImg, element.enemyX, element.enemyY,ENEMY.width,ENEMY.height);
  });
}
function createEnemy(x,y){
  var enemy = {enemyX:x,enemyY:y, isDead:false}
  context.drawImage(enemyImg, x, y,ENEMY.width,ENEMY.height);
  GAME_STATE.enemies.push(enemy)
}
function initEnemies(){

  const enemySpacing =
  (CANVAS_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (MAX_ENEMIES_PER_ROW - 1);
  // var isDone = false 
  var createdEnemies = 0;
  while(createdEnemies != NUMBER_OF_ENEMIES){
    var j =Math.random()*3;
    var i = Math.random()* MAX_ENEMIES_PER_ROW;
    const y = (ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING )- (CANVAS_HEIGHT/2) ;
    const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING *Math.random()*9;
    // var notValid = true;
    if(x <CANVAS_WIDTH - ENEMY.width && x>=0 && y <CANVAS_HEIGHT-PLAYER.height-10 && y>= (-CANVAS_HEIGHT/2) ){
        createEnemy(x, y);
        createdEnemies++;
    }
  }
}
function initWalls(){
  const WALL_VERTICAL_PADDING = CANVAS_HEIGHT - CANVAS_HEIGHT/3 - PLAYER.height -50
  const WALL_HORIZONTAL_PADDING = 200;
  const WALL_VERTICAL_SPACING = WALL.height
  const WALLS_PER_ROW =2

  const wallSpacing = (CANVAS_WIDTH - WALL_HORIZONTAL_PADDING *2) / (WALLS_PER_ROW - 1);

  for (let i = 0; i < WALLS_PER_ROW; i++) {
    const y = WALL_VERTICAL_PADDING + (3*Math.random() )* WALL_VERTICAL_SPACING  ;

    const x = i * wallSpacing + WALL_HORIZONTAL_PADDING *Math.random();
    createWall(x, y);
  }

}
function createWall(x,y){
  var wall = {wallX:x,wallY:y}
  context.drawImage(wallImg, x, y,WALL.width,WALL.height);
  GAME_STATE.walls.push(wall)
}
function renderWalls(){
  GAME_STATE.walls.forEach(element => {
      context.drawImage(wallImg, element.wallX, element.wallY,WALL.width,WALL.height);
  });
}
function createBossLaser(x,y){
  var laser = {laserX:x,laserY:y}
  context.drawImage(bossLaserImg, x, y,LASER.width,LASER.height);
  GAME_STATE.bossLasers.push(laser)
}
function renderBossLasers(){
  GAME_STATE.bossLasers.forEach(element => {
    if(!element.isDead)
      context.drawImage(bossLaserImg, element.laserX, element.laserY,LASER.width,LASER.height);
  });
}

// events
function onKeyDown(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_SPACE || e.keyCode ===KEY_CODE_ENTER) {
    GAME_STATE.spacePressed = true;
  }
}
function onKeyUp(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_SPACE || e.keyCode === KEY_CODE_ENTER) {
    GAME_STATE.spacePressed = false;
  }
}

/// updates 
function updatePlayer(dt) {
  if (GAME_STATE.leftPressed && (GAME_STATE.playerX)>=0) {
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
    draw();
  }
  if (GAME_STATE.rightPressed && (GAME_STATE.playerX+PLAYER.width)<=CANVAS_WIDTH) {
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
    draw();
  }
  if(GAME_STATE.spacePressed &&  GAME_STATE.playerCooldown <=0){
    createLaser(GAME_STATE.playerX+PLAYER.width/2-LASER.width/2,GAME_STATE.playerY-LASER.height);
    GAME_STATE.playerCooldown = LASER_COOLDOWN;
  }
  if(GAME_STATE.playerCooldown >0){
    GAME_STATE.playerCooldown -= dt;
  }
}

function updateLasers(dt){
  GAME_STATE.lasers.forEach(element => {
    element.laserY -= dt* LASER_MAX_SPEED;

    const r1 = {
      top: element.laserY,
      left: element.laserX ,
      right:(element.laserX+LASER.width),
      bottom: (element.laserY + LASER.height)
    }
    GAME_STATE.enemies.forEach(enemy => {
      const r2 = {
        top: enemy.enemyY,
        left: enemy.enemyX ,
        right:(enemy.enemyX+ENEMY.width),
        bottom: (enemy.enemyY + ENEMY.height)
      }

      if (rectsIntersect(r1, r2)) {
        enemy.isDead = true;
        element.isDead = true;
      }
    });
    GAME_STATE.walls.forEach(wall => {
      const r2 = {
        top: wall.wallY,
        left: wall.wallX ,
        right:(wall.wallX+WALL.width),
        bottom: (wall.wallY + WALL.height)
      }

      if (rectsIntersect(r1, r2)) {
        element.isDead = true;
      }
    });
    if(isBossReady){
      const r2 = {
        top: GAME_STATE.bossY,
        left: GAME_STATE.bossX ,
        right:(GAME_STATE.bossX+BOSS.width),
        bottom: (GAME_STATE.bossY + BOSS.height)
      }
  
      if (rectsIntersect(r1, r2)) {
        GAME_STATE.bossHealth-=LASER_DAMAGE
        element.isDead = true;
        if(GAME_STATE.bossHealth<=0){
          GAME_STATE.win = true;
        }
      }
    }
  });

  GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
}

function updateEnemies(dt) {
  let dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 0.1;
  let dy = GRAVITY_FORCE

  GAME_STATE.enemies.forEach(enemy => {
    if( (enemy.enemyX + dx )>CANVAS_WIDTH  ) {
      dx = -dx*2;
    }
    enemy.enemyX += dx;
    enemy.enemyY += dy;
    if (enemy.enemyY > CANVAS_HEIGHT) enemy.enemyY = 0;
    const r1 = {
      top: enemy.enemyY,
      left: enemy.enemyX ,
      right:(enemy.enemyX+ENEMY.width),
      bottom: (enemy.enemyY + ENEMY.height)
    }
    
    GAME_STATE.walls.forEach(wall => {
      const r2 = {
        top: wall.wallY,
        left: wall.wallX ,
        right:(wall.wallX+WALL.width),
        bottom: (wall.wallY + WALL.height)
      }

      if (rectsIntersect(r1, r2)) {
        enemy.enemyY = 0;
        enemy.enemyX = Math.random()*CANVAS_WIDTH;
      }
    });
    
      const r2 = {
        top: GAME_STATE.playerY,
        left: GAME_STATE.playerX ,
        right:(GAME_STATE.playerX+PLAYER.width),
        bottom: (GAME_STATE.playerY + PLAYER.height)
      }

      if (rectsIntersect(r1, r2)) {
         GAME_STATE.loss = true;
      }

  });

  GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
  if(GAME_STATE.enemies.length==0 && !isBossReady && !isStart){
    isBossReady = true;
    GAME_STATE.bossHealth = 100;
  }
}

function updateBoss(dt) {
  var randVal = 0;
  if(Math.random()*2>1){
    randVal = Math.random()* 4;
  }else{
    randVal = Math.random() * -4;
  }
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) *3 +  Math.sin(GAME_STATE.lastTime / 1000.0) *2// -randVal;
  const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 0.8;
  if((GAME_STATE.bossX + dx)<= canvas.width && (GAME_STATE.bossX + dx> -BOSS.width)) GAME_STATE.bossX += dx;
  else{
    GAME_STATE.bossX += 0
  }
  GAME_STATE.bossY += dy;
  if(isBossReady && GAME_STATE.bossCooldown <=0){
    createBossLaser(GAME_STATE.bossX+BOSS.width/2,GAME_STATE.bossY+BOSS.height);
    GAME_STATE.bossCooldown = BOSS_LASER_COOLDOWN
  }
  if(GAME_STATE.bossCooldown >0){
    GAME_STATE.bossCooldown -= dt;
  }
}
function updateBossLasers(dt){
  GAME_STATE.bossLasers.forEach(element => {
    element.laserY += dt* BOSS_LASER_MAX_SPEED;

    const r1 = {
      top: element.laserY,
      left: element.laserX ,
      right:(element.laserX+LASER.width),
      bottom: (element.laserY + LASER.height)
    }
    const r2 = {
      top: GAME_STATE.playerY,
      left: GAME_STATE.playerX ,
      right:(GAME_STATE.playerX+PLAYER.width),
      bottom: (GAME_STATE.playerY + PLAYER.height)
    }

    if (rectsIntersect(r1, r2)) {
      GAME_STATE.loss = true;
      element.isDead = true;
    }
    
    GAME_STATE.walls.forEach(wall => {
      const r2 = {
        top: wall.wallY,
        left: wall.wallX ,
        right:(wall.wallX+WALL.width),
        bottom: (wall.wallY + WALL.height)
      }

      if (rectsIntersect(r1, r2)) {
        element.isDead = true;
      }
    });
  });
  GAME_STATE.bossLasers = GAME_STATE.bossLasers.filter(e => !e.isDead);
}
function bossHealthbar(x, y, per, width, thickness){
  context.beginPath();
  context.rect(x-width/2, y, width*((per+15)/100), thickness);
  if(per > 63){
      context.fillStyle="green"
  }else if(per > 37){
      context.fillStyle="gold"
  }else if(per > 13){
    context.fillStyle="orange";
  }else{
    context.fillStyle="red";
  }
  context.closePath();
  context.fill();
  context.font="10px Georgia";
  context.textAlign="center"; 
  context.textBaseline = "middle";
  context.fillStyle = "#FFFFF";
  
  context.fillText("Boss health",x,y+thickness+10);
}