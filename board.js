/*eslint-env browser*/

var canvas, context;
var rules;
var rowValues;
var currentRow = -1;
var timer = 0;
var cellsPerRow;
var isPaused = true;
var rulesTable;
var presSquareSize = 50;
var chartCount = 0;

// new vars
var roomValues;
var squareSize = 50;  // TODO based on user choice
var doorRow;
var doorCol;
var personTable;

var rows;
var cols;

window.onload = function() {
    canvas = document.getElementById("board");
    context = canvas.getContext("2d");
    // initColorAgenda();
    initStrokeOfBoard();
    initRulesMap();
    // initRulesTable();
    initChart();

    initRoom();
    initPersons();
};

function initRoom() {
    initRoomValues();
    insertObstacles();
    insertDoor();
    paintRoomSquares();
}

function initRoomValues() {
    rows = 600 / squareSize;
    cols = 1200 / squareSize;
    roomValues = new Array(rows);

    for (let i = 0; i < rows; i++) {
        roomValues[i] = new Array(cols);
    }

    doorRow = (600 / squareSize) / 2;
    doorCol = (1200 / squareSize) - 1;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (row === 0 || row === rows -1 || col === 0 || col === cols - 1) {
                roomValues[row][col] = -1;
            } else {
                roomValues[row][col] = getDistanceToDoor(row, col);
            }
        }
    }
}

function getDistanceToDoor(row, col) {
    return Math.sqrt(Math.pow(doorRow - row, 2) + Math.pow(doorCol - col, 2));
}

function insertObstacles() {
    for (let i = 0; i < 25; i++) {
        let row = getRandomInt(rows - 2) + 1;
        let col = getRandomInt(cols - 2) + 1;
        insertSingleObstacle(row, col);
    }

    for (let i = 0; i < 25; i++) {
        if (getRandomInt(2) === 0) {
            insertVerticalObstacle();
        } else {
            insertHorizontalObstacle();
        }
    }
}

function insertSingleObstacle(obRow, obCol) {
    for (let row = obRow - 1; row <= obRow + 1; row++) {
        for (let col = obCol - 1; col <= obCol + 1; col++) {
            if (roomValues[row][col] !== 0 && roomValues[row][col] !== -1) {
                roomValues[row][col] = getDistanceToDoor(row, col);
            }
        }
    }
    roomValues[obRow][obCol] = -2;
}

function insertVerticalObstacle() {
    let obRow = getRandomInt(rows - 3) + 1;
    let obCol = getRandomInt(cols - 2) + 1;

    for (let row = obRow - 1; row <= obRow + 2; row++) {
        for (let col = obCol - 1; col <= obCol + 1; col++) {
            if (roomValues[row][col] !== 0 && roomValues[row][col] !== -1) {
                roomValues[row][col] = getDistanceToDoor(row, col);
            }
        }
    }
    roomValues[obRow][obCol] = -2;
    roomValues[obRow + 1][obCol] = -2;
}

function insertHorizontalObstacle() {
    let obRow = getRandomInt(rows - 2) + 1;
    let obCol = getRandomInt(cols - 3) + 1;

    for (let row = obRow - 1; row <= obRow + 1; row++) {
        for (let col = obCol - 1; col <= obCol + 2; col++) {
            if (roomValues[row][col] !== 0 && roomValues[row][col] !== -1) {
                roomValues[row][col] = getDistanceToDoor(row, col);
            }
        }
    }
    roomValues[obRow][obCol] = -2;
    roomValues[obRow][obCol + 1] = -2;
}

function insertDoor() {
    roomValues[doorRow][doorCol] = 0;
}

function paintRoomSquares() {
    for (let row = 0; row < 600 / squareSize; row++) {
        for (let col = 0; col < 1200 / squareSize; col++) {
            let rectValue = roomValues[row][col];
            context.fillStyle = getRectColor(rectValue);
            let xOffset = col * squareSize;
            let yOffset = row * squareSize;
            context.fillRect(xOffset, yOffset, squareSize, squareSize);
            context.strokeRect(xOffset, yOffset, squareSize, squareSize);
        }
    }
}

function getRectColor(rectValue) {
    if (rectValue === -1) {
        return "#231f20";
    } else if (rectValue === -2) {
        return "#ff0000";
    } else {
        return "#ffffff";
    }
}

function initPersons() {
    personTable = [];    // TODO length choosed by user
    let freePositions = getFreePositions();
    let numberOfPersons = Math.min(5, freePositions.length);   // TODO choosed by user

    for (let i = 0; i < numberOfPersons; i++) {
        let index = getRandomInt(freePositions.length);
        let pos = freePositions[index];
        freePositions.splice(index, 1);
        let person = {col: pos.col, row: pos.row, color: getRandomColor()};
        personTable.push(person);
    }
    updatePersons();
}

function getFreePositions() {
    let freePositions = [];
    for (let row = 1; row < rows - 1; row++) {
        for (let col = 1; col < cols - 1; col++) {
            if (roomValues[row][col] !== -2) {
                freePositions.push({row: row, col: col});
            }
        }
    }
    return freePositions;
}

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function updatePersons() {
    paintRoomSquares();
    for (let i = 0; i < personTable.length; i++) {
        let row = personTable[i].row;
        let col = personTable[i].col;
        context.fillStyle = personTable[i].color;
        let xOffset = col * squareSize;
        let yOffset = row * squareSize;
        context.fillRect(xOffset, yOffset, squareSize, squareSize);
        context.strokeRect(xOffset, yOffset, squareSize, squareSize);
    }
}

function step() {
    calculatePersonsNewPositions();
    updatePersons();

    // updateChart();
    if (!isPaused) {
        timer = setTimeout(step, 500);
    }
}

function calculatePersonsNewPositions() {
    for (let i = 0; i < personTable.length; i++) {
        let pRow = personTable[i].row;
        let pCol = personTable[i].col;
        if (roomValues[pRow][pCol] === 0) {
            personTable.splice(i, 1);
            continue;
        }
        let newPos = findNearestPosition(pRow, pCol);
        personTable[i].row = newPos.row;
        personTable[i].col = newPos.col;
    }
}

function findNearestPosition(pRow, pCol) {
    let minRow = Math.max(pRow - 1, 0);
    let maxRow = Math.min(pRow + 1, rows - 1);

    let minCol = Math.max(pCol - 1, 0);
    let maxCol = Math.min(pCol + 1, cols - 1);

    let minValue = 100000;
    let minPos = {col: 0, row: 0};
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            let posValue = roomValues[row][col];
            if (posValue < minValue && posValue >= 0) {
                minValue = posValue;
                minPos = {col, row};
            }
        }
    }
    return minPos;
}

// ### start button ###
function start() {
    if (isPaused && document.getElementById('cellsPerRow').value !== '') {
        cellsPerRow = document.getElementById('cellsPerRow').value;
        if (rowValues == null) {
            initRowValues();
        }
        timer = setTimeout(step, 500);
        isPaused = false;
    }
}

// ######## OLD ###############

function initColorAgenda() {
    for (let i = 0; i < 3; i++) {
        let agendaCanvas = document.getElementById('board' + i);
        let agendaContext = agendaCanvas.getContext('2d');

        agendaContext.fillStyle = getColorForValue(i);
        agendaContext.fillRect(0, 0, presSquareSize, presSquareSize);
        agendaContext.strokeRect(0, 0, presSquareSize, presSquareSize);
    }
}

function initStrokeOfBoard() {
    context.strokeRect(0, 0, canvas.width, canvas.height);
}

function initRulesTable() {
    let parent = document.getElementById('rules-table');
    while(parent.hasChildNodes()) {
        parent.removeChild(parent.firstChild);
    }
    rulesTable = document.createElement('tbody');
    parent.appendChild(rulesTable);

    let arr = Array.from(rules.keys());
    for (let i = 0; i < 27; i++) {
        addRuleRow(arr[i], i);
    }
}

function addRuleRow(ruleStr, i) {
    let lastRow;
    if (i % 3 === 0) {
        lastRow = rulesTable.insertRow(rulesTable.rows.length);
    } else {
        lastRow = rulesTable.rows[rulesTable.rows.length - 1];
    }

    let labelCell = lastRow.insertCell();
    let ruleNumber = document.createTextNode(ruleStr);
    labelCell.appendChild(ruleNumber);

    let canvasCell = lastRow.insertCell();
    let ruleCanvas = document.createElement('canvas');
    ruleCanvas.width = 200;  // default 302.4
    ruleCanvas.height = 150;  // default 302.4
    let canvasContext = ruleCanvas.getContext("2d");
    for (let i = 0; i < 3; i++) {
        canvasContext.fillStyle = getColorForValue(parseInt(ruleStr[i]));
        canvasContext.fillRect(i * presSquareSize, 0, presSquareSize, presSquareSize);
        canvasContext.strokeRect(i * presSquareSize, 0, presSquareSize, presSquareSize);   // draw the border around the cell
    }

    let ruleResult = rules.get(ruleStr);
    canvasContext.fillStyle = getColorForValue(ruleResult);
    canvasContext.fillRect(presSquareSize, presSquareSize, presSquareSize, presSquareSize);
    canvasContext.strokeRect(presSquareSize, presSquareSize, presSquareSize, presSquareSize);  // draw the border around the cell

    ruleCanvas.id = 'canvas' + i;
    canvasCell.appendChild(ruleCanvas);

    let ruleForm = document.createElement('form');
    let ruleSelect = document.createElement('select');
    let ruleOption0 = document.createElement('option');
    ruleOption0.innerHTML = '0';
    let ruleOption1 = document.createElement('option');
    ruleOption1.innerHTML = '1';
    let ruleOption2 = document.createElement('option');
    ruleOption2.innerHTML = '2';

    ruleSelect.appendChild(ruleOption0);
    ruleSelect.appendChild(ruleOption1);
    ruleSelect.appendChild(ruleOption2);
    ruleSelect.onchange = () => changeRuleCanvasResult(ruleCanvas.id, i, ruleSelect.selectedIndex);
    ruleForm.appendChild(ruleSelect);
    labelCell.appendChild(ruleForm);
    ruleSelect.selectedIndex = ruleResult;
}

function changeRuleCanvasResult(canvasId, ruleNumber, newResultValue) {
    let ruleStr = decimalToTrinary(ruleNumber);
    let ruleCanvas = document.getElementById(canvasId);
    let canvasContext = ruleCanvas.getContext("2d");

    rules.set(ruleStr, newResultValue);
    canvasContext.fillStyle = getColorForValue(newResultValue);
    canvasContext.fillRect(presSquareSize, presSquareSize, presSquareSize, presSquareSize);
    canvasContext.strokeRect(presSquareSize, presSquareSize, presSquareSize, presSquareSize);
}

function initChart() {
    let traceRed = {
        y: [0],
        mode: 'lines',
        name: 'Red',
        line: {
            color: 'rgb(209, 46, 81)',
            width: 5
        }
    };

    let traceGreen = {
        y: [0],
        mode: 'lines',
        name: 'Green',
        line: {
            color: 'rgb(219, 196, 48)',
            width: 5
        }
    };

    let traceBlue = {
        y: [0],
        mode: 'lines',
        name: 'Blue',
        line: {
            color: 'rgb(47, 133, 209)',
            width: 5
        }
    };

    let data = [traceRed, traceGreen, traceBlue];
    let layout = {
        title: 'Quantity of each color in row'
    };
    Plotly.newPlot('chart', data, layout);
}

function initRowValues() {
    rowValues = [];
    for (let i = 0; i < cellsPerRow; i++) {
        rowValues.push(getRandomInt(3));
    }
}

function pause() {
    if (!isPaused) {
        clearTimeout(timer);
        isPaused = true;
    }
}

function clearCanvas() {
    if (isPaused) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        currentRow = -1;
    }
}

function drawLine() {
    const squareSize = canvas.width / cellsPerRow;
    if ((currentRow + 1) * squareSize < canvas.height) {
        currentRow++;
    } else {
        let data = context.getImageData(0, squareSize, canvas.width, canvas.height);
        context.putImageData(data, 0, 0);
    }

    for (let i = 0; i < rowValues.length; i++) {
        context.fillStyle = getColorForValue(rowValues[i]);
        let xOffset = i * squareSize;
        let yOffset = currentRow * squareSize;
        context.fillRect(xOffset, yOffset, squareSize, squareSize);
        context.strokeRect(xOffset, yOffset, squareSize, squareSize);   // draw border around the cell
    }
    updateChart();
    calculateNextRowValues();

    if (!isPaused) {
        timer = setTimeout(drawLine, 500);
    }
}

function getColorForValue(value) {
    if (value === 0) {
        return "#d12e51";  // red
    } else if (value === 1) {
        return "#dbc430";  // green
    } else if (value === 2) {
        return "#2f85d1";  // blue
    }
}

function updateChart() {
    Plotly.extendTraces('chart', {y: [[countFields(0)]]}, [0]);
    Plotly.extendTraces('chart', {y: [[countFields(1)]]}, [1]);
    Plotly.extendTraces('chart', {y: [[countFields(2)]]}, [2]);
    chartCount++;
    if (chartCount > 50) {
        Plotly.relayout('chart', {
            xaxis: {
                range: [chartCount - 50, chartCount]
            }
        });
    }
}

function countFields(value) {
    let count = 0;
    for (let i = 0; i < rowValues.length; i++) {
        if (rowValues[i] === value) {
            count++;
        }
    }
    return count;
}

function calculateNextRowValues() {
    let temp = [];
    let rowSize = rowValues.length;
    for (let i = 1; i < rowSize - 1; i++) {
        temp[i] = countCellValue('' + rowValues[i-1] + rowValues[i] + rowValues[i+1]);
    }
    temp[0] = countCellValue('' + rowValues[rowSize-1] + rowValues[0] + rowValues[1]);
    temp[rowSize - 1] = countCellValue('' + rowValues[rowSize-2] + rowValues[rowSize-1] + rowValues[0]);
    rowValues = temp;
}

function countCellValue(ruleValue) {
    return rules.get(ruleValue);
}

function initRulesMap() {
    let arr = [];

    // standard rules map
    arr.push(['000', 0]);
    arr.push(['001', 0]);
    arr.push(['002', 0]);
    arr.push(['010', 0]);
    arr.push(['011', 0]);
    arr.push(['012', 0]);
    arr.push(['020', 0]);
    arr.push(['021', 0]);
    arr.push(['022', 0]);
    arr.push(['100', 1]);
    arr.push(['101', 1]);
    arr.push(['102', 1]);
    arr.push(['110', 1]);
    arr.push(['111', 1]);
    arr.push(['112', 1]);
    arr.push(['120', 1]);
    arr.push(['121', 1]);
    arr.push(['122', 1]);
    arr.push(['200', 2]);
    arr.push(['201', 2]);
    arr.push(['202', 2]);
    arr.push(['210', 2]);
    arr.push(['211', 2]);
    arr.push(['212', 2]);
    arr.push(['220', 2]);
    arr.push(['221', 2]);
    arr.push(['222', 2]);

    rules = new Map(arr);
}

function initRandomRule() {
    let arr = [];

    for (let i = 0; i < 27; i++) {
        let ruleNumber = decimalToTrinary(i);
        arr.push([ruleNumber, getRandomInt(3)]);
    }
    rules = new Map(arr);
    initRulesTable();
}

function decimalToTrinary(dec) {
    let val3 = parseInt(dec / 9);
    dec -= val3 * 9;
    let val2 = parseInt(dec / 3);
    dec -= val2 * 3;
    let val1 = dec;
    return '' + val3 + val2 + val1;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}