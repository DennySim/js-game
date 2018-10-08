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
    else {
      return new Vector(vector.x + this.x, vector.y + this.y);
    }
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
    return !((actor.bottom <= this.top || actor.top >= this.bottom) ||
      (actor.right <= this.left || actor.left >= this.right ));
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
    this.width = this.grid.reduce(function (length = 0, row) {
      if (row.length > length) {
              length = row.length;
            }
          return length;
    }, length)
  }
  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
  actorAt(actor) {
    if (actor === undefined || !(actor instanceof Actor)) {
      throw new Error('Объект не передан или переданный объект не вектор');
    }
    return this.actors.find(actorInArray =>
    {return actorInArray.isIntersect(actor)});
  }
  obstacleAt(nextPos, size) {
    if (!(nextPos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Переданный объект не вектор');
    }

    // это нужно переписать, алгоритм:
    // определить на каких клетках находится объект
    // и проверить их на наличие препятствий

    let next = nextPos.plus(size);
    if (nextPos.y < 0 || next.y < 0)  {
      return 'wall'
    }
    else if (Math.floor(next.y) > this.height - 1 ||
      Math.floor(nextPos.y) > this.height - 1)  {
      return 'lava';
    }
    else if ((this.grid[Math.floor(next.y)].length  < next.x || next.x < 0) ||
      (this.grid[Math.floor(next.y)].length  < nextPos.x || nextPos.x < 0) )  {
      return 'wall';
    }
    else {
      let x1 = Math.floor(next.x);
      let x2 = Math.floor(nextPos.x);
      let y1 = Math.floor(next.y);
      let y2 = Math.floor(nextPos.y);
      let xa = Math.max(x1, x2);
      let ya = Math.max(y1, y2);

      if (y1 === y2) {
        if (x1 === x2) {
          if (this.grid[y1][x1] === 'lava') {
            return 'lava';
          }
          else if (this.grid[y1][x1] === 'wall') {
            return 'wall';
          }
        }
      }

      for (let y = Math.min(y1, y2); y < ya; y++) {
        for (let x = Math.min(x1, x2); x < xa; x++) {
          if (this.grid[y][x] === 'lava') {
            return 'lava';
          }
          else if (this.grid[y][x] === 'wall') {
            return 'wall';
          }
        }
        return undefined;
      }
    }
  }
  removeActor(actor) {
    // метод реализован некорректно,
    // во-первых удалять нужно только тот объект, который передали
    // во-вторых метод может удалить несколько объектов
    for (let i = 0; i < this.actors.length; i++) {
      if (JSON.stringify(this.actors[i]) === JSON.stringify(actor)) {
        this.actors.splice(i,1);
      }
    }
  }
  noMoreActors(actorType) {
    let actorExist = true;
    for (let el of this.actors) {
      if (el.type === actorType) {
        actorExist =false;
        break
      }
    }
    return actorExist;
  }
  playerTouched(type, touchedObj) {
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }
    else if (type === 'coin') {
      this.removeActor(touchedObj);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor(movingObj = []) {
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
    let grid = [];
    for (let str of strArr) {
      grid.push(str.split(''));
    }
    return grid.map(function (line) {
      for (let i = 0; i < line.length; i++) {
        let symbol = line[i];
        line.splice(i, 1, this.obstacleFromSymbol(symbol));
      }
      return line;
    }, this);
  }

  createActors(strArr) {

    let actors = [];
    for (let y = 0; y < strArr.length; y++) {
      for (let x = 0; x < strArr[y].length; x++) {
        const symbol = strArr[y][x];
        const creator = this.actorFromSymbol(symbol);
        const symbolPos = new Vector(x, y);
        if (typeof creator === 'function') {
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
    return new Vector(this.speed.x, this.speed.y).times(time).plus(this.pos);
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
  constructor(pos) {
    super(pos, new Vector(0.6, 0.6), new Vector(0, 0));
    this.initPos = this.pos.plus(new Vector(0.2, 0.1));
    // pos и size должны задаваться через вызов родительского конструктора
    this.pos = this.pos.plus(new Vector(0.2, 0.1));
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
  constructor(pos) {
    super(pos, new Vector(0.8, 1.5), new Vector(0, 0));
    // pos, size, speed должны задаваться
    // через вызов родительского конструктора
    this.pos = this.pos.plus(new Vector(0, -0.5));
  }
  get type() {
    return 'player';
  }
}

