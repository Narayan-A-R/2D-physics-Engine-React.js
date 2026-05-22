import { useRef, useState, useEffect } from "react";
import "./Playground.css";
import { Vector } from "./utils/maths/vector";
import { ORIGIN } from "./utils/maths/constants";
import { Circle } from "./physics/bodies/Circle";
import { Square } from "./physics/bodies/Square";
import { dot, cross, sameDirection } from "./utils/maths/vectorFunc";
import { GJK } from "./physics/collisionDetection/GJK";
import { findSupportPoint } from "./physics/support";
import { EPA } from "./physics/collisionResolution/EPA";
import { getRandom } from "./utils/maths/utility";
import { quaternion } from "./utils/maths/quaternion";
import { Matrix } from "./utils/maths/matrix";

function resolveCollision(epaResult, s1, s2) {
  let {penetrationVec:p,contactPoint} = epaResult

  let s1Tos2 = s2.position.sub(s1.position);
  if (!sameDirection(p, s1Tos2)) p = p.scale(-1);
  let totInvMass = s1.invMass + s2.invMass;
  if (totInvMass === 0) return;

  let normal = p.unitize();
  let relVelocity = s2.velocity.sub(s1.velocity);
  let speedAlongNormal = dot(relVelocity, normal);
  if (speedAlongNormal > 0) return;

  s1.position = s1.position.sub(p.scale(s1.invMass / totInvMass));
  s2.position = s2.position.add(p.scale(s2.invMass / totInvMass));

  let centerA = s1.position.add(new Vector(s1.side/2, s1.side/2, 0));
  let centerB = s2.position.add(new Vector(s2.side/2, s2.side/2, 0));

  let contactA = contactPoint.sub(centerA);
  let contactB = contactPoint.sub(centerB);


  let e = 0.8;
  let j = -(1 + e) * speedAlongNormal;
  j = j / totInvMass;

  let impulse = normal.scale(j);

  let I1_body = s1.inertia;
  let R1 = s1.orientation.toRotMat();
  let I1_world = R1.mult(I1_body.mult(R1.transpose()));
  let I1_world_inv = I1_world.inv(); 

  let I2_body = s2.inertia;
  let R2 = s2.orientation.toRotMat();
  let I2_world = R2.mult(I2_body.mult(R2.transpose()));
  let I2_world_inv = I2_world.inv();

  let rotMass = dot(
    I1_world_inv.multVec(cross(cross(contactA,normal),contactA)).add(
    I2_world_inv.multVec(cross(cross(contactB,normal),contactB)))
    ,normal)

  let jr = (-(1 + e) * speedAlongNormal)/(s1.invMass+s2.invMass+rotMass)

  if (s1.invMass !== 0){
    s1.velocity = s1.velocity.sub(impulse.scale(s1.invMass));
    s1.angVel = s1.angVel.sub(I1_world_inv.multVec(cross(contactA,normal)).scale(jr))
  }
  if (s2.invMass !== 0){
    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));
    s2.angVel = s2.angVel.add(I2_world_inv.multVec(cross(contactB,normal)).scale(jr)) 
  }

  s1.update();
  s2.update();
}

function applyForces() {}

function handleCollision(environment) {
  for (let i = 0; i < environment.length; i++) {
    for (let j = i + 1; j < environment.length; j++) {
      const gjkResult = GJK(environment[i], environment[j]);
      if (!gjkResult.hasCollided) continue;
      const epaResult = EPA(gjkResult, environment[i], environment[j]);
      resolveCollision(epaResult, environment[i], environment[j]);
    }
  }
}

function move(circles, squares) {
  circles.map((c) => {
    const dt = 1/60;
    c.position.x += c.velocity.x * dt;
    c.position.y += c.velocity.y * dt;
    c.update();
  });

  squares.map((s) => {
    const dt = 1/60;

    let omega = new quaternion(0,s.angVel.x,s.angVel.y,s.angVel.z)
    s.orientation = s.orientation.add(s.orientation.mult(omega).scale(0.5*dt)).unitize();
    s.position.x += s.velocity.x * dt;
    s.position.y += s.velocity.y * dt;
    s.update();
  });
}

function createCircles(n) {
  const arr = [];

  // for (let i = 0; i < n; i++) {
  //   let circleSvg = document.createElementNS(
  //     "http://www.w3.org/2000/svg",
  //     "circle",
  //   );

  //   let radius = getRandom(10, 50);
  //   let pos = new Vector(getRandom(-0, 1000), getRandom(0, 1000), 0);
  //   let vel = new Vector(getRandom(-5, 5), getRandom(-5, 5), 0);
  //   let mass = radius * radius;
  //   let circle = new Circle(circleSvg, radius, pos, vel, mass);
  //   arr.push(circle);
  // }

  // let circleSvg = document.createElementNS(
  //   "http://www.w3.org/2000/svg",
  //   "circle",
  // );

  // let radius = 50;
  // let pos = new Vector(500, 500, 0);
  // let vel = new Vector(0, 0, 0);
  // let mass = 0;

  // let circle = new Circle(circleSvg, radius, pos, vel, mass);

  // arr.push(circle);
  return arr;
}

function createSquares(n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    let sqsvg = document.createElementNS("http://www.w3.org/2000/svg", "rect");

    let side = getRandom(100, 100);
    // let pos = new Vector(getRandom(0, 1000), getRandom(0, 1000), 0);
    let pos = new Vector(575,450, 0);
    // let vel = new Vector(getRandom(-1000, 1000), getRandom(-1000, 1000), 0);
    let vel = new Vector(0, 100, 0);
    let mass = side * side;
    let orientation = new quaternion(1,0,0,0);
    let mss = mass*side*side;
    let inertia = new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]);
    let omega = new Vector(0,0,0);
    // let angMom = inertia.multVec(omega);
    let angVel = omega;
    let square = new Square(sqsvg, pos, vel, side, mass,orientation,inertia,angVel);
    arr.push(square);
  }
  let sqsvg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let side = getRandom(100, 100);
  let pos = new Vector(450, 450, 0);
  let vel = new Vector(0, 100, 0);
  let mass = side * side;
  let orientation = new quaternion(1,0,0,0);
  let mss = mass*side*side;
  let inertia = new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]);
  let omega = new Vector(0,0,2*Math.PI/10);
  // let omega = new Vector(0,0,0);
  // let angMom = inertia.multVec(omega);
  
  let angVel = omega;
  // console.log(angMom)
  // console.log(angMom.magnitude())
  let square = new Square(sqsvg, pos, vel, side, mass,orientation,inertia,angVel);
  // arr.push(square);
  
  return arr;
}

function createBoundry() {
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

function createEnvironment(circlesRef, boundryRef, squareRef) {
  const circles = circlesRef.current;
  const boundry = boundryRef.current;
  const squares = squareRef.current;
  return [...circles, ...boundry, ...squares];
}

function Playground() {
  const [n, setN] = useState(1);

  const [frameNo, setFrameNo] = useState(0);
  const [t1, setT1] = useState(-1);
  const [t2, setT2] = useState(0);

  const circlesRef = useRef(createCircles(n));
  const squaresRef = useRef(createSquares(n));
  const boundryRef = useRef(createBoundry(n));

  const [isBoundry, setisBoundry] = useState(new Set([...boundryRef.current]));

  const environmentRef = useRef(
    createEnvironment(circlesRef, boundryRef, squaresRef),
  );

  const svgRef = useRef();

  useEffect(() => {
    const circles = circlesRef.current;
    const squares = squaresRef.current;
    const boundry = boundryRef.current;
    boundry.map((b) => svgRef.current.appendChild(b.squareSvg));
    circles.map((c) => svgRef.current.appendChild(c.circleSvg));
    squares.map((s) => svgRef.current.appendChild(s.squareSvg));
  }, []);

  useEffect(() => {
    let frameId;
    function animate() {}

    // frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  let frameId;
  function animate() {
    const circles = circlesRef.current;
    const squares = squaresRef.current;
    const environment = environmentRef.current;

    applyForces();
    handleCollision(environment);
    move(circles, squares);

    setFrameNo((f) => {
      if (f >= 300) return f;
      frameId = requestAnimationFrame(animate);
      return f + 1;
    });
  }

  const nextFrame = () => {
    const circles = circlesRef.current;
    const squres = squaresRef.current;
    requestAnimationFrame(animate);
  };



  return (
    <div className="playground">
      <button onClick={nextFrame}>Next Frame</button>
      <button onClick={nextFrame}>Stop</button>
      <svg viewBox="0 0 1000 1000" className="boundingBox" ref={svgRef}>
        {/* <rect x={0} y={0} height={1000} width={1000} fill='white'></rect> */}
      </svg>
    </div>
  );
}

export default Playground;
