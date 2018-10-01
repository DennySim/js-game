'use strict';

class Vector {
  constructor (x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  plus(vector) {
    if (vector instanceof Vector) {
      let newVector = new Vector;
      newVector.x = vector.x + this.x;
      newVector.y = vector.y + this.y;
      return newVector
    }
    else {
      throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
  }
  times(multiplier) {
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

    let args = [pos, size, speed];
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
    if (!(actor instanceof Actor) || actor === undefined) {
      throw new Error('Аргумент либо не объект типа Vector, либо не задан');
    }
    else if (actor === this) {
      return false;
    }
    else {
      let vv = [[actor.left, actor.top],[actor.left, actor.bottom],
                [actor.right, actor.bottom],
                [actor.right, actor.top]
      ];
      let arr = [];
      let arr2 =[];
      for (let i of vv) {

        let x = i[0];
        let y = i[1];

        let f5 =((x === this.left || x === this.right) &&
          (this.top < y && y < this.bottom));
        let f6 = ((this.left < x && x < this.right) &&
          (y === this.top || y === this.bottom));
        let f7 = f5 || f6;

        arr2.push(f7);

        console.log(`x= ${x} y = ${y} this = ${this.left} ${this.right} ${this.top} ${this.bottom}`);
        if ((this.left < x && x < this.right) && (this.top < y && y < this.bottom)) {
          console.log('YES');
          arr.push('true');
          console.log(`after ${arr}`);
        }
        else {
          console.log('NO');
          arr.push('false');
          console.log(arr);
        }
      }

      let last = true;
      let res = arr.reduce(function (last, el) {
        //console.log(`el= ${el}`);
        // result = result && el;
        last = last && el;

        return last;

      });
      console.log(arr2);
      let l = 0;
      let ell = arr2.forEach(function (el) {
        if (el === true) {
          l += 1;
        }
        return l;
      });

        console.log(`ell=${l}`);
        //last = last || el;
      let res2;
        if (l >= 2 ) {
          res2 = true;
        }
        else  {
          res2 = false;
        }



      console.log(`res= ${res}`);
      //console.log(res);
      let cc = arr.includes('true');

      console.log(`cc= ${cc}`);
      console.log(`res2= ${res2}`);

      // если все точки TRUE
      if (res === true) {

        console.log('содержиться в нем');
        return true;
      }
      // eсли хоть одна есть TRUE но не все
        //let hh =  (cc === true && res !== true);
      else if ((cc === true && res !== true)
        || (actor.left <= this.left
        && actor.right >= this.right && actor.top <= this.top && actor.bottom >= this.bottom))
        {
        console.log('частично');
        return true;
      }
      //если точки только на гранях
      else if (!cc && res2) {
        console.log(res2);
        console.log('частично2');
        return true;
      }
      //если все FALSE
      else if (!cc && !res2) {
        console.log(cc);
        console.log('не пересекаются');
        return false;
      }
      // else {
      //   console.log('kkkkk');
      //   return true;
      // }



    }

  }

}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = actors.find(function (actor) {
      return actor.type === 'player';
    });
    this.height = grid.length;

    // let length = 0;
    // for (let n = 0; n < grid.length; n++) {
    // //for (let row of grid) {
    //   //if (row[0].length > length) {
    //     grid.length > length;
    //     //length = row[0].length;
    //   length = tt[n].length;
    //   }
    // //this.width = length;

    this.status = null;
    this.finishDelay = 1;
  }
  get width() {

    let length = 0;
    for (let row of this.grid) {
      if (row.length > length) {
        length = row.length;
      }
    }
    return length;
  };


  isFinished() {
    return (this.status !== null && this.finishDelay < 0);
  }
  actorAt(actor) {
    let x = actor.pos.x;
    let y = actor.pos.y;
    if (actor === undefined || !actor instanceof Actor) {
      throw new Error('Пересекается');
    }

    // for (let act of this.actors) {
    //   if (act.x === x && act.y === y)  {
    //     return act;
    //   }
    // }
    for (let act of this.actors) {
      if (act.isIntersect(actor))  {
        return act;
      }
    }
  }
  obstacleAt(nextPos, size) {
    if (!nextPos instanceof Vector || !size instanceof Vector) {
      throw new Error('Переданный объект не вектор');
    }
    // Вектор указывает на конечную точку, а не перемещение объета на этот вектор
    let next = nextPos.plus(size);
    //let next2 = nextPos.plus(Math.floor(size));
    console.log(this.grid);
    console.log(next.y);
    //console.log(this.grid[next.y]);
    console.log(this.height);

    if (nextPos.y < 0 || next.y < 0)  {
      return 'wall'
    }
    else if (Math.floor(next.y) > this.height - 1 || Math.floor(nextPos.y) > this.height - 1)  {
      console.log(next.y);
      console.log(nextPos.y);
      console.log(this.height);
      console.log("ddddddddddddddddddddddddddddddddd");
      return 'lava';
    }

    else if ((this.grid[Math.floor(next.y)].length  < next.x || next.x < 0) ||
      (this.grid[Math.floor(next.y)].length  < nextPos.x || nextPos.x < 0) )  {
      console.log("ffffffffffffffffff");
      return 'wall';
    }
    else {
      console.log("kkkkkkkkkkkkkkkkkkkkkkkkk");
      // let nextPoint = this.grid[next.y][next.x];
      //let nextPoint2 = this.grid[Math.floor(next.y)][Math.floor(next.x)];
      //let nextPoint1 = this.grid[Math.floor(nextPos.y)][Math.floor(nextPos.x)];
      //let xa = Math.floor(next.x) - Math.floor(nextPos.x);
      let x1 = Math.floor(next.x);
      let x2 = Math.floor(nextPos.x);
      //let ya = Math.floor(next.y) - Math.floor(nextPos.y);
      let y1 = Math.floor(next.y);
      let y2 = Math.floor(nextPos.y);
      let xa = Math.max(x1, x2);
      let ya = Math.max(y1, y2);
      console.log(`====${ya}====${y2}===${y1}`);
      console.log(`====${xa}====${x2}===${x1}`);

      if (y1 === y2) {
        if (x1 === x2) {
          if (this.grid[y1][x1] === 'lava') {
            return 'lava';
          }
          else if (this.grid[y1][x1] === 'wall') {
            return 'wall';
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
      }

      for (let y = Math.min(y1, y2); y < ya; y++) {
        // for (let x of xa) {
        //console.log(`============================`);
        for (let x = Math.min(x1, x2); x < xa; x++) {
          if (this.grid[y][x] === 'lava') {
            console.log("11111111111111111111111");
            console.log(this.grid[y][x]);
            return 'lava';
          }
          else if (this.grid[y][x] === 'wall') {
            console.log("22222222222222222222222");
            console.log(this.grid[y][x]);
            return 'wall';
          }
        }

        //console.log(this.grid[y][x]);
        console.log("3333333333333333333333333");
        return undefined;
      }
    }

    // else if (nextPoint1) ) {
    //
    // }

    // else if (nextPoint2 === 'lava' || nextPoint2 === 'wall' ) {
    //   return nextPoint2;
    // }
    // else if (nextPoint1 === 'lava' || nextPoint1 === 'wall' ) {
    //   return nextPoint1;
    // }

    //   return nextPoint;
    // }
    // else {
    //   return undefined;
    // }

  }
  removeActor(actor) {
    for (let i = 0; i < this.actors.length; i++) {
      if (JSON.stringify(this.actors[i]) === JSON.stringify(actor)) {
        this.actors.splice(i,1);
      }
    }
  }
  noMoreActors(actorType) {
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
    // if (this.status !== null) {
    // }
    if (type === 'lava' || type === 'fireball') {
      this.status = 'lost';
    }
    else if (type === 'coin') {
      // this.grid[touchedObj.pos.y][touchedObj.pos.x] = ' ';
      // if (this.noMoreActors('coin')) {
      //   this.status = 'won';
      // }
      this.removeActor(touchedObj);
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }
  }
}

// let grid = [['www'], ['wwww']];
// let dd = new Level(grid);
// console.log(dd.grid[0][0].length);

class LevelParser {
  constructor(movingObj) {
    this.movingObj = movingObj;
  }

  actorFromSymbol(symbol) {
    if (symbol) {
      return this.movingObj[symbol];
    }
  }

  obstacleFromSymbol(symbol) {
    if (symbol === 'x') {
      return 'wall';
    }
    else if (symbol === '!')
      return 'lava';
  }

  createGrid(strArr) {
    let grid = [];
    for (let str of strArr) {
      grid.push(Array.from(str))
    }
    console.log(grid);
    for (let line of grid) {
      for (let i = 0; i < line.length; i++) {
        let symbol = line[i];
        // if (symbol === ' ') {
        //   line.splice(i, 1, this.obstacleFromSymbol('undefined'));
        // }
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

    if ( this.movingObj === undefined) {
      return actors;
    }

    for (let y = 0; y < strArr.length; y++) {
      for (let x = 0; x < strArr[y].length; x++) {
        let symbol = strArr[y][x];
        if ((symbol in this.movingObj) &&
          ((this.movingObj[symbol].prototype instanceof Actor) ||
          (this.movingObj[symbol] === Actor))) {

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
    // let grid = this.createGrid(strArr);
    // let actors = this.createActors(strArr);
    // for (let actor of actors) {
    //   let x = actor.pos.x;
    //   let y = actor.pos.y;
    //   let type = actor.type;
    //   grid[y].splice(x, 1, type);
    // }
    //   return grid;
    // for (let line of strArr) {
    //
    // }
    //
    // let gridStrArr = {};
    let grid = this.createGrid(strArr);
    let actors = this.createActors(strArr);
    // let actors1 = actors.filter(function (actor) {
    //   //console.log(actor);
    //   return  actor instanceof Player;
    // });
    //console.log(actors1.type);
    let level = new Level(grid, actors);
    return level;
  }
}


class Fireball extends Actor {
  constructor(pos, speed) {
    super(pos);
    //this.pos = pos;
    //this.size = new Vector(1, 1);
    this.speed = speed;
  }
  getNextPosition(time=1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }
  handleObstacle() {
    this.speed.x  = -this.speed.x;
    this.speed.y  = -this.speed.y;
  }
  act(time, grid) {
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
    super();
    this.pos = currPos;
    //this.size = new Vector(1, 1);
    this.speed = new Vector(2, 0);
  }
}

class VerticalFireball extends Fireball {
  constructor(currPos) {
    super(currPos);
    //this.pos = currPos;
    //this.size = new Vector(1, 1);
    this.speed = new Vector(0, 2);
  }
}

class FireRain extends Fireball{
  constructor(currPos) {
    super(currPos);
    this.initPos = currPos;
    this.size = new Vector(1, 1);
    this.speed = new Vector(0, 3);
  }
  getNextPosition(time=1) {
    return new Vector(this.initPos.x, this.pos.y + this.speed.y * time);
  }
  handleObstacle() {
    this.pos.x  = this.initPos.x;
    this.pos.y  =  this.initPos.y;
  }
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
    super(pos);
    this.initPos = this.pos.plus(new Vector(0.2, 0.1));
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
    super(pos);

    this.pos = this.pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }
  get type() {
    return 'player';
  }
}

// let a1 =  new Vector(15, 15);
// let a2 =  new Vector(14, 14);
//
// let b1 =  new Vector(16, 16);
// let b2 =  new Vector(3, 3);
//
// let arrow = new Actor(a1, b1);
// let arrow2 = new Actor(a2, b2);
// let grid = [[2,3],[3,3,3,3],[3,3,3]];
// let rr = new Level(grid, arrow);


// let a1 =  new Vector(15, 15);
// let a2 =  new Vector(14, 14);
//
// let b1 =  new Vector(16, 16);
// let b2 =  new Vector(3, 3);
//
// let arrow = new Actor(a1, b1);
// let arrow2 = new Actor(a2, b2);
//
// console.log(arrow2.isIntersect(arrow));

// let position =  new Vector(0, 0);
// let size =  new Vector(2, 2);
// const player = new Actor(position, size);
//
// const moveX = new Vector(1, 0);
// const moveY = new Vector(0, 1);
//
// const coins = [
//   new Actor(position.plus(moveX.times(-1)), size),
//   new Actor(position.plus(moveY.times(-1)), size),
//   new Actor(position.plus(moveX), size),
//   new Actor(position.plus(moveY), size)
// ];
//
// coins.forEach(coin => {
//   const intersected = player.isIntersect(coin);
//     console.log(`~~~~~~~~${intersected}`)
//   //expect(intersected).is.equal(true);
// });



// let arrow2 = new Vector(15, 15);
// console.log(arrow2.x);
// console.log(arrow2.y);
//
//
// let newArrow = arrow.plus(arrow2);
// console.log(newArrow.x);
// console.log(newArrow.y);
//
// let newArrow2 = arrow.times(4);
// console.log(newArrow2.x);
// console.log(newArrow2.y);

// const start = new Vector(30, 50);
// const moveTo = new Vector(5, 10);
// const finish = start.plus(moveTo.times(2));
//
// console.log(`Исходное расположение: ${start.x}:${start.y}`);
// console.log(`Текущее расположение: ${finish.x}:${finish.y}`);


// const plan = [
//   ' = ',
//   // '!!=o',
//   '  @'
// ];
// const parser = new LevelParser({ '@': Player, '=': HorizontalFireball });
// const actors = parser.createActors(plan);
// const oActors = actors.filter(actor => actor instanceof Actor);
// const zActors = actors.filter(actor => actor instanceof HorizontalFireball);
// for (let act of actors) {
//   console.log(act.pos.y)
// }
// console.log(zActors);


// const grid = [
//   [undefined, undefined],
//   ['wall', 'wall']
// ];
//
// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;
//
// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();
//
// const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);
//
// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);
//
// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }
// player.size = new Vector(0.5, 0.5);
// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }
//
// const otherActor = level.actorAt(player);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }


const plan = [
  ' @ ',
  'x!x'
];

const actorsDict = Object.create(null);
actorsDict['@'] = Actor;

const parser = new LevelParser(actorsDict);
const level = parser.parse(plan);

level.grid.forEach((line, y) => {
  line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
});

level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));

// const schemas = [
//   [
//     '         ',
//     '         ',
//     '    =    ',
//     '       o ',
//     '     !xxx',
//     ' @       ',
//     'xxx!     ',
//     '         '
//   ],
//   [
//     '      v  ',
//     '    v    ',
//     '  v      ',
//     '        o',
//     '        x',
//     '@   x    ',
//     'x        ',
//     '         '
//   ]
// ];
// const actorDict = {
//   '@': Player,
//   'v': FireRain
// };
// const parser = new LevelParser(actorDict);
// runGame(schemas, parser, DOMDisplay)
//   .then(() => console.log('Вы выиграли приз!'));