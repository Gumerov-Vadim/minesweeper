
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

// TODO:
// добавить проверку на победу
// для этого после каждого клика нужно проверять состояние всех квадратов
// если все активированы кроме мин = победа

const minesweeperModel = {
    selectedDifficultyLevel: gameDifficultyLevelNames.BEGINNER,
    field: [],
    minesCounter: 0,
    timer: null,
};

function Timer(){
    const savedThis = this;
    this.interval = setInterval(()=>{savedThis.updateTimer()},1000);
    this.start = Date.now();
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
    this.restartTimer = function(){
        this.start = Date.now();
        this.interval = setInterval(()=>{savedThis.updateTimer()},1000);    
    };
    this.stopTimer = function(){
        clearInterval(this.interval);
    }
}

function getSquareElement(x,y){
    return document.querySelector(`[coordinatex="${x}"][coordinatey="${y}"]`);
}
const gameController = {
    squareActivateHandler: function(x,y){
        if(!minesweeperModel.timer) {
            minesweeperModel.timer = new Timer();
        }

        const square = getSquareElement(x,y);
        if(minesweeperModel.field[x][y].state === mineStates.ACTIVATED || minesweeperModel.field[x][y].state === mineStates.FLAGGED) return false;

        if(+minesweeperModel.field[x][y] === 9){
            this.finishGame(false);
            return false;
        } 

        this.showSquare(x,y);

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
    finishGame: function(isWin){
        if(isWin){
            console.log("win");
        } else {
            console.log("lose");
        }
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
initGame();
renderField();