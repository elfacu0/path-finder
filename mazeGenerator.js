function generateMaze() {}

function recursiveBacktracker(origin = { x: 0, y: 0 }) {
    let current = origin;
    let neighbour = {};
    let stringNeighbour = '';
    let stack = [JSON.stringify(origin)];
    let visited = [];
    let difX = 0;
    let difY = 0;
    let totalSquares = parseInt((squaresInCollum * squaresInRow) / 2);
    while (stack.length) {
        neighbour = {};
        neighbour = getRandomNeighbour(stack, visited, current);
        while (!neighbour && stack.length) {
            current = JSON.parse(stack.pop());
            neighbour = getRandomNeighbour(stack, visited, current);
        }
        if (!stack.length) break;
        squares[current.x][current.y].typeSelector('wall');
        squares[neighbour.x][neighbour.y].typeSelector('wall');
        difX = (neighbour.x - current.x) / 2;
        difY = (neighbour.y - current.y) / 2;
        if (current.x + difX > 0 && current.y + difY > 0) {
            squares[current.x + difX][current.y + difY].typeSelector('wall');
        }
        stringNeighbour = JSON.stringify(neighbour);
        if (!visited.includes(stringNeighbour)) {
            visited.push(stringNeighbour);
        }
        if (
            !stack.includes(stringNeighbour) &&
            !visited.includes(stringNeighbour)
        ) {
            stack.push(stringNeighbour);
            i++;
        }
    }
}

function getRandomNeighbour(stack, visited, current) {
    let randomMove = [];
    let randomIndex = 0;
    let tmpX = 0;
    let tmpY = 0;
    let i = 0;
    let neighbour = {};
    let stringNeighbour = '';
    const moves = [
        [0, 2],
        [2, 0],
        [0, -2],
        [-2, 0],
    ];
    while (i < 4) {
        i++;
        randomIndex = Math.floor(Math.random() * moves.length);
        randomMove = moves[randomIndex];
        tmpX = current.x + randomMove[0];
        tmpY = current.y + randomMove[1];
        if (exceptions(tmpX, tmpY)) continue;

        neighbour = {
            x: tmpX,
            y: tmpY,
        };
        stringNeighbour = JSON.stringify(neighbour);
        if (
            !stack.includes(stringNeighbour) &&
            !visited.includes(stringNeighbour) &&
            squares[tmpX][tmpY].type != 'wall'
        ) {
            stack.push(stringNeighbour);
            return neighbour;
        }
    }
}
