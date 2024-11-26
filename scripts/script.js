
const gameDifficultyLevelNames = {
    BEGINNER: "BEGINNER",
    AMATEUR: "AMATEUR",
    PROFESSIONAL: "PROFESSIONAL",
    SUPERHUMAN: "SUPERHUMAN", 
    CUSTOM: "CUSTOM",
}

const gameDifficultyLevels = {
    //game difficulty : [collums, rows, mines]
    BEGINNER: [9,9,10],
    AMATEUR: [16,16,40],
    PROFESSIONAL: [30,16,99],
    SUPERHUMAN: [50,50,500], 
    CUSTOM: [100,100,1000],
}

const numberColors = {
    0: "#FFFFFF",
    1: "#1E90FF",
    2: "#9ACD32",
    3: "#FF0000",
    4: "#0000FF",
    5: "#B22222",
    6: "#00FA9A",
    7: "#4B0082",
    8: "#5F9EA0",
}

const mineStates = {
    NON_ACTIVE: "non-active",
    ACTIVATED: "activated",
    FLAGGED: "flagged",
    INQUESTION: "inquestion",
}

function Timer(){
    const savedThis = this;
    this.getCurrentTime = function(){
        const date = new Date(Date.now() - savedThis.start);
        return {
            min: date.getMinutes(),
            sec: date.getSeconds(),
        }
    };
    this.updateTimer = function(){
        const timerElement = document.getElementById("timer");
        const time = this.getCurrentTime();
        timerElement.innerHTML = `${time.min}:${time.sec < 10 ? "0" + time.sec : time.sec}`;
    };
    this.resetTimer = function(){
        this.stopTimer();
        this.interval = null;
        this.start = Date.now();
    };
    this.restartTimer = function(){
        this.start = Date.now();
        this.interval = setInterval(()=>{savedThis.updateTimer()},1000);    
    };
    this.stopTimer = function(){
        clearInterval(this.interval);
    };
    this.isStarted = function(){
        return this.interval != null;
    }
}

const minesweeperModel = {
    selectedDifficultyLevel: gameDifficultyLevelNames.BEGINNER,
    field: [],
    minesCounter: 0,
    timer: new Timer(),
};

function getSquareElement(x,y){
    return document.querySelector(`[coordinatex="${x}"][coordinatey="${y}"]`);
}
const gameController = {
    squareActivateHandler: function(x,y){
        if(!minesweeperModel.timer.isStarted()) {
            minesweeperModel.timer.restartTimer();
        }

        const square = getSquareElement(x,y);
        if(minesweeperModel.field[x][y].state === mineStates.ACTIVATED || minesweeperModel.field[x][y].state === mineStates.FLAGGED) return false;

        if(+minesweeperModel.field[x][y] === 9){
            this.finishGame(false);
            return false;
        } 

        this.showSquare(x,y);

        if(this.isWinCondition()){
            this.finishGame(true);
        }

        if(+minesweeperModel.field[x][y] === 0){
            setTimeout(()=>{
                getNearestSquareCoordinates(x,y).filter(square => minesweeperModel.field[square[0]] != null && minesweeperModel.field[square[0]][square[1]] != null).forEach(squareCoordinate=>this.squareActivateHandler(...squareCoordinate)) 
            },25);
        }
        
        return true;
    },
    showSquare: function(x,y){
        const square = getSquareElement(x,y);
        const mineField = minesweeperModel.field[x][y];
        
        square.innerHTML = +mineField === 0 ? "" : +mineField;
        square.style.color = numberColors[+mineField];
        square.style.backgroundImage = 'none';
        square.classList.remove("non-activated-square");
        square.classList.add("activated-square");

        mineField.state = mineStates.ACTIVATED;
    },
    switchState: function(x,y){
        const mineField = minesweeperModel.field[x][y];
        // if(mineField.state === mineStates.ACTIVATED) return false;
        
        const square = getSquareElement(x,y);
        switch(mineField.state){
            case mineStates.ACTIVATED:
                return false;
            case mineStates.FLAGGED:
                mineField.state = mineStates.INQUESTION;
                square.style.backgroundImage = `url(images/question.png)`;
                this.increaseMinesCounter();
                return true;
            case mineStates.INQUESTION:
                mineField.state = mineStates.NON_ACTIVE;
                square.style.backgroundImage = `none`;
                return true;
            case mineStates.NON_ACTIVE:
                mineField.state = mineStates.FLAGGED;
                square.style.backgroundImage = `url(images/flag.png)`;
                this.decreaseMinesCounter();
                return true;
        }
        
    },
    increaseMinesCounter: function(x,y){
        document.querySelector("#mines-left span").innerHTML = ++minesweeperModel.minesCounter;
    },
    decreaseMinesCounter: function(x,y){
        document.querySelector("#mines-left span").innerHTML = --minesweeperModel.minesCounter;
    },
    isWinCondition: function(){
        return minesweeperModel.field.every(row => row.every(s => s.state === mineStates.ACTIVATED && +s !== 9 || s.state !== mineStates.ACTIVATED && +s ===9));
    },
    finishGame: function(isWin){
        
        const squareElements = document.getElementsByClassName("square");

        function goodFinishScene(){

        }
        
        function badFinishScene(){
            const squaresWithMine = Array.from(squareElements).filter(se =>{
                const x = +se.getAttribute("coordinatex");
                const y = +se.getAttribute("coordinatey");
                return +minesweeperModel.field[x][y] === 9;
            });
            
            const squaresWithWrongFlags = Array.from(squareElements).filter(se =>{
                const x = +se.getAttribute("coordinatex");
                const y = +se.getAttribute("coordinatey");
                return +minesweeperModel.field[x][y] !== 9 && minesweeperModel.field[x][y].state === mineStates.FLAGGED;
            });

            squaresWithWrongFlags.forEach(el=>{
                const wrongFlagIMG = document.createElement("img");
                wrongFlagIMG.src = "images/cross-mark.png";
                wrongFlagIMG.classList.add("mine");
                wrongFlagIMG.draggable = false;
                wrongFlagIMG.style.opacity = 0.5;
                el.appendChild(wrongFlagIMG);
            });

            squaresWithMine.forEach(el=>{
                const mineIMG = document.createElement("img");
                mineIMG.src = "images/mine.png";
                mineIMG.classList.add("mine");
                mineIMG.draggable = false;
                el.appendChild(mineIMG);
            });

            squaresWithMine.forEach(el=>{
                const delay = Math.random()*1000;
                
                setTimeout(()=>{

                    const explosionEffect = document.createElement("img");
                    explosionEffect.src = "images/explosion.gif?" + new Date().getTime();;
                    explosionEffect.classList.add("explosion");
                    explosionEffect.draggable = false;
                    el.appendChild(explosionEffect);
                    
                    const soundEffect = document.createElement("audio");
                    soundEffect.autoplay = true;
                    soundEffect.src = "sounds/explosion.mp3";
                    el.appendChild(soundEffect);

                setTimeout(()=>{
                    el.removeChild(explosionEffect)
                    el.removeChild(soundEffect);
                },1000);
                
            },delay);
            })

        }

        if(isWin){
            console.log("win");
        } else {
            console.log("lose");
            badFinishScene();
        }
        
        for(let squareElement of squareElements){
            squareElement.removeEventListener('contextmenu',rightClickHandler);
            squareElement.removeEventListener('click',leftClickHandler);
        }

        minesweeperModel.timer.stopTimer();
    }
}
function getNearestSquareCoordinates(x,y){
    return [
        [x + 1, y],
        [x, y + 1],
        [x - 1, y],
        [x, y - 1],
        [x + 1, y + 1],
        [x - 1, y - 1],
        [x + 1, y - 1],
        [x - 1, y + 1],
    ]
}

function initGame(){
    function createField(collums, rows, mines){
        const squaresCount = collums * rows;
        let minesSquares = [];
        while(minesSquares.length < mines){
            const mineSquare = Math.floor(Math.random()*squaresCount)
            if(!minesSquares.includes(mineSquare)) minesSquares.push(mineSquare);
        }
        minesSquares = minesSquares.map(el=>[el%rows,Math.floor(el/rows)]);
        
        minesweeperModel.field = []
        for(let i = 0; i < rows; i++){
            minesweeperModel.field.push([]);            
        }

        function isMineHere(x,y){
            return minesSquares.some(el=>el[0] === x && el[1] === y);
        }

        function getCountMinesAround(x,y){
            let count = 0;
            const nearestSquares = getNearestSquareCoordinates(x,y);
            nearestSquares.forEach(squareCoordinate => {
                if(isMineHere(...squareCoordinate)) ++count;
            });
            
            return count;
        }

        for(let i = 0; i < squaresCount; i++){
            const y = Math.floor(i/rows);
            const x = i%rows;
            minesweeperModel.field[x][y] = {
                value: isMineHere(x,y) ? 9 : minesweeperModel.field[x][y] = getCountMinesAround(x,y), // 9 = mine 
                state: mineStates.NON_ACTIVE,
                [Symbol.toPrimitive](hint){
                    switch(hint){
                        case "number":
                            return this.value;
                        case "string":
                            return this.state;
                        default:
                            return Error("Symbol to primitive");
                    }
                }
            };
        }
        minesweeperModel.minesCounter = gameDifficultyLevels[minesweeperModel.selectedDifficultyLevel][2];
        return minesweeperModel.field;
    }
    return createField(...gameDifficultyLevels[minesweeperModel.selectedDifficultyLevel]);
}

function leftClickHandler(e){
    const x = +e.srcElement.getAttribute("coordinatex");
    const y = +e.srcElement.getAttribute("coordinatey");
    gameController.squareActivateHandler(x,y);
}

function rightClickHandler(e){
    e.preventDefault();
    const x = +e.srcElement.getAttribute("coordinatex");
    const y = +e.srcElement.getAttribute("coordinatey");
    gameController.switchState(x,y);
}

function renderField(){
    const minesweeperField = document.getElementById("minesweeper-field");
    const rows = minesweeperModel.field.length;
    const collums = minesweeperModel.field[0].length;
    
    const mfHdR = (document.getElementById("background").clientHeight-250)/rows;
    const mfWdC = (document.getElementById("background").clientWidth-250)/collums;
    
    const squareSide = mfHdR < mfWdC ? mfHdR : mfWdC;
    
    minesweeperField.style.width = collums*(2+squareSide) + "px";
    minesweeperField.style.height = rows*(2+squareSide) + "px";
    
    for(let i = 0; i < rows; i++){
        for(let j = 0; j < collums; j++){
            const square = document.createElement("div");
            square.setAttribute("coordinateX",`${i}`);
            square.setAttribute("coordinateY",`${j}`);
            
            square.classList.add("square");
            square.classList.add("non-activated-square");

            square.style.height = square.style.width = squareSide +"px";

            square.addEventListener('click',leftClickHandler);
            square.addEventListener('contextmenu',rightClickHandler);

            minesweeperField.appendChild(square);
        }
    }
    document.querySelector("#mines-left span").innerHTML = minesweeperModel.minesCounter;
}

function reset(){
    initGame();
    document.getElementById("minesweeper-field").innerHTML = "";
    renderField();
    minesweeperModel.timer.resetTimer();
    minesweeperModel.timer.updateTimer();
}
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener('click',reset);

initGame();
renderField();