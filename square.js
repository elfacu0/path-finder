class Square {
    constructor(
        x = 10,
        y = 10,
        size = 20,
        fillColor,
        type = 'empty',
        color = 150
    ) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.type = type;
        this.gCost = 0;
        this.hCost = 0;
        this.fCost = 1000;
        this.fillColor = fillColor;
        this.origin = false;
        this.end = false;
    }
    draw() {
        fill(this.color);
        rect(this.x, this.y, this.size, this.size);

        // Cost display
        //fill('#000000');
        //text(`${this.fCost}`, this.x, this.y + this.size / 2);
    }

    isSelected(x, y) {
        if (y < this.y + this.size && y > this.y) {
            if (x < this.x + this.size && x > this.x) {
                return true;
            }
        }
        return false;
    }

    typeSelector(type) {
        this.type = type;
        switch (this.type) {
            case 'filled': {
                this.color = this.fillColor || 255;
                break;
            }
            case 'wall': {
                this.color = 10;
                break;
            }
            case 'path': {
                this.color = '#00ee00';
                break;
            }
            case 'finalPath': {
                this.color = '#0011ff';
                break;
            }
            case 'empty': {
                this.color = 150;
                break;
            }
            case 'origin': {
                this.color = '#0011ff';
                this.origin = true;
                break;
            }
            case 'end': {
                this.color = '#ff1111';
                this.end = true;
                break;
            }
        }
    }

    updateCosts(gCost, hCost) {
        this.gCost = gCost;
        this.hCost = hCost;
        this.fCost = this.gCost + this.hCost;
    }

    default() {
        this.gCost = 0;
        this.hCost = 0;
        this.fCost = 1000;
    }
}
