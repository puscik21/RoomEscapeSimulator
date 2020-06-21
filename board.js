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

window.onload = function() {
    canvas = document.getElementById("board");
    context = canvas.getContext("2d");
    // initColorAgenda();
    initStrokeOfBoard();
    initRulesMap();
    // initRulesTable();
    initChart();

    initRoom();
};

function initRoom() {
    const squareSize = 100;      // TODO based on user choice?

    for (let i = 0; i < 600 / squareSize; i++) {
        for (let j = 0; j < 1200 / squareSize; j++) {
            context.fillStyle = "#ffffff";
            let xOffset = j * squareSize;
            let yOffset = i * squareSize;
            context.fillRect(xOffset, yOffset, squareSize, squareSize);
            context.strokeRect(xOffset, yOffset, squareSize, squareSize);   // draw border around the cell
            context.font = "30px Arial";
            context.fillText("Hello there", 200, 100);
        }
    }

    // const squareSize = canvas.width / cellsPerRow;
    // if ((currentRow + 1) * squareSize < canvas.height) {
    //     currentRow++;
    // } else {
    //     let data = context.getImageData(0, squareSize, canvas.width, canvas.height);
    //     context.putImageData(data, 0, 0);
    // }
    //
    // for (let i = 0; i < rowValues.length; i++) {
    //     context.fillStyle = getColorForValue(rowValues[i]);
    //     let xOffset = i * squareSize;
    //     let yOffset = currentRow * squareSize;
    //     context.fillRect(xOffset, yOffset, squareSize, squareSize);
    //     context.strokeRect(xOffset, yOffset, squareSize, squareSize);   // draw border around the cell
    // }
    // updateChart();
    // calculateNextRowValues();
    //
    // if (!isPaused) {
    //     timer = setTimeout(drawLine, 500);
    // }
}

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

// ### start button ###
function start() {
    if (isPaused && document.getElementById('cellsPerRow').value !== '') {
        cellsPerRow = document.getElementById('cellsPerRow').value;
        if (rowValues == null) {
            initRowValues();
        }
        timer = setTimeout(drawLine, 500);
        isPaused = false;
    }
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