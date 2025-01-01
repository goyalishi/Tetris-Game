
const Shapes = [
    [
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0],
        [0,1,0,0]
    ],
    [
        [0,1,0],  
        [0,1,0],  
        [1,1,0]   
    ],
    [
        [0,1,0],
        [0,1,0],
        [0,1,1]
    ],
    [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ],
    [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    [
        [1,1],
        [1,1],
    ]
]

const Colors = [
    "#fff",
    "#9b5fe0",
    "#16a4d8",
    "#60dbe8",
    "#8bd346",
    "#efdf48",
    "#f9a52c",
    "#d64e12"
]

const rotateSound = new Audio('rotate.wav');
const rowClearedSound = new Audio('rowClear.wav');
const rows=20;
const cols=12;

let canvas= document.getElementById("container");
let scoreBoard= document.getElementById("score");
let ctx= canvas.getContext("2d");

ctx.scale(25,25);

let peiceObj= null;
let intervalId=null;
let grid = generateGrid();
let score=0;
let isGameOver=false;

document.getElementById('playButton').addEventListener('click', startGame);
document.getElementById('resume').addEventListener('click', resumeGame);
document.getElementById('pause').addEventListener('click', pauseGame);
document.getElementById('restart').addEventListener('click', restartGame);
let finalScore = document.getElementById('final-score');
let overlay=document.getElementById('playButton');

function startGame() {
    document.getElementById('overlay').style.display = 'none';
    score = 0;
    grid = generateGrid();
    peiceObj = generateRandomPeice();
    intervalId = setInterval(newGameState, 500);
    isGameOver = false;
    document.getElementById('pause').style.display = 'none';
    document.getElementById('resume').style.display = 'inline';

}

function generateRandomPeice(){
    let index= Math.floor(Math.random()*Shapes.length);
    let peice= Shapes[index];
    let colorIdx= index+1;
    let x=4;
    let y=0;
    return {peice,x,y,colorIdx};
}

function newGameState(){
    if (isGameOver || isPaused) return;
    checkGrid(); // to check if any row is full
    if(peiceObj===null){
        peiceObj= generateRandomPeice();
        renderPeice();
    }
    moveDown();
}

function checkGrid(){
    let rowsCleared=0;
    for(let i=0;i<grid.length;i++){
        let allFilled=true;
        for(let j=0;j<grid[i].length;j++){
            if(grid[i][j]===0){
                allFilled=false;
                break;
            }
        }
        if(allFilled){
            grid.splice(i,1);
            grid.unshift(new Array(cols).fill(0));
            rowsCleared++;
        }
    }

    if(rowsCleared>0){
        rowClearedSound.play();
    }

        if(rowsCleared==1){
            score+=10;
        }
        else if(rowsCleared==2){   
            score+=30;
        }
        else if(rowsCleared==3){
            score+=60;
        }
        else if(rowsCleared>=4){
            score+=100;
        }
        scoreBoard.innerText="Score: "+score;
    
}


function renderPeice(){
    let {peice, x, y, colorIdx} = peiceObj;

    for(let i=0; i<peice.length; i++){
        for(let j=0; j<peice[i].length; j++){
            if(peice[i][j]===1){
                ctx.fillStyle= Colors[colorIdx];
                ctx.fillRect(x+j, y+i, 1, 1);
               
            }
        }
    }
}



function moveDown(){
    if(!checkCollision(peiceObj.x, peiceObj.y+1))
        peiceObj.y++;
    else{
        for(let i=0;i<peiceObj.peice.length; i++){
            for(let j=0;j<peiceObj.peice[i].length;j++){
                if(peiceObj.peice[i][j]==1){
                    grid[peiceObj.y+i][peiceObj.x+j]=peiceObj.colorIdx;
                }
            }
        }
        if(peiceObj.y===0){
            gameOver();
        }    
        peiceObj=null;
       
        
    }
    renderGrid();
    
}

function moveLeft(){
    if(!checkCollision(peiceObj.x-1, peiceObj.y))
        peiceObj.x--;
    renderGrid();
}

function moveRight(){
    if(!checkCollision(peiceObj.x+1, peiceObj.y))
        peiceObj.x++;
    renderGrid();
}

function rotate(){
    let {peice} = peiceObj;
    rotatedPeice=[];
    for(let i = 0; i < peice.length; i++){
        rotatedPeice.push([]);
        for(let j = 0; j < peice[i].length; j++){
            rotatedPeice[i].push(0);
            rotatedPeice[i][j] = peice[j][peice.length - 1 - i];
        }
    }

    if(!checkCollision(peiceObj.x, peiceObj.y,rotatedPeice))
        peiceObj.peice= rotatedPeice;
        rotateSound.play();
    renderGrid();


}

function checkCollision(x, y,rotatedPeice){
    let  peice = rotatedPeice || peiceObj.peice;
    
    for(let i=0;i<peice.length; i++){
        for(let j=0;j<peice[i].length;j++){
            if(peice[i][j]==1){
                if(x+j<0 || x+j>=cols || y+i>=rows || grid[y+i][x+j]!==0){
                    return true;
                }
            }
        }
    }
    return false;
}

function generateGrid(){
    let grid=[];
    for(let i=0; i<rows; i++){
        grid.push([]);
        for(let j=0; j<cols; j++){
            grid[i][j]=0;
        }
    }
    return grid;
}

function renderGrid(){
    for(let i=0; i<rows; i++){
        for(let j=0; j<cols; j++){
                ctx.fillStyle= Colors[grid[i][j]];
                ctx.fillRect(j, i, 1, 1);
            }
        }
        renderPeice();
    }

    document.addEventListener("keydown", function(event){
        let key=event.code;
        
        if(key==="ArrowDown")
            moveDown();
        else if(key==="ArrowLeft")
            moveLeft();
        else if(key==="ArrowRight")
            moveRight();
        else if(key==="ArrowUp")
            rotate();
        
    });

    function gameOver() {
        clearInterval(intervalId);
        isGameOver = true;
        document.getElementById('overlay').style.display = 'flex';
        finalScore.innerText="Final Score: " + score;
        document.getElementById('playButton').innerText = 'Play Again';
        score=0;
    }

    function pauseGame() {
        isPaused = true;
        clearInterval(intervalId);
        document.getElementById('pause').style.display = 'none';
        document.getElementById('resume').style.display = 'inline';
    }
    
    function resumeGame() {
        isPaused = false;
        intervalId = setInterval(newGameState, 500);
        document.getElementById('resume').style.display = 'none';
        document.getElementById('pause').style.display = 'inline';
    }
  
    function restartGame() {
        clearInterval(intervalId);
        startGame();
    }