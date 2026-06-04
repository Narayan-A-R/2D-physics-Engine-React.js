import { RigidBody } from "./RigidBody";
import { Vector } from "../../utils/maths/vector";

export class Circle extends RigidBody {
  constructor(svg, radius, pos, vel, mass,orientation,inertia,angVel) {
    super(pos, vel, mass,orientation,inertia,angVel);
    this.svg = svg;
    this.radius = radius;
    this.svg.setAttribute("cx", pos.x);
    this.svg.setAttribute("cy", pos.y);
    this.svg.setAttribute("r", radius);
    this.svg.setAttribute("fill", "var(--primary)");
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
    this.svg.setAttribute("cx", this.position.x);
    this.svg.setAttribute("cy", this.position.y);
  }
}
