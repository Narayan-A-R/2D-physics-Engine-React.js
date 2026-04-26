import { Vector } from "../../utils/maths/vector";
import { ORIGIN } from "../../utils/maths/constants";
import { dot, cross, sameDirection } from "../../utils/maths/vectorFunc";
import { findSupportPoint } from "../support";

function getNormal(v1, v2) {
  let normal = cross(cross(v1, v2), v1);
  if (normal.magnitude() > 0) return normal.unitize();
  let usableV = new Vector(1, 0, 0);
  if (v1.magnitude() === 0 && v2.magnitude() === 0) return usableV.unitize();
  if (v1.magnitude() !== 0) usableV = v1;
  if (v2.magnitude() !== 0) usableV = v2;
  const axes = [new Vector(1, 0, 0), new Vector(0, 1, 0), new Vector(0, 0, 1)];

  let leastAlignedAxis = axes[0];
  for (const axis of axes) {
    if (
      Math.abs(dot(usableV, axis)) < Math.abs(dot(leastAlignedAxis, usableV))
    ) {
      leastAlignedAxis = axis;
    }
  }
  normal = cross(cross(usableV, leastAlignedAxis), usableV);
  return normal.unitize();
}

function lineCase(simplex, dir) {
  const b = simplex[0];
  const a = simplex[1];
  const ao = ORIGIN.sub(a);
  const ab = b.sub(a);
  const ab_perp = getNormal(ab, ao);
  // epsilon
  if (ab_perp.magnitude() == 0) {
    return true;
  }
  dir.copy(ab_perp);
  return false;
}

function triangleCase(simplex, dir) {
  const c = simplex[0];
  const b = simplex[1];
  const a = simplex[2];

  const ab = b.sub(a);
  const ac = c.sub(a);
  const ao = ORIGIN.sub(a);

  const abc_perp = cross(ab, ac);

  const ab_perp = cross(ab, abc_perp).unitize();
  const ac_perp = cross(abc_perp, ac).unitize();

  if (sameDirection(ab_perp, ao)) {
    simplex.splice(0, 1);
    dir.copy(ab_perp);
    return false;
  }

  if (sameDirection(ac_perp, ao)) {
    simplex.splice(1, 1);
    dir.copy(ac_perp);
    return false;
  }

  // epsilon
  if (!sameDirection(ao, abc_perp) && !sameDirection(ao, abc_perp.scale(-1))) {
    return true;
  }

  if (sameDirection(abc_perp, ao)) {
    dir.copy(abc_perp);
    return false;
  }

  simplex = [a, c, b];
  dir.copy(abc_perp.scale(-1));
  return false;
}

function tetrahedronCase(simplex, dir) {
  const d = simplex[0];
  const c = simplex[1];
  const b = simplex[2];
  const a = simplex[3];

  const ad = d.sub(a);
  const ab = b.sub(a);
  const ac = c.sub(a);
  const ao = ORIGIN.sub(a);

  const abc_perp = cross(ab, ac);
  const acd_perp = cross(ac, ad);
  const adb_perp = cross(ad, ab);

  if (sameDirection(abc_perp, ao)) {
    console.log(1);
    simplex.splice(0, 1);
    dir.copy(abc_perp);
    return false;
  }
  if (sameDirection(acd_perp, ao)) {
    console.log(2);
    simplex.splice(1, 1);
    dir.copy(acd_perp);
    return false;
  }
  if (sameDirection(adb_perp, ao)) {
    console.log(3);
    simplex.splice(2, 1);
    dir.copy(adb_perp);
    return false;
  }
  return true;
}

function updateSimplex(simplex, dir) {
  switch (simplex.length) {
    case 2:
      return lineCase(simplex, dir);
    case 3:
      return triangleCase(simplex, dir);
    case 4:
      return tetrahedronCase(simplex, dir);
    default:
      return false;
  }
}

export function GJK(s1, s2) {
  const randDir = new Vector(1, 0, 0);
  let supportPoint = findSupportPoint(s1, s2, randDir);
  const simplex = [];
  let dir = ORIGIN.sub(supportPoint);

  simplex.push(supportPoint);
  let i = 0;
  while (true && i < 1000) {
    supportPoint = findSupportPoint(s1, s2, dir);
    if (dot(supportPoint, dir) < 0)
      return { simplex: simplex, hasCollided: false };
    simplex.push(supportPoint);
    if (updateSimplex(simplex, dir))
      return { simplex: simplex, hasCollided: true };
    i++;
  }
}
