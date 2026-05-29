import { useRef, useState, useEffect } from "react";
import "./Playground.css";
import { Vector } from "./utils/maths/vector";
import { dot, cross, sameDirection } from "./utils/maths/vectorFunc";
import { GJK } from "./physics/collisionDetection/GJK";
import { findSupportPoint } from "./physics/support";
import { EPA } from "./physics/collisionResolution/EPA";
import { quaternion } from "./utils/maths/quaternion";
import { findContactPoint } from "./physics/collisionResolution/findContactPoint";
import { dt } from "./utils/maths/constants";
import { createRandomCircles,createRandomSquares,createBoundry } from "./physics/bodies/createBodies";

function resolveCollision(epaResult, s1, s2) {
  let {penetrationVec:p} = epaResult
  let s1Tos2 = s2.position.sub(s1.position)
  if (!sameDirection(p, s1Tos2)) p = p.scale(-1);

  let totInvMass = s1.invMass + s2.invMass;
  if (totInvMass === 0) return;

  s1.position = s1.position.sub(p.scale(s1.invMass / totInvMass));
  s2.position = s2.position.add(p.scale(s2.invMass / totInvMass));

  let contactPoints = findContactPoint(s1,s2)
  let contactPoint = new Vector(0,0,0)

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

  let e = 0.7;
  let sf = 0.6;
  let df = 0.4;

  let I1_body = s1.inertia;
  let R1 = s1.orientation.toRotMat();
  let I1_world = R1.mult(I1_body.mult(R1.transpose()));
  let I1_world_inv = I1_world.inv(); 

  let I2_body = s2.inertia;
  let R2 = s2.orientation.toRotMat();
  let I2_world = R2.mult(I2_body.mult(R2.transpose()));
  let I2_world_inv = I2_world.inv();

  let rotMass = dot(
    I1_world_inv.multVec(cross(cross(r1,normal),r1)).add(
    I2_world_inv.multVec(cross(cross(r2,normal),r2)))
    ,normal)


  let jr = (-(1 + e) * speedAlongNormal)/(s1.invMass+s2.invMass+rotMass)

  let tangent = relVelocity.sub(normal.scale(dot(relVelocity,normal)))
  tangent = tangent.unitize()
  if (tangent.magnitude() > 1e-8) tangent.unitize()
  else tangent = new Vector(0,0,0)

  let speedAlongTangent = dot(relVelocity,tangent)
  let rotMassTangent = dot(
    I1_world_inv.multVec(cross(cross(r1,tangent),r1)).add(
    I2_world_inv.multVec(cross(cross(r2,tangent),r2)))
    ,tangent)

  let jt = -speedAlongTangent / (s1.invMass + s2.invMass + rotMassTangent)

  let maxFriction = sf*jr;
  jt=Math.max(-maxFriction, Math.min(maxFriction, jt));


  let frictionImpulse = tangent.scale(jt)
  // if (Math.abs(jt) <= jr*sf) {
  //   frictionImpulse = tangent.scale(jt)
  // } else {
  //   frictionImpulse = tangent.scale(-jr*df * Math.sign(jt))
  // }

  let impulse = normal.scale(jr).add(frictionImpulse)

  if (s1.invMass !== 0){
    s1.velocity = s1.velocity.sub(impulse.scale(s1.invMass));
    s1.angVel = s1.angVel.sub(I1_world_inv.multVec(cross(r1,impulse)))
  }
  if (s2.invMass !== 0){
    console.log(s2.velocity)
    s2.velocity = s2.velocity.add(impulse.scale(s2.invMass));
    console.log(s2.velocity)
    s2.angVel = s2.angVel.add(I2_world_inv.multVec(cross(r2,impulse)))
  }


  s1.update();
  s2.update();

}

function applyForces(circles,squares) {
  let g = new Vector(0,0,0)
  circles.map((c) => {
    c.velocity = c.velocity.add(g.scale(dt))
  });
  squares.map((s) => {
    s.velocity = s.velocity.add(g.scale(dt))
  });
}

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
    let omega = new quaternion(0,c.angVel.x,c.angVel.y,c.angVel.z)
    c.orientation = c.orientation.add(omega.mult(c.orientation).scale(0.5*dt)).unitize();
    c.position = c.position.add(c.velocity.scale(dt))
    c.update();
  });

  squares.map((s) => {
    let omega = new quaternion(0,s.angVel.x,s.angVel.y,s.angVel.z)
    s.orientation = s.orientation.add(omega.mult(s.orientation).scale(0.5*dt)).unitize();
    s.position = s.position.add(s.velocity.scale(dt))
    s.update();
  });
}


function createCircles(n) {
  return createRandomCircles(n)
}

function createSquares(n) {
  return createRandomSquares(n);
}


function createEnvironment(circlesRef, boundryRef, squareRef) {
  const circles = circlesRef.current;
  const boundry = boundryRef.current;
  const squares = squareRef.current;
  return [...circles, ...boundry, ...squares];
}

function Playground() {
  const [n, setN] = useState(10);

  const [frameNo, setFrameNo] = useState(0);
  const [t1, setT1] = useState(-1);
  const [t2, setT2] = useState(0);
  const [isRunning, setIsRunning] = useState(true)

  const circlesRef = useRef(createCircles(n));
  const squaresRef = useRef(createSquares(n));
  const boundryRef = useRef(createBoundry(n));
  const frameIdRef = useRef(null);


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

  useEffect(()=>{
    if(isRunning){
      frameIdRef.current = requestAnimationFrame(animate)
    }
    else{
      cancelAnimationFrame(frameIdRef.current)
    }
    return ()=> cancelAnimationFrame(frameIdRef.current)
  },[isRunning])

  function runWorld(){
    const circles = circlesRef.current;
    const squares = squaresRef.current;
    const environment = environmentRef.current;

    handleCollision(environment);
    applyForces(circles,squares);
    move(circles, squares);
  }

  function animate() {
    runWorld();
    setFrameNo((f) => {
      if (f >= 3000){
        return f;
      }
      return f + 1;
    });
    frameIdRef.current = requestAnimationFrame(animate);
  }

  const nextFrame = () => {
    runWorld();
    setFrameNo((f) => {
      if (f >= 3000) return f;
      return f + 1;
    });
  };

  return (
    <div className="playground">
      <button onClick={nextFrame}>Next Frame</button>
      <button onClick={()=> setIsRunning((r)=>!r)}>
        {isRunning?"Stop":"Start"}
      </button>
      <svg viewBox="0 0 1000 1000" className="boundingBox" ref={svgRef}>
        {/* <rect x={0} y={0} height={1000} width={1000} fill='white'></rect> */}
      </svg>
    </div>
  );
}

export default Playground;
