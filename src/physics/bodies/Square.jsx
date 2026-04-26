import { Vector } from "../../utils/maths/vector";
import { RigidBody } from "./RigidBody";
export class Square extends RigidBody {
  constructor(sqSvg, pos, vel, side, mass) {
    super(pos, vel, mass);
    this.side = side;
    this.squareSvg = sqSvg;
    this.squareSvg.setAttribute("x", pos.x);
    this.squareSvg.setAttribute("y", pos.y);
    this.squareSvg.setAttribute("height", side);
    this.squareSvg.setAttribute("width", side);
    this.squareSvg.setAttribute("fill", "red");
  }

  supportFunc(dir) {
    let x = dir.x >= 0 ? this.position.x + this.side : this.position.x;
    let y = dir.y >= 0 ? this.position.y + this.side : this.position.y;
    return new Vector(x, y, 0);
  }

  update() {
    this.squareSvg.setAttribute("x", this.position.x);
    this.squareSvg.setAttribute("y", this.position.y);
  }
}
