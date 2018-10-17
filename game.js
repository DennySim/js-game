'use strict';

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (!(vector instanceof Vector)) {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(vector.x + this.x, vector.y + this.y);
  }
  times(multiplier) {
    return new Vector(multiplier * this.x, multiplier * this.y)
  }
}

class Actor {

  constructor(pos = new Vector(0, 0),
              size = new Vector(1, 1),
              speed = new Vector(0, 0)) {

    [pos, size, speed].forEach((arg) => {
      if (!(arg instanceof Vector)) {
        throw new Error('Все аргументы должны быть объект типа Vector');
      }
    });
    this.pos = pos;
    this.size = size;
    this.speed = speed;
  }
  act() {
  }
  get type() {
    return 'actor';
  }
  get left() {
    return this.pos.x;
  }
  get top() {
    return this.pos.y;
  }
  get right() {
    return this.pos.x + this.size.x;
  }
  get bottom() {
    return this.pos.y + this.size.y;
  }
  isIntersect(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Аргумент либо не объект типа Vector, либо не задан');
    }
    if (actor === this) {
    return false;
    }
    return actor.bottom > this.top && actor.top < this.bottom &&
      actor.right > this.left && actor.left < this.right;
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(actor => actor.type === 'player');
    this.height = grid.length;
    this.status = null;
    this.finishDelay = 1;
    this.width = this.grid.reduce((length, row) => {
      if (row.length > length) {
        length = row.length;
      }
      return length;
    }, 0);
  }
  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(actor) {
    if (!(actor instanceof Actor)) {
      throw new Error('Объект не передан или переданный объект не вектор');
    }
    return this.actors.find(actorInArray => actorInArray.isIntersect(actor));
  }
  obstacleAt(nextPos, size) {
    if (!(nextPos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Переданный объект не вектор');
    }
    const xCeil = Math.ceil(nextPos.x + size.x);
    const yCeil = Math.ceil(nextPos.y + size.y);

    if (yCeil > this.height) {
      return 'lava';
    }
    if ((this.width < xCeil ||
        nextPos.x < 0) ||
      (nextPos.y < 0)) {
      return 'wall';
    }
    const x1 = Math.floor(nextPos.x);
    const y1 = Math.floor(nextPos.y);

    for (let y = y1; y < yCeil; y++) {
      for (let x = x1; x < xCeil; x++) {
        if (this.grid[y][x]) {
          return this.grid[y][x];
        } else {
          return undefined;
        }
      }
    }
  }
  removeActor(actor) {
    this.actors.splice(this.actors.indexOf(actor),1);
  }
  noMoreActors(actorType) {
    return !(this.actors.some(actor => actor.type === actorType))

  }
  playerTouched(type, touchedObj) {
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    } else if (type === 'coin') {
      this.removeActor(touchedObj);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(movingObj = {}) {
    this.movingObj = movingObj;
  }
  actorFromSymbol(symbol)  {
    return this.movingObj[symbol];
  }
  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    if (symbol === '!') {
      return 'lava';
    }
  }
  createGrid(strArr) {
    return strArr.map(str =>
      str.split('').map(symbol => this.obstacleFromSymbol(symbol))
    );
  }

  createActors(strArr) {

    const actors = [];
    for (let y = 0; y < strArr.length; y++) {
      for (let x = 0; x < strArr[y].length; x++) {
        const symbol = strArr[y][x];
        const creator = this.actorFromSymbol(symbol);
        if (typeof creator === 'function') {
          const symbolPos = new Vector(x, y);
          const newObj = new creator(symbolPos);
          if (newObj instanceof Actor) {
            actors.push(newObj)
          }
        }
      }
    }
    return actors;
  }
  parse(strArr) {
    const grid = this.createGrid(strArr);
    const actors = this.createActors(strArr);
    return new Level(grid, actors);
  }
}

class Fireball extends Actor {
  constructor(pos, speed) {
    super(pos, new Vector(1, 1), speed);
  }
  getNextPosition(time = 1) {
    return this.speed.times(time).plus(this.pos);
  }
  handleObstacle() {
    this.speed = this.speed.times(-1);
  }
  act(time, grid) {
    const newPos = this.getNextPosition(time);
    if (grid.obstacleAt(newPos, this.size)) {
      this.handleObstacle();
    }
    else {
      this.pos = newPos;
    }
  }
  get type() {
    return 'fireball';
  }
}

class HorizontalFireball extends Fireball {
  constructor(currPos) {
    super(currPos, new Vector(2, 0));
  }
}

class VerticalFireball extends Fireball {
  constructor(currPos) {
    super(currPos, new Vector(0, 2));
  }
}

class FireRain extends Fireball{
  constructor(currPos) {
    super(currPos, new Vector(0, 3));
    this.initPos = currPos;
  }
  handleObstacle() {
    this.pos = this.initPos;
  }
}

class Coin extends Actor{
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6), new Vector(0, 0));
    this.initPos = this.pos;
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * 2 * Math.PI;
  }
  updateSpring(time = 1) {
    this.spring = this.spring + this.springSpeed * time;
  }
  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }
  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.initPos.plus(this.getSpringVector());
  }
  act (time) {
    this.pos = this.getNextPosition(time);
  }
  get type() {
    return 'coin';
  }
}

class Player extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
  }
  get type() {
    return 'player';
  }
}

const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '    v    ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ]
];

const actorDict = {
  '@': Player,
  'o': Coin,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'v': FireRain
};

const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));


