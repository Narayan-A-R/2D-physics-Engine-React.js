import { Vector } from "../../utils/maths/vector";
import { quaternion } from "../../utils/maths/quaternion";
import { getRandom } from "../../utils/maths/utility";
import { Matrix } from "../../utils/maths/matrix";
import { Circle } from "./Circle";
import { Square } from "./Square";

export function createBoundry() {
  const arr = [];
  let rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect4 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect5 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect6 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect7 = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let rect8 = document.createElementNS("http://www.w3.org/2000/svg", "rect");

  let vel = new Vector(0, 0, 0);
  let orientation = new quaternion(1,0,0,0);
  let inertia = new Matrix([[0,0,0],[0,0,0],[0,0,0]]);
  let angVel = new Vector(0,0,0);
  arr.push(new Square(rect1, new Vector(-1000, -1000, 0), vel, 1000, 0,orientation,inertia,angVel));
  arr.push(new Square(rect2, new Vector(0, -1000, 0), vel, 1000, 0,orientation,inertia,angVel));
  arr.push(new Square(rect3, new Vector(1000, -1000, 0), vel, 1000, 0,orientation,inertia,angVel));

  arr.push(new Square(rect4, new Vector(-1000, 0, 0), vel, 1000, 0,orientation,inertia,angVel));
  arr.push(new Square(rect5, new Vector(1000, 0, 0), vel, 1000, 0,orientation,inertia,angVel));

  arr.push(new Square(rect6, new Vector(-1000, 1000, 0), vel, 1000, 0,orientation,inertia,angVel));
  arr.push(new Square(rect7, new Vector(0, 1000, 0), vel, 1000, 0,orientation,inertia,angVel));
  arr.push(new Square(rect8, new Vector(1000, 1000, 0), vel, 1000, 0,orientation,inertia,angVel));
  return arr;
}

export function createRandomCircles(n){
  const arr = [];

  for (let i = 0; i < n; i++) {
    let circleSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );

    let pos = new Vector(getRandom(-0, 1000), getRandom(0, 1000), 0);
    let vel = new Vector(getRandom(-100,100), getRandom(-100, 100), 0);
    let radius = getRandom(10, 50);
    let mass = radius * radius;
    let orientation = new quaternion(1,0,0,0);
    let mrr = mass * radius* radius;
    let inertia = new Matrix([[mrr/4,0,0],[0,mrr/4,0],[0,0,mrr/2]])
    let angVel = new Vector(0,0,0)
    let circle = new Circle(circleSvg, radius, pos, vel, mass,orientation,inertia,angVel);
    arr.push(circle);
  }
  return arr;
}

export function createRandomSquares(n){
  let arr = [];
  for (let i = 0; i < n; i++) {
    let sqsvg = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    let side = getRandom(10, 100);
    let pos = new Vector(getRandom(10, 900), getRandom(10, 900), 0);
    let vel = new Vector(getRandom(-500, 500), getRandom(-500, 500), 0);
    let mass = side * side;
    let orientation = new quaternion(1,0,0,0);
    let mss = mass*side*side;
    let inertia = new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]);

    let angVel = new Vector(0,0,0);
    let square = new Square(sqsvg, pos, vel, side, mass,orientation,inertia,angVel);
    arr.push(square);
  }
  return arr;
}
