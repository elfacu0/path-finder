// Here i call a normal array Stack, which is wrong because
// I don't follow the LIFO order
const BACKGROUND_COLOR = '#0d0d0d';
const squares = [];
let SQUARE_SIZE;
let squaresInRow;
let squaresInCollum;
const filledSpeed = 5;
const pathSpeed = 10;
let lastChanged = {};

let versor;
let xIndex;
let yIndex;

let changingOrigin = false;
let lastOrigin = { x: 0, y: 0 };

let changingEnd = false;
let lastEnd = { x: 0, y: 0 };

let needUpdate = true;
let running = false;

function setup() {
    rectMode(CORNER);
    const canvas = createCanvas(600, 600);
    SQUARE_SIZE = width / 20;
    canvas.parent('sketch-holder');
    for (let i = 0; i < height; i += SQUARE_SIZE) {
        squares.push([]);
    }
    for (let i = 0; i < height; i += SQUARE_SIZE) {
        for (let j = 0; j < width; j += SQUARE_SIZE) {
            squares[i / SQUARE_SIZE].push(
                new Square(i, j, SQUARE_SIZE, '00ff11')
            );
        }
    }
    squares[1][1].typeSelector('origin');
    lastOrigin = { x: 1, y: 1 };
    squaresInRow = Math.ceil(height / SQUARE_SIZE);
    squaresInCollum = Math.ceil(width / SQUARE_SIZE);
    squares[squaresInRow - 2][squaresInCollum - 2].typeSelector('end');
    lastEnd = { x: squaresInRow - 2, y: squaresInCollum - 2 };
    versor = createVector(SQUARE_SIZE / 2, SQUARE_SIZE / 2);
}
function draw() {
    if (needUpdate) {
        background(BACKGROUND_COLOR);
        for (let row of squares) {
            for (let square of row) {
                square.draw();
            }
        }
    }
}

function mouseDragged() {
    if (mouseX < 0 || mouseX >= width || mouseY < 0 || mouseY >= height)
        return '';
    xIndex = Math.floor(mouseX / versor.x / 2);
    yIndex = Math.floor(mouseY / versor.y / 2);
    let square = squares[xIndex][yIndex];
    if (square.isSelected(mouseX, mouseY)) {
        if (lastChanged.x != square.x || lastChanged.y != square.y) {
            if (square.type === 'origin') {
                changingOrigin = true;
            }

            if (square.type === 'end') {
                changingEnd = true;
            }

            if (changingOrigin) {
                squares[lastOrigin.x][lastOrigin.y].typeSelector('empty');
                square.typeSelector('origin');
                lastOrigin = { x: xIndex, y: yIndex };
            }

            if (changingEnd) {
                squares[lastEnd.x][lastEnd.y].typeSelector('empty');
                square.typeSelector('end');
                lastEnd = { x: xIndex, y: yIndex };
            }

            if (changingOrigin === false && changingEnd === false) {
                if (square.type === 'wall') {
                    square.typeSelector('empty');
                } else {
                    square.typeSelector('wall');
                }
                lastChanged = { x: square.x, y: square.y };
                needUpdate = true;
            }
        }
    }
}

function mouseReleased() {
    changingOrigin = false;
    changingEnd = false;
}

function clearPath() {
    for (let row of squares) {
        for (let square of row) {
            if (
                square.type === 'path' ||
                square.type === 'finalPath' ||
                square.type === 'filled'
            ) {
                square.typeSelector('empty');
            }
            square.default();
        }
    }
    squares[lastOrigin.x][lastOrigin.y].typeSelector('origin');
    squares[lastEnd.x][lastEnd.y].typeSelector('end');
}

function clearAll() {
    for (let row of squares) {
        for (let square of row) {
            square.typeSelector('empty');
            square.default();
        }
    }
    squares[lastOrigin.x][lastOrigin.y].typeSelector('origin');
    squares[lastEnd.x][lastEnd.y].typeSelector('end');
}

function floodFill(pos = lastOrigin) {
    if (running) return;
    running = true;
    clearPath();
    const toColor = [];

    const { x, y } = pos;
    if (x < 0 || x >= squaresInRow) return;
    if (y < 0 || y >= squaresInCollum) return;
    if (squares[x][y].type === 'filled') return;
    if (squares[x][y].type === 'wall') return;

    squares[x][y].typeSelector('filled');
    const stack = [pos];
    let current;
    while (stack.length > 0) {
        current = stack.pop();
        fillNeighbour(current, stack, toColor);
    }
    clearPath();
    let coloring;
    let animate = setInterval(() => {
        if (toColor.length) {
            coloring = toColor.shift();
            squares[coloring.x][coloring.y].typeSelector('filled');
        } else {
            running = false;
            clearInterval(animate);
        }
    }, filledSpeed);
}

function fillNeighbour(node, stack, toColor) {
    let west = node.x - 1;
    let east = node.x + 1;
    if (west >= 0) {
        while (west > 0 && squares[west][node.y].type === 'empty') {
            toColor.push({ x: west, y: node.y });
            west--;
        }
        if (squares[west][node.y].type === 'wall') {
            west++;
        }
    } else {
        west = 0;
    }
    if (east < squaresInCollum) {
        while (
            east < squaresInCollum &&
            squares[east][node.y].type === 'empty'
        ) {
            east++;
        }
        if (east >= squaresInCollum) {
            east--;
        }
        if (squares[east][node.y].type === 'wall') {
            east--;
        }
    } else {
        east = squaresInCollum - 1;
    }
    for (let i = west; i <= east; i++) {
        if (squares[i][node.y].type === 'empty') {
            toColor.push({ x: i, y: node.y });
        }
        squares[i][node.y].typeSelector('filled');
        squares[i][node.y].draw();
        if (
            node.y < squaresInCollum - 1 &&
            squares[i][node.y + 1].type === 'empty'
        ) {
            stack.push({ x: i, y: node.y + 1 });
        }
        if (node.y > 0 && squares[i][node.y - 1].type === 'empty') {
            stack.push({ x: i, y: node.y - 1 });
        }
    }
}

function recursiveFloodFill(pos = lastOrigin) {
    if (running) return;
    running = true;
    const animatePos = [];
    let actual;
    recursionFlood(pos, animatePos);
    clearPath();
    const animate = setInterval(() => {
        if (animatePos.length) {
            actual = animatePos.shift();
            squares[actual.x][actual.y].typeSelector('filled');
        } else {
            running = false;
            clearInterval(animate);
        }
    }, filledSpeed);
}

function recursionFlood(pos, animatePos) {
    const { x, y } = pos;
    if (x < 0 || x >= squaresInRow) return;
    if (y < 0 || y >= squaresInCollum) return;
    if (squares[x][y].type === 'filled') return;
    if (squares[x][y].type === 'wall') return;
    squares[x][y].typeSelector('filled');
    animatePos.push(pos);
    recursionFlood({ x: x, y: y + 1 }, animatePos);
    recursionFlood({ x: x, y: y - 1 }, animatePos);
    recursionFlood({ x: x - 1, y: y }, animatePos);
    recursionFlood({ x: x + 1, y: y }, animatePos);
}

function getNeighbors(stack, visited, pos) {
    const moves = [
        [0, 1],
        [0, -1],
        [-1, 0],
        [1, 0],
    ];
    for (let i = 0; i < moves.length; i++) {
        let { x, y } = pos;
        x += moves[i][0];
        if (x < 0 || x >= squaresInRow) continue;

        y += moves[i][1];
        if (y < 0 || y >= squaresInCollum) continue;

        const actualPos = { x: x, y: y };
        if (squares[x][y].type == 'empty') {
            if (!stack.includes(actualPos) && !visited.includes(actualPos)) {
                stack.push(actualPos);
                getNeighbors(stack, visited, actualPos);
                visited.push(actualPos);
                squares[x][y].typeSelector('filled');
            }
        }
    }
}

function improvedFloodFill(pos = lastOrigin, color = '#f000f0') {
    if (running) return;
    running = true;
    clearPath();
    let tmpX;
    let tmpY;
    let neighbour = {};
    let neighbourString = {};
    const stack = [JSON.stringify(pos)];
    const visited = [];
    let current = pos;
    squares[pos.x][pos.y].typeSelector('filled');
    let animate = setInterval(() => {
        if (stack.length > 0) {
            squares[current.x][current.y].typeSelector('filled');
            current = stack.shift();
            visited.push(current);
            current = JSON.parse(current);
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) continue;
                    tmpX = current.x + i;
                    tmpY = current.y + j;
                    if (exceptions(tmpX, tmpY)) continue;

                    neighbour = { x: tmpX, y: tmpY };
                    neighbourString = JSON.stringify(neighbour);
                    if (visited.includes(neighbourString)) continue;
                    if (!isValidCorner(current, neighbour)) continue;

                    if (squares[neighbour.x][neighbour.y].type == 'empty') {
                        if (
                            !stack.includes(neighbourString) &&
                            !visited.includes(neighbourString)
                        ) {
                            stack.push(neighbourString);
                        }
                    }
                }
            }
        } else {
            squares[current.x][current.y].typeSelector('filled');
            running = false;
            clearInterval(animate);
        }
    }, filledSpeed);
    console.log('END');
}

function floodFill4(pos = lastOrigin) {
    if (running) return;
    running = true;
    clearPath();
    let tmpX;
    let tmpY;
    let neighbour = {};
    let neighbourString = {};
    const stack = [JSON.stringify(pos)];
    const visited = [];
    let current = pos;
    squares[pos.x][pos.y].typeSelector('filled');
    const moves = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0],
    ];
    let i, j;
    let animate = setInterval(() => {
        if (stack.length > 0) {
            squares[current.x][current.y].typeSelector('filled');
            current = stack.shift();
            visited.push(current);
            current = JSON.parse(current);
            for (let k = 0; k < moves.length; k++) {
                i = moves[k][0];
                j = moves[k][1];
                tmpX = current.x + i;
                tmpY = current.y + j;
                if (exceptions(tmpX, tmpY)) continue;

                neighbour = { x: tmpX, y: tmpY };
                neighbourString = JSON.stringify(neighbour);
                if (visited.includes(neighbourString)) continue;
                if (!isValidCorner(current, neighbour)) continue;

                if (squares[neighbour.x][neighbour.y].type === 'empty') {
                    if (
                        !stack.includes(neighbourString) &&
                        !visited.includes(neighbourString)
                    ) {
                        stack.push(neighbourString);
                    }
                }
            }
        } else {
            squares[current.x][current.y].typeSelector('filled');
            running = false;
            clearInterval(animate);
            console.log('END');
        }
    }, filledSpeed);
}

function dijkstra(origin = lastOrigin, end = lastEnd) {
    if (running) return;
    running = true;
    clearPath();
    if (blockedIO(origin, end)) return;
    squares[origin.x][origin.y].fCost = 0;
    let current = { x: origin.x, y: origin.y };
    let stack = [JSON.stringify(origin)];
    let visited = [JSON.stringify(origin)];
    let minCost = 0;
    let neighbour = {};
    let tmpX = 0;
    let tmpY = 0;
    let tmpDistance = 0;
    let ite = 0;
    let pos;
    let dijkstraInterval = setInterval(() => {
        if (stack.length) {
            if (++ite > 5000) return 0;
            minCost = 10000;
            stack = stack.filter((posString) => {
                pos = JSON.parse(posString);
                if (pos.x === current.x && pos.y === current.y) {
                    return false;
                }
                return true;
            });
            visited.push(JSON.stringify(current));

            if (current.x == end.x && current.y === end.y) {
                console.log('END');
                animateDijkstra(end, origin);
                clearInterval(dijkstraInterval);
            } else {
                squares[current.x][current.y].typeSelector('filled');
            }

            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) continue;
                    tmpX = current.x + i;
                    tmpY = current.y + j;
                    if (exceptions(tmpX, tmpY)) continue;

                    neighbour = { x: tmpX, y: tmpY };
                    if (!isValidCorner(current, neighbour)) continue;

                    tmpDistance = dijkstraDistance(current, neighbour);
                    if (tmpDistance < squares[tmpX][tmpY].fCost) {
                        squares[tmpX][tmpY].fCost = tmpDistance;
                    }

                    if (
                        !stack.includes(JSON.stringify(neighbour)) &&
                        !visited.includes(JSON.stringify(neighbour))
                    ) {
                        stack.push(JSON.stringify(neighbour));
                        squares[tmpX][tmpY].typeSelector('path');
                    }
                }
            }

            stack.forEach((posString) => {
                pos = JSON.parse(posString);
                tmpDistance = squares[pos.x][pos.y].fCost;
                if (tmpDistance < minCost && !visited.includes(posString)) {
                    minCost = tmpDistance;
                    current = pos;
                }
            });
        } else {
            running = false;
        }
    }, pathSpeed);
}

function blockedIO(origin, end) {
    if (squares[origin.x][origin.y].type === 'wall') return true;
    if (squares[end.x][end.y].type === 'wall') return true;
    return false;
}

function exceptions(tmpX, tmpY) {
    if (tmpX < 0 || tmpX >= squaresInRow) return true;
    if (tmpY < 0 || tmpY >= squaresInCollum) return true;
    if (squares[tmpX][tmpY].type == 'wall') return true;
    return false;
}

function isValidCorner(origin, end) {
    let xDif = end.x - origin.x;
    let yDif = end.y - origin.y;
    let blocks = 0;
    if (squares[origin.x + xDif][origin.y].type === 'wall') {
        blocks++;
    }
    if (squares[origin.x][origin.y + yDif].type === 'wall') {
        blocks++;
    }
    if (blocks === 2) {
        return false;
    } else {
        return true;
    }
}

function animateDijkstra(origin, end) {
    let tmpX = 0;
    let tmpY = 0;
    let current = { x: origin.x, y: origin.y };
    let tmpCurrent = {};
    let neighbour = {};
    let minDist = 0;
    squares[end.x][end.y].typeSelector('finalPath');
    while (current.x != end.x || current.y != end.y) {
        minDist = 10000;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                tmpX = current.x + i;
                tmpY = current.y + j;
                if (exceptions(tmpX, tmpY)) continue;

                neighbour = { x: tmpX, y: tmpY };
                if (!isValidCorner(current, neighbour)) continue;

                if (minDist > squares[tmpX][tmpY].fCost) {
                    minDist = squares[tmpX][tmpY].fCost;
                    tmpCurrent = neighbour;
                }
            }
        }
        squares[current.x][current.y].typeSelector('finalPath');
        current = tmpCurrent;
        if (current.x === end.x && current.y === end.y) {
            break;
        }
    }
    running = false;
}

function dijkstraDistance(origin, current) {
    let distance = squares[origin.x][origin.y].fCost;
    let tmpIndex =
        Math.abs(origin.x - current.x) + Math.abs(origin.y - current.y);
    if (tmpIndex == 2) {
        distance += 14;
    } else {
        distance += 10;
    }
    return distance;
}

function a_star(origin = lastOrigin, end = lastEnd) {
    if (running) return;
    running = true;
    clearPath();
    if (blockedIO(origin, end)) return;
    squares[origin.x][origin.y].fCost = 0;
    let current = { x: origin.x, y: origin.y };
    let stack = [JSON.stringify(origin)];
    let visited = [JSON.stringify(origin)];
    let minCost = 0;
    let neighbour = {};
    let tmpX = 0;
    let tmpY = 0;
    let hCost = 0;
    let gCost = 0;
    let fCost = 0;
    let ite = 0;
    let pos;
    let aStarInterval = setInterval(() => {
        if (stack.length) {
            if (++ite > 5000) return 0;
            minCost = 10000;
            stack = stack.filter((posString) => {
                pos = JSON.parse(posString);
                if (pos.x === current.x && pos.y === current.y) {
                    return false;
                }
                return true;
            });
            visited.push(JSON.stringify(current));

            if (current.x == end.x && current.y === end.y) {
                animateAStar(end, origin);
                console.log('END');
                clearInterval(aStarInterval);
            } else {
                squares[current.x][current.y].typeSelector('filled');
            }

            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    if (i === 0 && j === 0) continue;
                    tmpX = current.x + i;
                    tmpY = current.y + j;
                    if (exceptions(tmpX, tmpY)) continue;

                    neighbour = { x: tmpX, y: tmpY };
                    if (!isValidCorner(current, neighbour)) continue;

                    gCost = calculateGCost(current, neighbour);
                    hCost = calculateHCost(end, neighbour);
                    fCost = gCost + hCost;

                    if (fCost < squares[tmpX][tmpY].fCost) {
                        squares[tmpX][tmpY].updateCosts(gCost, hCost);
                    }

                    if (
                        !stack.includes(JSON.stringify(neighbour)) &&
                        !visited.includes(JSON.stringify(neighbour))
                    ) {
                        stack.push(JSON.stringify(neighbour));
                        squares[tmpX][tmpY].typeSelector('path');
                    }
                }
            }

            stack.forEach((posString) => {
                pos = JSON.parse(posString);
                fCost = squares[pos.x][pos.y].fCost;
                if (fCost < minCost && !visited.includes(posString)) {
                    minCost = fCost;
                    current = pos;
                }
            });
        } else {
            running = false;
        }
    }, pathSpeed);
}

function animateAStar(origin, end) {
    let tmpX = 0;
    let tmpY = 0;
    let current = { x: origin.x, y: origin.y };
    let tmpCurrent = {};
    let neighbour = {};
    let minDist = 0;
    squares[end.x][end.y].gCost = -1;
    squares[end.x][end.y].typeSelector('finalPath');
    while (current.x != end.x || current.y != end.y) {
        minDist = 10000;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                tmpX = current.x + i;
                tmpY = current.y + j;
                if (exceptions(tmpX, tmpY)) continue;

                neighbour = { x: tmpX, y: tmpY };
                if (!isValidCorner(current, neighbour)) continue;
                if (
                    minDist > squares[tmpX][tmpY].gCost &&
                    squares[tmpX][tmpY].gCost != 0
                ) {
                    minDist = squares[tmpX][tmpY].gCost;
                    tmpCurrent = neighbour;
                }
            }
        }
        squares[current.x][current.y].typeSelector('finalPath');
        current = tmpCurrent;
        if (current.x === end.x && current.y === end.y) {
            break;
        }
    }
    running = false;
}

function calculateGCost(actual, end) {
    let distance = squares[actual.x][actual.y].gCost;
    let tmpIndex = Math.abs(end.x - actual.x) + Math.abs(end.y - actual.y);
    if (tmpIndex == 2) {
        distance += 14;
    } else {
        distance += 10;
    }
    return distance;
}

function calculateHCost(actual, end) {
    let cost = 0;
    let tmpX = actual.x;
    let tmpY = actual.y;
    cost = Math.sqrt((tmpX - end.x) ** 2 + (tmpY - end.y) ** 2);
    return Math.floor(cost * 10);
    // while (tmpX != end.x || tmpY != end.y) {
    //     if (tmpX != end.x && tmpY != end.y) {
    //         cost += 1.4;
    //         tmpX += tmpX > end.x ? -1 : 1;
    //         tmpY += tmpY > end.y ? -1 : 1;
    //     } else {
    //         if (tmpX != end.x) {
    //             cost += 1;
    //             tmpX += tmpX > end.x ? -1 : 1;
    //         }
    //         if (tmpY != end.y) {
    //             cost += 1;
    //             tmpY += tmpY > end.y ? -1 : 1;
    //         }
    //     }
    // }
}
