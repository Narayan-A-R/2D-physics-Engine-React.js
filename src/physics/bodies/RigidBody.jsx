export class RigidBody {
  constructor(pos, vel, mass) {
    this.position = pos;
    this.velocity = vel;
    this.mass = mass;
    if (this.mass === 0) {
      this.invMass = 0;
    } else {
      this.invMass = 1 / this.mass;
    }
  }

  supportFunc(dir) {
    throw new Error("support not implemented in child class");
  }
}
