// 精靈圖和動畫陣列
let spriteSheets = []; 
let animations = []; 
let backgroundImg; // 新增背景圖變數
let backgroundX = 0; // 新增背景位置變數
const BACKGROUND_SCROLL_SPEED = 0.5; // 背景移動速度係數
let fireballImg; // 新增火球圖片變數

// 角色狀態
let character1 = {
  x: 200,
  currentAnimation: 0,
  frameIndex: 0,
  direction: 1, // 1 表示面向右邊，-1 表示面向左邊
  isMoving: false,
  health: 100,  // 新增生命值
  canShoot: true,  // 射擊冷卻控制
  shootCooldown: 30  // 射擊冷卻時間（幀數）
};

let character2 = {
  x: 600,
  currentAnimation: 0,
  frameIndex: 0,
  direction: -1,
  isMoving: false,
  health: 100,  // 新增生命值
  canShoot: true,  // 射擊冷卻控制
  shootCooldown: 30  // 射擊冷卻時間（幀數）
};

// 常數設定
const GROUND_Y = 500;
const MOVE_SPEED = 5;

// 定義動畫資料
const animationData = [
  {
    name: '待機',
    frames: 6,
    width: 46,
    height: 80,
    file: 'fighter1-idle.png'
  },
  {
    name: '待機2',
    frames: 6,
    width: 49,
    height: 82,
    file: 'fighter2-idle.png'
  },
  {
    name: '走路',
    frames: 5,
    width: 77,
    height: 71,
    file: 'fighter1-walk.png'
  },
  {
    name: '走路2',
    frames: 7,
    width: 60,
    height: 58,
    file: 'fighter2-walk.png'
  },
  {
    name: '攻擊',
    frames: 4,
    width: 75,
    height: 80,
    file: 'fighter1-attack.png'
  },
  {
    name: '攻擊2',
    frames: 7,
    width: 110,
    height: 80,
    file: 'fighter2-attack.png'
  },
  {
    name: '飛踢',
    frames: 4,
    width: 91,
    height: 55,
    file: 'fighter1-kick.png'
  },
  {
    name: '飛踢2',
    frames: 4,
    width: 103,
    height: 78,
    file: 'fighter2-kick.png'
  }
];

// 新增發射物件和生命值相關的變數
let projectiles1 = []; // 角色1的發射物件
let projectiles2 = []; // 角色2的發射物件
const PROJECTILE_SPEED = 8;
const PROJECTILE_SIZE = 20;

function preload() {
  // 載入背景圖
  backgroundImg = loadImage('assets/background.png'); // 請確保檔案路徑正確
  
  // 載入火球圖片
  fireballImg = loadImage('assets/fireball.png', 
    // 成功載入時的回調
    () => { console.log('火球圖片載入成功！'); },
    // 載入失敗時的回調
    () => { console.log('火球圖片載入失敗！'); }
  );
  
  // 載入所有精靈圖片
  for (let data of animationData) {
    spriteSheets.push(loadImage('assets/' + data.file));
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(12);
  
  // 初始化所有動作的動畫
  for (let i = 0; i < animationData.length; i++) {
    let data = animationData[i];
    animations[i] = [];
    
    // 從精靈圖中切割每一幀
    for (let j = 0; j < data.frames; j++) {
      animations[i][j] = spriteSheets[i].get(
        j * data.width,
        0,
        data.width,
        data.height
      );
    }
  }
}

function draw() {
  // 清除背景
  background(0);
  
  // 計算並更新背景位置
  let moveSpeed = 2; // 背景移動速度
  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) { // A 或 左箭頭
    backgroundX += moveSpeed;
  }
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) { // D 或 右箭頭
    backgroundX -= moveSpeed;
  }
  
  // 繪製重複的背景
  for (let i = 0; i < 3; i++) {
    let xPos = (backgroundX % width) + (i * width);
    image(backgroundImg, xPos, 0, width, height);
  }
  
  // 畫出地面
  stroke(0);
  strokeWeight(3);
  line(0, GROUND_Y, width, GROUND_Y);
  
  // 繪製其他遊戲元素
  handleCharacterMovement();
  updateProjectiles();
  checkCollisions();
  displayCharacter(character1, [0, 2, 4, 6]);
  displayCharacter(character2, [1, 3, 5, 7]);
  displayHealth();
  displayInstructions();
}

function displayCharacter(character, animationIndices) {
  push();
  let currentData = animationData[animationIndices[character.currentAnimation]];
  
  translate(character.x, GROUND_Y - currentData.height);
  scale(character.direction, 1);
  
  image(
    animations[animationIndices[character.currentAnimation]][character.frameIndex],
    -currentData.width/2, 0,
    currentData.width,
    currentData.height
  );
  
  // 更新動畫幀
  character.frameIndex = (character.frameIndex + 1) % 
    animationData[animationIndices[character.currentAnimation]].frames;
  
  pop();
}

function handleCharacterMovement() {
  // 角色1的控制 (WASD)
  character1.isMoving = false;
  let prevAnimation1 = character1.currentAnimation;
  
  if (keyIsDown(65)) { // A
    character1.x -= MOVE_SPEED;
    character1.direction = -1;
    character1.isMoving = true;
    character1.currentAnimation = 1; // 切換到走路動畫
  } 
  else if (keyIsDown(68)) { // D
    character1.x += MOVE_SPEED;
    character1.direction = 1;
    character1.isMoving = true;
    character1.currentAnimation = 1; // 切換到走路動畫
  }
  
  if (keyIsDown(87)) { // W
    character1.currentAnimation = 2; // 攻擊
  }
  else if (keyIsDown(83)) { // S
    character1.currentAnimation = 3; // 飛踢
  }
  else if (!character1.isMoving) {
    character1.currentAnimation = 0; // 回到待機
  }
  
  // 如果動畫改變，重置幀索引
  if (prevAnimation1 !== character1.currentAnimation) {
    character1.frameIndex = 0;
  }
  
  // 角色2的控制 (方向鍵)
  character2.isMoving = false;
  let prevAnimation2 = character2.currentAnimation;
  
  if (keyIsDown(LEFT_ARROW)) {
    character2.x -= MOVE_SPEED;
    character2.direction = -1;
    character2.isMoving = true;
    character2.currentAnimation = 1; // 切換到走路動畫
  }
  else if (keyIsDown(RIGHT_ARROW)) {
    character2.x += MOVE_SPEED;
    character2.direction = 1;
    character2.isMoving = true;
    character2.currentAnimation = 1; // 切換到走路動畫
  }
  
  if (keyIsDown(UP_ARROW)) {
    character2.currentAnimation = 2; // 攻擊
  }
  else if (keyIsDown(DOWN_ARROW)) {
    character2.currentAnimation = 3; // 飛踢
  }
  else if (!character2.isMoving) {
    character2.currentAnimation = 0; // 回到待機
  }
  
  // 如果動畫改變，重置幀索引
  if (prevAnimation2 !== character2.currentAnimation) {
    character2.frameIndex = 0;
  }
  
  // 修改角色位置限制
  let minX = -width/2; // 允許角色移動到畫面外一點
  let maxX = width * 1.5; // 擴大活動範圍
  character1.x = constrain(character1.x, minX, maxX);
  character2.x = constrain(character2.x, minX, maxX);
  
  // 角色1的發射控制 (F鍵)
  if (keyIsDown(70) && character1.canShoot) { // F鍵
    projectiles1.push({
      x: character1.x + (30 * character1.direction),
      y: GROUND_Y - 40,
      direction: character1.direction
    });
    character1.canShoot = false;
  }
  
  // 角色2的發射控制 (L鍵)
  if (keyIsDown(76) && character2.canShoot) { // L鍵
    projectiles2.push({
      x: character2.x + (30 * character2.direction),
      y: GROUND_Y - 40,
      direction: character2.direction
    });
    character2.canShoot = false;
  }
}

function updateProjectiles() {
  // 確保火球圖片已載入
  if (!fireballImg) {
    console.log('火球圖片尚未載入！');
    return;
  }

  // 更新角色1的發射物件
  for (let i = projectiles1.length - 1; i >= 0; i--) {
    projectiles1[i].x += PROJECTILE_SPEED * projectiles1[i].direction;
    
    // 繪製火球
    push();
    translate(projectiles1[i].x, projectiles1[i].y);
    scale(projectiles1[i].direction, 1);
    imageMode(CENTER);
    image(fireballImg, 0, 0, PROJECTILE_SIZE * 6, PROJECTILE_SIZE * 6);
    pop();
    
    // 移除超出畫面的發射物
    if (projectiles1[i].x < 0 || projectiles1[i].x > width) {
      projectiles1.splice(i, 1);
    }
  }
  
  // 更新角色2的發射物件
  for (let i = projectiles2.length - 1; i >= 0; i--) {
    projectiles2[i].x += PROJECTILE_SPEED * projectiles2[i].direction;
    
    // 繪製火球
    push();
    translate(projectiles2[i].x, projectiles2[i].y);
    scale(projectiles2[i].direction, 1);
    imageMode(CENTER);
    image(fireballImg, 0, 0, PROJECTILE_SIZE * 6, PROJECTILE_SIZE * 6);
    pop();
    
    // 移除超出畫面的發射物
    if (projectiles2[i].x < 0 || projectiles2[i].x > width) {
      projectiles2.splice(i, 1);
    }
  }
  
  // 更新射擊冷卻
  if (!character1.canShoot) {
    character1.shootCooldown--;
    if (character1.shootCooldown <= 0) {
      character1.canShoot = true;
      character1.shootCooldown = 30;
    }
  }
  
  if (!character2.canShoot) {
    character2.shootCooldown--;
    if (character2.shootCooldown <= 0) {
      character2.canShoot = true;
      character2.shootCooldown = 30;
    }
  }
}

function checkCollisions() {
  // 檢查角色1的發射物是否擊中角色2
  for (let i = projectiles1.length - 1; i >= 0; i--) {
    let d = dist(projectiles1[i].x, projectiles1[i].y, 
                 character2.x, GROUND_Y - 40);
    if (d < 30) {
      character2.health -= 10;
      projectiles1.splice(i, 1);
      if (character2.health <= 0) {
        gameOver("藍超藍超人獲勝！");
      }
    }
  }
  
  // 檢查角色2的發射物是否擊中角色1
  for (let i = projectiles2.length - 1; i >= 0; i--) {
    let d = dist(projectiles2[i].x, projectiles2[i].y, 
                 character1.x, GROUND_Y - 40);
    if (d < 30) {
      character1.health -= 10;
      projectiles2.splice(i, 1);
      if (character1.health <= 0) {
        gameOver("黑超人獲勝！");
      }
    }
  }

  // 檢查近戰攻擊碰撞
  // 角色1的攻擊檢測
  if (character1.currentAnimation === 2 || character1.currentAnimation === 3) { // 攻擊或飛踢
    let attackRange = 60; // 攻擊範圍
    let d = dist(character1.x, GROUND_Y - 40, character2.x, GROUND_Y - 40);
    if (d < attackRange) {
      character2.health -= 5; // 近戰傷害
      if (character2.health <= 0) {
        gameOver("藍超藍超人獲勝！");
      }
    }
  }

  // 角色2的攻擊檢測
  if (character2.currentAnimation === 2 || character2.currentAnimation === 3) { // 攻擊或飛踢
    let attackRange = 60; // 攻擊範圍
    let d = dist(character2.x, GROUND_Y - 40, character1.x, GROUND_Y - 40);
    if (d < attackRange) {
      character1.health -= 5; // 近戰傷害
      if (character1.health <= 0) {
        gameOver("黑超人獲勝！");
      }
    }
  }
}

function displayHealth() {
  // 角色1的生命值和血量數值
  fill(0, 0, 255);
  rect(50, 30, 200, 20);
  fill(0, 255, 0);
  rect(50, 30, character1.health * 2, 20);
  
  fill(255);
  noStroke();
  textSize(20);
  textAlign(CENTER);
  text(character1.health, 150, 25);
  
  // 角色2的生命值和血量數值
  fill(255, 0, 0);
  rect(width - 250, 30, 200, 20);
  fill(0, 255, 0);
  rect(width - 250, 30, character2.health * 2, 20);
  
  fill(255);
  noStroke();
  textSize(20);
  textAlign(CENTER);
  text(character2.health, width - 150, 25);
}

function displayInstructions() {
  fill(255);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  
  // 角色1的控制說明移到血條下方
  text('藍超藍超人控制：', 50, 60);
  text('A/D - 左右移動', 50, 80);
  text('W - 攻擊', 50, 100);
  text('S - 飛踢', 50, 120);
  text('F - 發射', 50, 140);
  
  // 角色2的控制說明保持在原位
  text('黑超人控制：', width - 250, 60);
  text('←/→ - 左右移動', width - 250, 80);
  text('↑ - 攻擊', width - 250, 100);
  text('↓ - 飛踢', width - 250, 120);
  text('L - 發射', width - 250, 140);
}

function gameOver(message) {
  noLoop();
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(message, width/2, height/2);
  text("按下空白鍵重新開始", width/2, height/2 + 40);
}

function keyPressed() {
  if (key === ' ' && !isLooping()) {
    // 重置遊戲
    character1.health = 100;
    character2.health = 100;
    projectiles1 = [];
    projectiles2 = [];
    loop();
  }
}
