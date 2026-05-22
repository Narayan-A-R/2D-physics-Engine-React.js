export function findSupportPoint(s1, s2, dir) {
  return {
     minkowskiDIff:s1.supportFunc(dir).sub(s2.supportFunc(dir.scale(-1))),
     supp1: s1.supportFunc(dir),
     supp2: s2.supportFunc(dir.scale(-1)),
     dir:dir
  };
}
