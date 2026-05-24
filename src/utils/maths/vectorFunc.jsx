import { Vector } from "./vector";
export function cross(v1, v2) {
  return new Vector(
    v1.y * v2.z - v1.z * v2.y,
    v1.z * v2.x - v1.x * v2.z,
    v1.x * v2.y - v1.y * v2.x,
  );
}

export function dot(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function sameDirection(d1, d2) {
  return dot(d1, d2) > 0;
}

export function lerp(a,b,t){
  return a.add(b.sub(a).scale(t))
}