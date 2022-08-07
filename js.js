const frameRate = 60;
const BS = 90;
const lineSize = 20;
const x = 10;
const y = 10;

let tab = new Array(y);
for (let i = 0; i < tab.length; i++) {
    tab[i] = new Array(x);
    for (let j = 0; j < x; j++) {
        tab[i][j] = -1;
    }
}

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
ctx.lineWidth = 1;

canvas.width  = BS * x;
canvas.height = BS * y;


let interval;

// 0 - pusty, 1 - góra, 2 - prawo, 3 - dół, 4 - lewo
let styki = [
    [0, 0, 0, 0],
    [1, 1, 0, 1],
    [1, 1, 1, 0],
    [0, 1, 1, 1],
    [1, 0, 1, 1]
]

class Block {
    constructor() {
        this.placed = false;
        this.block = -1;
        this.possibilities = [0, 1, 2, 3, 4];
    }
}

function initEmptyBlocks() {
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            tab[i][j] = new Block();
            //tab[i][j].block = randomIntFromInterval(0, 4);
        }
    }
}

function oneRandomBlock() {
    let randomY = randomIntFromInterval(0, y - 1);
    let randomX = randomIntFromInterval(0, x - 1);
    tab[randomY][randomX].block = randomIntFromInterval(1, 4);
    tab[randomY][randomX].placed = true;
}

function updateCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, x * BS, y * BS);
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            rysujKlocek(tab[i][j].block, j, i, tab[i][j].possibilities);
        }
    } 
}

function isFull() {
    full = true;
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            if (!tab[i][j].placed) {
                full = false;
                break;
            }
        }
    }
    return full;
}

let restart = false;
let minPossibilities = 5
function checkPossibilities() {
    minPossibilities = 5;
    restart = false;
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            if (!tab[i][j].placed && !restart) {
                if (tab[i][j].possibilities.length == 0) {
                    console.log("restart")
                    restart = true;
                }
                else {
                    let toDelete = []
                    let ok = true;
                    for(let pos = 0; pos < tab[i][j].possibilities.length; pos++) {
                        ok = true;

                        // góra
                        if (i != 0) {
                            if (tab[i - 1][j].placed) {
                                if(styki[tab[i][j].possibilities[pos]][0] != styki[tab[i - 1][j].block][2]) {
                                    ok = false;
                                }
                            }
                        }

                        // prawo
                        if (j != x - 1) {
                            if (tab[i][j + 1].placed) {
                                if(styki[tab[i][j].possibilities[pos]][1] != styki[tab[i][j + 1].block][3]) {
                                    ok = false;
                                }
                            }
                        }

                        // dół
                        if (i != y - 1) {
                            if (tab[i + 1][j].placed) {
                                if(styki[tab[i][j].possibilities[pos]][2] != styki[tab[i + 1][j].block][0]) {
                                    ok = false;
                                }
                            }
                        }

                        // lewo
                        if (j != 0) {
                            if (tab[i][j - 1].placed) {
                                if(styki[tab[i][j].possibilities[pos]][3] != styki[tab[i][j - 1].block][1]) {
                                    ok = false;
                                }
                            }
                        }

                        if (!ok) {
                            toDelete.push(tab[i][j].possibilities[pos])
                        }
                    }

                    if (toDelete.length > 0) {
                        console.log(toDelete.length);
                        tab[i][j].possibilities = tab[i][j].possibilities.filter(function(v) {
                            let del = false;
                            for (let k = 0; k < toDelete.length; k++) {
                                if (v === toDelete[k]) {
                                    del = true;
                                    break;
                                }
                            }
                            return !del;
                        })
                    }

                    //console.log(i, j, tab[i][j].possibilities);

                    if (tab[i][j].possibilities.length < minPossibilities) {
                        minPossibilities = tab[i][j].possibilities.length
                    }
                }
            }
        }
    }

    if (restart) {
        doRestart();
    }
}

function doMinPosRandom() {
    let done = false;
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            if (!tab[i][j].placed && done == false) {
                if (tab[i][j].possibilities.length == minPossibilities) {
                    tab[i][j].block = tab[i][j].possibilities[randomIntFromInterval(0, tab[i][j].possibilities.length - 1)];
                    tab[i][j].placed = true;
                    done = true;
                }
            }
        }
    }
}

function start() {
    initEmptyBlocks();
    oneRandomBlock();
    updateCanvas();
    checkPossibilities();
    updateCanvas();

    interval = setInterval(frame, 1000 / frameRate);
}

function doRestart() {
    initEmptyBlocks();
    oneRandomBlock();
    updateCanvas();
    checkPossibilities();
    updateCanvas();

    clearInterval(interval);
    interval = setInterval(frame, 1000 / frameRate);
}

function frame() {
    if (!isFull()) {       
        doMinPosRandom();
        checkPossibilities();
        updateCanvas();
    }
}

function rysujKlocek(jaki, x0, y0, pos) {
    if (jaki == 0) {
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(x0 * BS, y0 * BS, BS, BS);
    }
    else if (jaki > 0 && jaki < 5) {
        ctx.fillStyle = 'lightblue';
        ctx.fillRect(x0 * BS, y0 * BS, BS, BS);
        ctx.fillStyle = 'green';
        if (jaki != 3) ctx.fillRect(x0 * BS + BS * 0.5 - lineSize / 2, y0 * BS, lineSize, BS / 2);
        if (jaki != 4) ctx.fillRect(x0 * BS + BS * 0.5, y0 * BS + BS * 0.5 - lineSize / 2, BS / 2, lineSize);
        if (jaki != 1) ctx.fillRect(x0 * BS + BS * 0.5 - lineSize / 2, y0 * BS + BS * 0.5, lineSize, BS / 2);
        if (jaki != 2) ctx.fillRect(x0 * BS, y0 * BS + BS * 0.5 - lineSize / 2, BS / 2, lineSize);
    }
    else {
        ctx.font = "20px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText(pos.toString(), x0 * BS + 50, y0 * BS + 50);
    }
}

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

start();