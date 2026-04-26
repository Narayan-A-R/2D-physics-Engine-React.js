import { Vector } from "../../utils/maths/vector";
import { dot, sameDirection, cross } from "../../utils/maths/vectorFunc";
import { findSupportPoint } from "../support";

function addIfUniqueEdge(edges, faces, a, b) {
  const reverse = edges.map((e, i) => {
    if ([faces[b], faces[a]] == e) return i;
  });
  if (i < edges.length) {
    edges[reverse] = edges.at(-1);
    edges.pop();
  } else {
    edges.push([faces[a], faces[b]]);
  }
}

function getFaceNormals(polytope, faces) {
  const normals = [];
  let minDistance = Infinity;
  let minTriangle = 0;
  for (let i = 0; i < faces.length; i += 3) {
    const a = polytope[faces[i]];
    const b = polytope[faces[i + 1]];
    const c = polytope[faces[i + 2]];
    let normal = cross(b.sub(a), c.sub(a)).unitize();
    const distance = dot(normal, a);
    console.log(normal);
    console.log(a);
    if (distance < 0) {
      normal.scale(-1);
      distance *= -1;
    }

    normals.push({ normal, distance });
    if (distance < minDistance) {
      minTriangle = i / 3;
      minDistance = distance;
    }
  }

  return [normals, minTriangle];
}

function EPA3D(polytope, s1, s2) {
  const faces = [0, 1, 2, 0, 3, 1, 0, 2, 3, 1, 3, 2];

  let [normals, minFaceInd] = getFaceNormals(polytope, faces);
  let minNormal = new Vector();
  let minDistance = Infinity;

  while (minDistance === Infinity) {
    minNormal = normals[minFaceInd].normal;
    minDistance = normals[minFaceInd].distance;
    const supportPoint = findSupportPoint(s1, s2, minNormal);

    const sDistance = dot(minNormal, supportPoint);

    if (Math.abs(sDistance - minDistance) > 0.001) {
      minDistance = Infinity;
      const uniqueEdges = [];
      for (let i = 0; i < normals.length; i++) {
        if (sameDirection(normals, supportPoint)) {
          const f = i * 3;
          addIfUniqueEdge(uniqueEdges, faces, f, f + 1);
          addIfUniqueEdge(uniqueEdges, faces, f + 1, f + 2);
          addIfUniqueEdge(uniqueEdges, faces, f + 2, f);

          faces[f + 2] = faces.at(-1);
          faces.pop();
          faces[f + 1] = faces.at(-1);
          faces.pop();
          faces[f] = faces.at(-1);
          faces.pop();

          normals[i] = normals.at(-1);
          normals.pop();

          i--;
        }
      }

      const newFaces = [];
      for (const [edgeInd1, edgeInd2] of uniqueEdges) {
        newFaces.push(edgeInd1);
        newFaces.push(edgeInd2);
        newFaces.push(polytope.length);
      }
      polytope.push(supportPoint);

      const [newNormals, newMinFace] = getFaceNormals(polytope, newFaces);

      let oldMinDist = Infinity;
      for (let i = 0; i < normals.length; i++) {
        if (normals[i].distance < oldMinDist) {
          oldMinDist = normals[i].distance;
          minFaceInd = i;
        }
      }
      if (newNormals[newMinFace].distance < oldMinDist) {
        minFaceInd = newMinFace + normals.length;
      }
      faces.push(...newFaces);
      normals.push(...newNormals);
    }
  }
  return minNormal.scale(minDistance + 0.001);
}

function EPA2D(polytope, s1, s2) {
//   console.log([...polytope]);
  while (true) {
    let minIndex = 0;
    let minDistance = Infinity;
    let minNormal;
    for (let i = 0; i < polytope.length; i++) {
      let j = (i + 1) % polytope.length;

      let vertexI = polytope[i];
      let vertexJ = polytope[j];

      let ij = vertexJ.sub(vertexI);
      // console.log(vertexJ)
      // console.log(ij)
      let normal = cross(ij, new Vector(0, 0, 1)).unitize();
      // console.log(normal)
      // console.log(minNormal)

      if (dot(vertexI, normal) < 0) {
        normal = normal.scale(-1);
      }
      let distance = dot(vertexI, normal);
      if (distance < minDistance) {
        minDistance = distance;
        minIndex = j;
        minNormal = normal;
      }
    }
    // console.log(minNormal)
    let supportpoint = findSupportPoint(s1, s2, minNormal);
    let sDistance = dot(minNormal, supportpoint);

    // console.log(minDistance)
    if (Math.abs(sDistance - minDistance) < 0.0001) {
      // console.log(minNormal.scale(minDistance))
      return minNormal.scale(minDistance + 0.001);
    }
    polytope.splice(minIndex, 0, supportpoint);
    minDistance = Infinity;
  }
}

function EPA1D(simplex, s1, s2) {
  const [b, a] = simplex;
  if (b.magnitude() < a.magnitude()) return b;
  return a;
}

export function EPA(gjk, s1, s2) {
  const simplex = gjk.simplex;
  switch (simplex.length) {
    case 2:
      return EPA1D(simplex, s1, s2);
    case 3:
      return EPA2D(simplex, s1, s2);
    case 4:
      return EPA3D(simplex, s1, s2);
    default:
      return new Vector(0, 0, 0);
  }
}
