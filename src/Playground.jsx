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
import { lerp } from "./utils/maths/vectorFunc";
import { findContactPoint } from "./physics/collisionResolution/findContactPoint";


function resolveCollision(epaResult, s1, s2) {
  let {penetrationVec:p} = epaResult
  let s1Tos2 = s2.position.sub(s1.position);
  if (!sameDirection(p, s1Tos2)) p = p.scale(-1);

  let totInvMass = s1.invMass + s2.invMass;
  if (totInvMass === 0) return;

  s1.position = s1.position.sub(p.scale(s1.invMass / totInvMass));
  s2.position = s2.position.add(p.scale(s2.invMass / totInvMass));

  let e = 0.8;
  let sf = 0.6;
  let df = 0.4;

  let contactPoints = findContactPoint(s1,s2)
  let contactPoint = new Vector(0,0,0)

  let I1_body = s1.inertia;
  let R1 = s1.orientation.toRotMat();
  let I1_world = R1.mult(I1_body.mult(R1.transpose()));
  let I1_world_inv = I1_world.inv(); 

  let I2_body = s2.inertia;
  let R2 = s2.orientation.toRotMat();
  let I2_world = R2.mult(I2_body.mult(R2.transpose()));
  let I2_world_inv = I2_world.inv();

  for (let i = 0; i < contactPoints.length; i++) {
    contactPoint = contactPoint.add(contactPoints[i])
  }
  contactPoint=contactPoint.scale(1/contactPoints.length)

  let cp = contactPoint;
  let r1 = cp.sub(s1.getCenter())
  let r2 = cp.sub(s2.getCenter())

  let v1 = s1.velocity.add(cross(s1.angVel, r1));
  let v2 = s2.velocity.add(cross(s2.angVel, r2));
  
  let relVelocity = v2.sub(v1);

  let normal = p.unitize();
  let speedAlongNormal = dot(relVelocity, normal);

  if (speedAlongNormal > 0) return;

  let rotMass = dot(
    I1_world_inv.multVec(cross(cross(r1,normal),r1)).add(
    I2_world_inv.multVec(cross(cross(r2,normal),r2)))
    ,normal)

  let jr = (-(1 + e) * speedAlongNormal)/(s1.invMass+s2.invMass+rotMass)

  let tangent = relVelocity.sub(normal.scale(dot(relVelocity,normal)))
  tangent = tangent.unitize()
  // if (tangent.magnitude() > 1e-8) tangent.unitize()
  // else continue;

  let speedAlongTangent = dot(relVelocity,tangent)
  let rotMassTangent = dot(
    I1_world_inv.multVec(cross(cross(r1,tangent),r1)).add(
    I2_world_inv.multVec(cross(cross(r2,tangent),r2)))
    ,tangent)

  let jt = -speedAlongTangent / (s1.invMass + s2.invMass + rotMassTangent)


  let frictionImpulse
  if (Math.abs(jt) <= jr*sf) {
    frictionImpulse = tangent.scale(jt)
  } else {
    frictionImpulse = tangent.scale(-jr*df * Math.sign(jt))
  }

  let impulse = normal.scale(jr).add(frictionImpulse)
  console.log(impulse)
  if (s1.invMass !== 0){
    s1.velocity = s1.velocity.sub(impulse.scale(s1.invMass));
    s1.angVel = s1.angVel.sub(I1_world_inv.multVec(cross(r1,impulse)))
  }
  if (s2.invMass !== 0){

    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));
    console.log(s2.velocity)
    s2.angVel = s2.angVel.add(I2_world_inv.multVec(cross(r2,impulse)))
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
    s.orientation = s.orientation.add(omega.mult(s.orientation).scale(0.5*dt)).unitize();
    s.position.x += s.velocity.x * dt;
    s.position.y += s.velocity.y * dt;

    s.update();
  });
}

function createCircles(n) {
  const arr = [];

  for (let i = 0; i < n; i++) {
    let circleSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );

    let radius = getRandom(50, 50);
    let pos = new Vector(getRandom(-0, 1000), getRandom(0, 1000), 0);
    // let pos = new Vector(600, 600, 0);
    let vel = new Vector(getRandom(100,100), getRandom(100, 100), 0);
    // let vel = new Vector(0,-100, 0);
    let mass = radius * radius;
    let orientation = new quaternion(1,0,0,0);
    let mrr = mass * radius* radius;
    let inertia = new Matrix([[mrr/4,0,0],[0,mrr/4,0],[0,0,mrr/2]])
    let angVel = new Vector(0,0,0)
    let circle = new Circle(circleSvg, radius, pos, vel, mass,orientation,inertia,angVel);
    // arr.push(circle);
  }

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

    // let pos = new Vector(getRandom(0, 1000), getRandom(0, 1000), 0);
    // let vel = new Vector(getRandom(-1000, 1000), getRandom(-1000, 1000), 0);
    let side = getRandom(100, 100);
    let pos = new Vector(500,400, 0);
    let vel = new Vector(-100, 0, 0);
    let mass = side * side;
    // let orientation = new quaternion(Math.cos(Math.PI/8),0,0,Math.sin(Math.PI/8));
    let orientation = new quaternion(1,0,0,0);
    let mss = mass*side*side;
    let inertia = new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]);
    let omega = new Vector(0,0,0);

    let angVel = omega;
    let square = new Square(sqsvg, pos, vel, side, mass,orientation,inertia,angVel);
    arr.push(square);
  }
  let sqsvg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  let side = getRandom(100, 100);
  let pos = new Vector(300, 400, 0);
  let vel = new Vector(100, 0, 0);
  let mass = side * side;
  let orientation = new quaternion(1,0,0,0);
  let mss = mass*side*side;
  let inertia = new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]);
  let omega = new Vector(0,0,0);

  let angVel = omega;

  let square = new Square(sqsvg, pos, vel, side, mass,orientation,inertia,angVel);
  arr.push(square);
  
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
      if (f >= 4000){
        return f;
      }
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
