var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var player;
var cursors;

var score = 0;
var burgers = 0;
var muffins = 0;
var lollypops = 0;
var crackers = 0;

var scoreText;
var groundLayer;
var foodItems;
var maxFoodItems = 5;
var time = 30;

var blobster = {
    x: 360,
    y: 410,
    width: 100,
    height: 100 
};

function preload() {
    //basics
    this.load.image('player', 'assets/Tiles/character.png');
    this.load.image('ground', 'assets/Tiles/ground.png');
    this.load.image('background', 'assets/Tiles/background.png');
    this.load.image('platform', 'assets/Tiles/platform.png');

    //food items
    this.load.image('burger', 'assets/Tiles/burger.png');
    this.load.image('muffin', 'assets/Tiles/muffin.png');
    this.load.image('lollypop', 'assets/Tiles/lollypop.png');
    this.load.image('cracker', 'assets/Tiles/cracker.png');

    //blob
    this.load.image('blob', 'assets/Tiles/Blob.png');
}

function create() {
    this.add.sprite(400, 300, 'background').setScale(4, 3);
    this.add.sprite(400, 410, 'blob').setScale(1, 1);
    this.add.sprite(16, 20, 'burger').setScale(1, 1);
    this.add.sprite(16, 45, 'muffin').setScale(1, 1);
    this.add.sprite(16, 70, 'lollypop').setScale(1, 1);
    this.add.sprite(16, 95, 'cracker').setScale(1, 1);

    player = this.physics.add.sprite(100, 100, 'player').setScale(3, 3);
    player.setCollideWorldBounds(true);

    groundLayer = this.physics.add.staticGroup();
    groundLayer.create(400, 500, 'ground').setScale(3, 1).refreshBody();

    createPlatform(700, 230, 4);
    createPlatform(100, 230, 4);
    createPlatform(300, 380, 4);
    createPlatform(500, 380, 4);
    createPlatform(400, 100, 4);
    createPlatform(250, 150, 4);
    createPlatform(200, 300, 4);
    createPlatform(600, 300, 4);

    cursors = this.input.keyboard.createCursorKeys();

    foodItems = this.physics.add.group();

    this.physics.add.collider(player, groundLayer);
    this.physics.add.collider(foodItems, groundLayer);

    this.time.addEvent({
        delay: 2000,
        callback: spawnFoodItem,
        loop: true
    });

    BurgerScore = this.add.text(25, 15, ': 0', {
        fontSize: '16px',
        fill: '#000'
    });

    MuffinScore = this.add.text(25, 40, ': 0', {
        fontSize: '16px',
        fill: '#000'
    });

    LollypopScore = this.add.text(25, 65, ': 0', {
        fontSize: '16px',
        fill: '#000'
    });

    CrackerScore = this.add.text(25, 90, ': 0', {
        fontSize: '16px',
        fill: '#000'
    });

    Score = this.add.text(5, 110, 'Score: 0', {
        fontSize: '16px',
        fill: '#000'
    });

    Timer = this.add.text(5, 500, 'Time: 30', {
        fontSize: '16px',
        fill: '#000'
    });

    this.physics.add.overlap(player, foodItems, collectFoodItem, null, this);

    gameTimer = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        repeat: -1
        });
    }

function update() {
    player.setVelocityX(0);

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
    }

    if (cursors.up.isDown && player.body.onFloor()) {
        player.setVelocityY(-300);
    }

    checkTimeBoost();

}

function checkTimeBoost() {
    if (
        player.x >= blobster.x &&
        player.x <= blobster.x + blobster.width &&
        player.y >= blobster.y &&
        player.y <= blobster.y + blobster.height
    ) {
        time += burgers+muffins+lollypops+crackers;
        burgers = 0;
        muffins = 0;
        lollypops = 0;
        crackers = 0;
        LollypopScore.setText(':  ' + lollypops);
        CrackerScore.setText(':  ' + crackers);
        MuffinScore.setText(':  ' + muffins);
        BurgerScore.setText(':  ' + burgers);
        Timer.setText("Time: " + time);
    }
}

function updateTimer(){
    time -= 1;
    Timer.setText("Time: " + time);
    if(time <= 0){
        endScreen = this.add.text(250, 200, 'Blob starved', {
            fontSize: '32px',
            fill: '#000'
        });


        finalScoreText = this.add.text(250, 250, 'Final Score: ' + score, {
            fontSize: '32px',
            fill: '#000'
        });

        this.physics.pause();
    }
}

function createPlatform(x, y, scaleX) {
    groundLayer.create(x, y, 'platform').setScale(scaleX, 2).refreshBody();
}

function collectFoodItem(player, foodItem) {

    if(foodItem.texture.key == "burger"){
        score += 15;
        burgers += 1;
        BurgerScore.setText(':  ' + burgers);
    }
    else if(foodItem.texture.key == "muffin"){
        score += 25;
        muffins += 1;
        MuffinScore.setText(':  ' + muffins);
    }
    else if(foodItem.texture.key == "lollypop"){
        score += 20;
        lollypops += 1;
        LollypopScore.setText(':  ' + lollypops);
    }

    else if(foodItem.texture.key == "cracker"){
        score += 5;
        crackers += 1;
        CrackerScore.setText(':  ' + crackers);
    }

    foodItem.destroy();
    Score.setText('Score: ' + score);
}

function spawnFoodItem() {
    if (foodItems.countActive(true) < maxFoodItems) {
        var x = Phaser.Math.Between(100, 700);
        var foodItemKey = Phaser.Math.RND.pick(['burger', 'muffin', 'lollypop', 'cracker']);

        var foodItem = foodItems.create(x, 0, foodItemKey);
        foodItem.setVelocityY(Phaser.Math.Between(100, 200));
    }
}