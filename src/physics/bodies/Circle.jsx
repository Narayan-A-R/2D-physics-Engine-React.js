import { RigidBody } from "./RigidBody";
import { Vector } from "../../utils/maths/vector";

export class Circle extends RigidBody {
  constructor(circleSvg, radius, pos, vel, mass,orientation,inertia,angVel) {
    super(pos, vel, mass,orientation,inertia,angVel);
    this.circleSvg = circleSvg;
    this.radius = radius;
    this.circleSvg.setAttribute("cx", pos.x);
    this.circleSvg.setAttribute("cy", pos.y);
    this.circleSvg.setAttribute("r", radius);
    this.circleSvg.setAttribute("fill", "var(--primary)");
    this.shape = "circle";
  }

  getCenter(){
    return new Vector(this.position.x,this.position.y,this.position.z)
  }

  supportFunc(dir) {
    dir = dir.unitize();
    dir = dir.scale(this.radius);
    dir = dir.add(this.position);
    return new Vector(dir.x, dir.y, 0);
  }

  update() {
    this.circleSvg.setAttribute("cx", this.position.x);
    this.circleSvg.setAttribute("cy", this.position.y);
  }
}
