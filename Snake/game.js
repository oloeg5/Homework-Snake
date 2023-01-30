class Score{
  constructor(scoreBlock, score = 0, bestScoreBlock, bestScore = 0){
    this.scoreBlock = document.querySelector(scoreBlock);
    this.score = score;
    this.bestScoreBlock = document.querySelector(bestScoreBlock);
    this.bestScore;
    this.draw();
  }

  incScore(){
    this.score++;
    this.draw();
  }
  
  setToZero(){
    this.score = 0;
    this.draw();
  }

  intBestScore() {
    if(this.score > Number(localStorage.getItem('bestScore'))){
      this.bestScore = this.score;
      localStorage.setItem('bestScore', this.bestScore.toString());
    }
    
    this.draw();
  }

  draw(){
    this.scoreBlock.innerHTML = this.score;
    this.bestScoreBlock.innerHTML = localStorage.getItem('bestScore');;
  }
}

class Berry{
  constructor(canvas){
    this.x = 0;
    this.y = 0;
    this.canvas = canvas;
    this.config = new Config();
    this.randomPosition();
  }

  draw(context){
    context.beginPath();
	  context.fillStyle = "#008000";
	  context.arc( this.x + (this.config.sizeCell / 2 ), this.y + (this.config.sizeCell / 2 ), this.config.sizeBerry, 0, 2 * Math.PI );
	  context.fill();
  }

  randomPosition() {
    this.x = getRandomInt( 0, this.canvas.element.width / this.config.sizeCell ) * this.config.sizeCell;
    this.y = getRandomInt( 0, this.canvas.element.height / this.config.sizeCell ) * this.config.sizeCell;
  }
}

class Snake{
  constructor(){
    this.config = new Config();
    this.x = 160,
	  this.y = 160,
	  this.dx = this.config.sizeCell,
	  this.dy = 0,
	  this.tails = [],
    this.maxTails = 2;
    this.control();
  }
  
  update(berry, score, canvas){
    this.x += this.dx;
    this.y += this.dy;

    score.intBestScore();

    if (this.x < 0 || this.x >= canvas.element.width || this.y < 0 || this.y >= canvas.element.height){
      this.death();
      score.setToZero();
    } 
  
    this.tails.unshift({ x: this.x, y: this.y });
  
    if ( this.tails.length > this.maxTails ) {
      this.tails.pop();
    }
    
    this.tails.forEach((el, index) =>{
      if ( el.x === berry.x && el.y === berry.y ) {
        this.maxTails++;
        this.config.maxStep -= 5;
        score.incScore();
        berry.randomPosition();
      }
  
      for( let i = index + 1; i < this.tails.length; i++ ) {
  
        if ( el.x == this.tails[i].x && el.y == this.tails[i].y ) {
          this.death();
          score.setToZero();
          berry.randomPosition();
        }
      }
    });
  }

  draw(context){
    this.tails.forEach((el, index) =>{
		  if (index == 0) {
			  context.fillStyle = "#00FF00";
		  } else {
			  context.fillStyle = "#008000";
		  }
		
      context.fillRect( el.x, el.y, this.config.sizeCell, this.config.sizeCell );
	  });
  }

  death(){
    this.x = 160,
	  this.y = 160,
	  this.dx = this.config.sizeCell,
	  this.dy = 0,
	  this.tails = [],
    this.maxTails = 2;
  }

  control(){
    let dir; 

    document.addEventListener("keydown",(event) => {
      if ( event.keyCode == 38 && dir !== "down") {
        this.dy = -this.config.sizeCell;
        this.dx = 0;
        dir = "up";
      } else if ( event.keyCode == 37 && dir !== "right") {
        this.dx = -this.config.sizeCell;
        this.dy = 0;
        dir = "left";
      } else if ( event.keyCode == 40 && dir !== "up") {
        this.dy = this.config.sizeCell;
        this.dx = 0;
        dir = "down";
      } else if ( event.keyCode == 39 && dir !== "left") {
        this.dx = this.config.sizeCell;
        this.dy = 0;
        dir = "right";
      }
    });
  }
}

function getRandomInt(min, max) {
	return Math.floor( Math.random() * (max - min) + min );
}

class GameLoop {
  constructor(update, draw){
    this.update = update;
    this.draw = draw;

    this.config = new Config();

    this.animate = this.animate.bind(this);
    this.animate();
  }

  animate(){
    requestAnimationFrame(this.animate);
      if ( ++this.config.step < this.config.maxStep) {
        return;
      }
      this.config.step = 0;
      
      this.update();
      this.draw();
  }
}
class Config{
  constructor(){
    this.step = 0,
	  this.maxStep = 16,
	  this.sizeCell = 16,
	  this.sizeBerry = this.sizeCell / 4;
  }
} 

class Canvas {
  constructor(container){
    this.element = document.createElement("canvas");
    this.context = this.element.getContext("2d");
    this.element.width = 400;
    this.element.height = 400;

    container.appendChild(this.element);
  }
}

class Game {
  constructor(container){
    this.canvas = new Canvas( container);
    this.snake = new Snake();
    this.berry = new Berry(this.canvas);
    this.score = new Score(".game-score .score-count", 0, ".best-score", 0);
    new GameLoop(this.update.bind(this), this.draw.bind(this));
  }

  update(){
    this.snake.update(this.berry, this.score, this.canvas);
  }

  draw(){
    this.canvas.context.clearRect(0, 0, this.canvas.element.width, this.canvas.element.height);

    this.snake.draw(this.canvas.context);
    this.berry.draw(this.canvas.context);
  }
}

new Game(document.querySelector(".canvas-wrapper"));