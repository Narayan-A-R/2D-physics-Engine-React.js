export class RigidBody {
  constructor(pos, vel, mass,orientation,inertia,angMom) {
    this.position = pos;
    this.velocity = vel;
    this.mass = mass;
    if (this.mass === 0) {
      this.invMass = 0;
    } else {
      this.invMass = 1 / this.mass;
    }
    this.orientation = orientation;
    this.inertia = inertia;
    this.invInertia = inertia.inv();
    this.angMom = angMom;
  }

  supportFunc(dir) {
    throw new Error("support not implemented in child class");
  }
}
