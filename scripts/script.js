
const gameDifficultyLevelNames = {
    BEGINNER: "BEGINNER",
    AMATEUR: "AMATEUR",
    PROFESSIONAL: "PROFESSIONAL",
    SUPERHUMAN: "SUPERHUMAN", 
    CUSTOM: "CUSTOM",
}
const minesweeperModel = {
    selectedDifficultyLevel: gameDifficultyLevelNames.PROFESSIONAL,
    field: [],

};
const gameDifficultyLevels = {
    //game difficulty : [collums, rows, mines]
    BEGINNER: [9,9,10],
    AMATEUR: [16,16,40],
    PROFESSIONAL: [30,16,99],
    SUPERHUMAN: [50,50,500], 
    CUSTOM: [100,100,1000],
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
            if(isMineHere(x + 1, y)) ++count;
            if(isMineHere(x, y + 1)) ++count;
            if(isMineHere(x - 1, y)) ++count;
            if(isMineHere(x, y - 1)) ++count;
            if(isMineHere(x + 1, y + 1)) ++count;
            if(isMineHere(x - 1, y - 1)) ++count;
            if(isMineHere(x + 1, y - 1)) ++count;
            if(isMineHere(x - 1, y + 1)) ++count;
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