export class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v2) {
    return new Vector(this.x + v2.x, this.y + v2.y, this.z + v2.z);
  }

  sub(v2) {
    return new Vector(this.x - v2.x, this.y - v2.y, this.z - v2.z);
  }

  scale(k = 1) {
    return new Vector(this.x * k, this.y * k, this.z * k);
  }

  magnitude() {
    const magnitude = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z,
    );
    return magnitude;
  }

  unitize() {
    const magnitude = Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z,
    );
    if (magnitude === 0) return new Vector(0, 0, 0);
    return new Vector(
      this.x / magnitude,
      this.y / magnitude,
      this.z / magnitude,
    );
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }
}
