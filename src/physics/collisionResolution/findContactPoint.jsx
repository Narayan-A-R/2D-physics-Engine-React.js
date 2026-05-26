import { dot,cross } from "../../utils/maths/vectorFunc";
import { lerp } from "../../utils/maths/vectorFunc";

function findVertexProjectionOnEdge(p, v1, v2) {
    let v1ToP = p.sub(v1);
    let v1ToV2 = v2.sub(v1);

    let lenSq = dot(v1ToV2, v1ToV2);
    if (lenSq === 0) return v1

    let t = dot(v1ToV2, v1ToP) / lenSq;

    t = Math.max(0, Math.min(1, t));

    return lerp(v1, v2, t);
}

function findVertexEdgePerpDist(p,v1,v2){
  let v1ToP = p.sub(v1);
  let v1ToV2 = v2.sub(v1);

  let perp = cross(v1ToP,v1ToV2)
  return perp.magnitude()/v1ToV2.magnitude();
}


function distancePointToEdge(p, v1, v2) {
  let proj = findVertexProjectionOnEdge(p, v1, v2);
  return p.sub(proj).magnitude();
}

function distanceEdgeToEdge(a1, a2, b1, b2) {
  // endpoints of A to edge B
  let d1 = distancePointToEdge(a1, b1, b2);
  let d2 = distancePointToEdge(a2, b1, b2);

  // endpoints of B to edge A
  let d3 = distancePointToEdge(b1, a1, a2);
  let d4 = distancePointToEdge(b2, a1, a2);

  return Math.min(d1, d2, d3, d4);
}

function findContactPointPolyPoly(s1, s2) {
  let vertices1 = s1.getVertices()
  let vertices2 = s2.getVertices()

  console.log(vertices1)
  console.log(vertices2)
  let minDist = Infinity;
  let edge1 = []
  let edge2 = []
  let contactPoints = []

  for (let i = 0; i < vertices1.length; i++) {
    let a1 = vertices1[i];
    let a2 = vertices1[(i + 1) % vertices1.length];

    for (let j = 0; j < vertices2.length; j++) {
      let b1 = vertices2[j];
      let b2 = vertices2[(j + 1) % vertices2.length];

      let dist = distanceEdgeToEdge(a1, a2, b1, b2);

      if(dist === minDist){
          let newSum =
          distancePointToEdge(b1, a1, a2) +
          distancePointToEdge(b2, a1, a2);

        // how close previously stored edge is to edge1
        let oldSum =
          distancePointToEdge(edge2[0], a1, a2) +
          distancePointToEdge(edge2[1], a1, a2);

        // prefer the edge whose whole segment is closer
        if (newSum < oldSum) {
          edge1 = [a1, a2];
          edge2 = [b1, b2];
        }
      }
      if (dist < minDist) {
        minDist = dist
        edge1 = [a1, a2];
        edge2 = [b1, b2];
      }
    }
  }

  let [a1,a2] = edge1;
  let [b1,b2] = edge2
  let perpDist1 = findVertexEdgePerpDist(b1,a1,a2)
  let perpDist2 = findVertexEdgePerpDist(b2,a1,a2)

  console.log(edge1)
  console.log(edge2)

  console.log(perpDist1)
  console.log(perpDist2)
  if(perpDist1 !== perpDist2){
    if(perpDist1<perpDist2){
      contactPoints = [b1]
    }
    else{
      contactPoints = [b2]
    }
    console.log("helllo")
  }
  else{
    let lenb1b2 = b2.sub(b1).magnitude();
    let lena1a2 = a2.sub(a1).magnitude();
    
    if(lenb1b2 < lena1a2){
      
      let projb1 = findVertexProjectionOnEdge(b1,a1,a2)
      let projb2 = findVertexProjectionOnEdge(b2,a1,a2)
      console.log(projb1)
      if(projb1.equalTo(a1) || projb2.equalTo(a1)){
        contactPoints = [findVertexProjectionOnEdge(a1,b1,b2)]
      }
      else if(projb1.equalTo(a2) || projb2.equalTo(a2)){
        contactPoints = [findVertexProjectionOnEdge(a2,b1,b2)]
      }
      else {
        contactPoints = [b1.add(b2).scale(0.5)]
      }
    }
    else{
      let proja1 = findVertexProjectionOnEdge(a1,b1,b2)
      let proja2 = findVertexProjectionOnEdge(a2,b1,b2)
      if(proja1.equalTo(b1) || proja1.equalTo(b2)){
        contactPoints.push(proja2)
      }
      if(proja2.equalTo(b1) || proja2.equalTo(b2)){
        contactPoints.push(proja1)
      }

      console.log(contactPoints)
      console.log(contactPoints)
      if(contactPoints.length>1){
        contactPoints = [contactPoints[0].add(contactPoints[1]).scale(0.5)]
      }
    }
  }
  console.log(contactPoints)
  return contactPoints;
}

function findContactPointPolyCirc(s1,s2){
  if(s1.shape==="circle"){
    [s1,s2] = [s2,s1]
  }
  let vertices = s1.getVertices();
  let minDist = Infinity;
  let closestV = vertices[0];
  for (let i = 0; i < vertices.length; i++) {
    let v1 = vertices[i];
    let v2 = vertices[ (i+1) % vertices.length]
    let edgePoint = findVertexProjectionOnEdge(s2.getCenter(),v1,v2)
    let edgePointToCenter = s2.getCenter().sub(edgePoint)
    if( edgePointToCenter.magnitude() < minDist){
      minDist = edgePointToCenter.magnitude()
      closestV = edgePoint
    }
  }
  return [closestV]
}

function findContactPointCircPoly(s1,s2){
  let vertices = s2.getVertices()
  let minDist = Infinity;
  let closesetV = vertices[0];
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i];
    let centerToV = v.sub(s1.getCenter())
    if(centerToV.magnitude() < minDist){
      minDist = centerToV.magnitude()
      closesetV = v
    }
  }

  let centerToV = closesetV.sub(s1.getCenter())
  return [s1.supportFunc(centerToV)]
}

function findContactPointCircCirc(s1,s2){
  let s1Tos2 = s2.getCenter().sub(s1.getCenter())
  return [s1.supportFunc(s1Tos2)]
}

export function findContactPoint(s1,s2){
  console.log(s1,s2)
  if(s1.shape === "circle"){
    if(s2.shape === "circle"){
      return findContactPointCircCirc(s1,s2)
    }
    else{
      return findContactPointPolyCirc(s1,s2)
    }
  }
  else{
    if(s2.shape === "circle"){
      return findContactPointPolyCirc(s1,s2)
    }
    else{
      return findContactPointPolyPoly(s1,s2)
    }
  }
}