'use strict';

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (vector instanceof Vector) {
      // если значение присваивается переменной один раз,
      // то лучше использовать const
      // не нужно мутировать объекты класса Vector
      // лучше при создании объекта просто передать
      // в конструктор нужные значения x и y
      // не опускайте аргументы у конструктора
      let newVector = new Vector;
      newVector.x = vector.x + this.x;
      newVector.y = vector.y + this.y;
      return newVector
    }
    // else тут не нужен, потому что if заканчивается на return
    else {
      // лучше сначала проверить аргументы и выбросить исключение,
      // а потом расположить основной код
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
  }
  times(multiplier) {
    // см. выше
    let newVector = new Vector;
    newVector.x = multiplier * this.x;
    newVector.y = multiplier * this.y;
    return newVector
  }
}

class Actor {

  constructor(pos = new Vector(0, 0),
              size = new Vector(1, 1),
              speed = new Vector(0, 0)) {

    // можно вызвать метод сразу у массива и не объявлять переменную
    let args = [pos, size, speed];
    // почему не стрелочная функция?
    args.forEach(function (arg) {
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
    // вторая часть проверки лишняя
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error('Аргумент либо не объект типа Vector, либо не задан');
    }
    // else можно убрать
    else if (actor === this) {
      return false;
    }
    // else можно убрать
    else {
      // всё что ниже нужно переписать
      // алгоритм следующий:
      // если объект выше, ниже, левее или правее,
      // то он не пересекается с данным
      let pointPosArr = [[actor.left, actor.top],
                [actor.left, actor.bottom],
                [actor.right, actor.bottom],
                [actor.right, actor.top]
      ];
      let arr = [];
      let arr2 =[];
      for (let pointPos of pointPosArr) {

        let x = pointPos[0];
        let y = pointPos[1];

        let yOutside =((x === this.left || x === this.right) &&
          (this.top < y && y < this.bottom));
        let xInside = ((this.left < x && x < this.right) &&
          (y === this.top || y === this.bottom));
        let res1 = yOutside || xInside;

        arr2.push(res1);

        if ((this.left < x && x < this.right) &&
          (this.top < y && y < this.bottom)) {
          arr.push('true');
        }
        else {
          arr.push('false');
        }
      }

      let res2 = arr.reduce(function (last, el) {
        last = last && el;
        return last;

      });

      let count = 0;
      for (let item of arr2) {
        if (item === true) {
          count += 1;
        }
      }
      let res3 = (count >= 2);

      let res4 = arr.includes('true');

      // Если все точки TRUE (содержиться в нем)
      if (res2 === true) {
        return true;
      }
      // Если хоть одна есть TRUE, но не все (частично)
      else if ((res4 === true && res2 !== true) ||
        (actor.left <= this.left &&
          actor.right >= this.right &&
          actor.top <= this.top &&
          actor.bottom >= this.bottom))
        {
        return true;
      }
      // Если точки только на гранях (частично)
      else if (!res4 && res3) {
        return true;
      }
      // Если все FALSE (не пересекаются)
      else if (!res4 && !res3) {
        return false;
      }
    }
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    // стрелочные функции короче
    this.player = actors.find(function (actor) {
      return actor.type === 'player';
    });
    this.height = grid.length;
    this.status = null;
    this.finishDelay = 1;
  }
  get width() {
    // лучше посчитать 1 раз в конструкторе
    let length = 0;
    for (let row of this.grid) {
      if (row.length > length) {
        length = row.length;
      }
    }
    return length;
  }; // точка с запятой тут лишняя
  isFinished() {
    // скобки можно опустить
    return (this.status !== null && this.finishDelay < 0);
  }
  actorAt(actor) {
    // неправильное условие
    if (actor === undefined || !actor instanceof Actor) {
      throw new Error('Пересекается');
    }
    // для поиска объектов в массиве есть специальный метод
    for (let act of this.actors) {
      if (act.isIntersect(actor))  {
        return act;
      }
    }
  }
  obstacleAt(nextPos, size) {
    // неправильное условие
    if (!nextPos instanceof Vector || !size instanceof Vector) {
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
        else {
          if (this.grid[y1][x1] === 'lava') {
            return 'lava';
          }
          else if (this.grid[y1][x1] === 'wall') {
            return 'wall';
          }
          else if (this.grid[y1][x2] === 'lava') {
            return 'lava';
          }
          else if (this.grid[y1][x2] === 'wall') {
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
    // для проверки наличия в массиве эл
    let actorExist = true;
    for (let i of this.actors) {
      if (i.type === actorType) {
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
  constructor(movingObj) {
    this.movingObj = movingObj;
  }
  actorFromSymbol(symbol) {
    // проверка лишняя
    if (symbol) {
      return this.movingObj[symbol];
    }
  }
  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    // else можно не писать
    // не опускайте фигурные скобки
    else if (symbol === '!')
      return 'lava';
  }
  createGrid(strArr) {
    let grid = [];
    for (let str of strArr) {
      // чтобы преобразовать строку в массив лучше использовать метод split
      grid.push(Array.from(str))
    }
    // переписать с использованием map
    for (let line of grid) {
      for (let i = 0; i < line.length; i++) {
        let symbol = line[i];
        // за счёт этих проверок дублируется логика obstacleFromSymbol
        if (symbol === '!' || symbol === 'x') {
          line.splice(i, 1, this.obstacleFromSymbol(symbol));
        }
        else {
          line.splice(i, 1, this.obstacleFromSymbol('undefined'));
        }
      }
    }
    return grid;
  }

  createActors(strArr) {

    let actors = [];
    // лучше добавить значение по-умолчанию
    // для аргумента в конструкторе и убрать эту проверку
    if ( this.movingObj === undefined) {
      return actors;
    }

    for (let y = 0; y < strArr.length; y++) {
      for (let x = 0; x < strArr[y].length; x++) {
        // если значение присваивается переменной 1 раз,
        // то лучше использовать const
        let symbol = strArr[y][x];
        // этих проверок тут быть не должно
        if ((symbol in this.movingObj) &&
          ((this.movingObj[symbol].prototype instanceof Actor) ||
          (this.movingObj[symbol] === Actor))) {

          // а вот тут нужно проверить, что creator это функция
          // const, const, const
          let creator = this.actorFromSymbol(symbol);
          let symbolPos = new Vector(x, y);
          let newObj = new creator(symbolPos);
          if (newObj instanceof Actor) {
            actors.push(newObj)
          }
        }
      }
    }
    return actors;
  }
  parse(strArr) {
    // const, const
    let grid = this.createGrid(strArr);
    let actors = this.createActors(strArr);
    return new Level(grid, actors);
  }
}

class Fireball extends Actor {
  constructor(pos, speed) {
    // родительский конструктор принимает 3 аргумента
    super(pos);
    // this.speed долно задаваться через вызов родительского конструктора
    this.speed = speed;
  }
  getNextPosition(time = 1) {
    // тут нужно использовать методы класса Vector
    return new Vector(this.pos.x + this.speed.x * time,
      this.pos.y + this.speed.y * time);
  }
  handleObstacle() {
    // не мутируйте объекты, используйте метод класса Vector
    this.speed.x  = -this.speed.x;
    this.speed.y  = -this.speed.y;
  }
  act(time, grid) {
    // const
    let newPos = this.getNextPosition(time);
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
    // родительский конструктор принимает 2 аргумента
    super(currPos);
    // pos, speed должны задаваться через вызов
    // родительского конструктора
    this.pos = currPos;
    this.speed = new Vector(2, 0);
  }
  // метод реализован в родительском классе
  getNextPosition(time = 1) {
    return new Vector(this.initPos.y, this.pos.x + this.speed.x * time);
  }
  handleObstacle() {
    // некорректный код
    this.speed = -this.speed;
  }
  // метод реализован в родительском классе
  act(time, grid) {
    let newPos = this.getNextPosition(time);
    if (grid.obstacleAt(newPos, this.size)) {
      this.handleObstacle();
    }
    else {
      this.pos = newPos;
    }
  }
}

class VerticalFireball extends Fireball {
  constructor(currPos) {
    // родительский конструктор принимает 2 аргумента
    super(currPos);
    // speed должно задаваться через вызов родительского конструктора
    this.speed = new Vector(0, 2);
  }
  // метод реализован в родительском классе
  getNextPosition(time = 1) {
    return new Vector(this.initPos.x, this.pos.y + this.speed.y * time);
  }
  // метод реализован в родительском классе
  handleObstacle() {
    this.speed = -this.speed;
  }
  // метод реализован в родительском классе
  act(time, grid) {
    let newPos = this.getNextPosition(time);
    if (grid.obstacleAt(newPos, this.size)) {
      this.handleObstacle();
    }
    else {
      this.pos = newPos;
    }
  }
}

class FireRain extends Fireball{
  constructor(currPos) {
    // родительский конструктор принимает 2 аргумента
    super(currPos);
    this.initPos = currPos;
    // size, speed должны задаваться через вызов родительского конструктора
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 3);
  }
  // метод реализован в родительском классе
  getNextPosition(time=1) {
    return new Vector(this.initPos.x, this.pos.y + this.speed.y * time);
  }
  // метод реализован в родительском классе
  handleObstacle() {
    this.pos.x  = this.initPos.x;
    this.pos.y  =  this.initPos.y;
  }
  // метод реализован в родительском классе
  act(time, grid) {
    let newPos = this.getNextPosition(time);
    if (grid.obstacleAt(newPos, this.size)) {
      this.handleObstacle();
    }
    else {
      this.pos = newPos;
    }
  }
}

class Coin extends Actor{
  constructor(pos) {
    // родительский конструктор принимат 3 аргумента
    super(pos);
    this.initPos = this.pos.plus(new Vector(0.2, 0.1));
    // pos и size должны задаваться через вызов родительского конструктора
    this.pos = this.pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
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
    // родительский конструктор принимает 3 аргумента
    super(pos);
    // pos, size, speed должны задаваться
    // через вызов родительского конструктора
    this.pos = this.pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }
  get type() {
    return 'player';
  }
}
