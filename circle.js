function createCircle(origin = { x: 0, y: 0 }, end = { x: 12, y: 12 }) {
    // Midpoint circle algorithm
    let middle = {
        x: Math.floor(Math.abs((end.x - origin.x) / 2)) + origin.x,
        y: Math.floor(Math.abs((end.y - origin.y) / 2)) + origin.y,
    };
    let r = middle.x - origin.x;
    let x = r;
    let y = 0;
    let P = 1 - r;
    squares[x + middle.x][y + middle.y].typeSelector('wall');
    console.log(middle);
    if (r > 0) {
        squares[x + middle.x][-y + middle.y].typeSelector('wall');
        squares[-x + middle.x][-y + middle.y].typeSelector('wall');
        squares[y + middle.x][-x + middle.y].typeSelector('wall');
        squares[-y + middle.x][x + middle.y].typeSelector('wall');
    }
    while (x > y) {
        y++;
        if (P <= 0) P = P + 2 * y + 1;
        // Mid-point is outside the perimeter
        else {
            x--;
            P = P + 2 * y - 2 * x + 1;
        }

        // All the perimeter points have already been printed
        if (x < y) break;
        squares[x + middle.x][y + middle.y].typeSelector('wall');
        squares[-x + middle.x][y + middle.y].typeSelector('wall');
        squares[x + middle.x][-y + middle.y].typeSelector('wall');
        squares[-x + middle.x][-y + middle.y].typeSelector('wall');
        if (x != y) {
            squares[y + middle.x][x + middle.y].typeSelector('wall');
            squares[-y + middle.x][x + middle.y].typeSelector('wall');
            squares[y + middle.x][-x + middle.y].typeSelector('wall');
            squares[-y + middle.x][-x + middle.y].typeSelector('wall');
        }
    }
}
