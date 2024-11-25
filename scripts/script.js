
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

const minesweeperModel = {
    selectedDifficultyLevel: gameDifficultyLevelNames.PROFESSIONAL,
    field: [],
};
function getSquareElement(x,y){
    return document.querySelector(`[coordinatex="${x}"][coordinatey="${y}"]`);
}
const gameController = {
    squareActivateHandler: function(x,y){
        const square = getSquareElement(x,y);
        if(square.classList.contains("activated-square")) return false;

        if(minesweeperModel.field[x][y] === 9){
            this.finishGame(false);
            return false;
        } 

        this.showSquare(x,y);

        if(minesweeperModel.field[x][y] === 0){
            getNearestSquareCoordinates(x,y).filter(square => minesweeperModel.field[square[0]] != null && minesweeperModel.field[square[0]][square[1]] != null).forEach(squareCoordinate=>this.squareActivateHandler(...squareCoordinate)) 
            // setTimeout(()=>{
            // },100);
        }
    },
    showSquare: function(x,y){
        const square = getSquareElement(x,y);
        square.innerHTML = minesweeperModel.field[x][y] === 0 ? "" : minesweeperModel.field[x][y];
        square.style.color = numberColors[minesweeperModel.field[x][y]];
        square.classList.remove("non-activated-square");
        square.classList.add("activated-square");
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
            if(isMineHere(x,y)){
            minesweeperModel.field[x][y] = 9; // 9 = mine
            continue;
            }
            minesweeperModel.field[x][y] = getCountMinesAround(x,y);
        }
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
}
initGame();
renderField();