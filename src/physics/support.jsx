export function findSupportPoint(s1, s2, dir) {
  return s1.supportFunc(dir).sub(s2.supportFunc(dir.scale(-1)));
}
