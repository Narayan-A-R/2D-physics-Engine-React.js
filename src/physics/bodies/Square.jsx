import { quatSandwich } from "../../utils/maths/quaternion";
import { Vector } from "../../utils/maths/vector";
import { dot } from "../../utils/maths/vectorFunc";
import { RigidBody } from "./RigidBody";
export class Square extends RigidBody {
  constructor(sqSvg, pos, vel, side, mass,orientation,inertia,angMom) {
    super(pos, vel, mass,orientation,inertia,angMom);
    this.side = side;
    this.squareSvg = sqSvg;
    this.squareSvg.setAttribute("x", pos.x);
    this.squareSvg.setAttribute("y", pos.y);
    this.squareSvg.setAttribute("height", side);
    this.squareSvg.setAttribute("width", side);
    this.squareSvg.setAttribute("fill", "red");
  }

  supportFunc(dir) {

    let q1 = quatSandwich(dir,this.orientation.inv());
    console.log(q1)
    dir = new Vector(q1.x,q1.y,q1.z);

    let posX = new Vector(1,0,0);
    let negX = new Vector(-1,0,0);
    let posY = new Vector(0,1,0);
    let negY = new Vector(0,-1,0);
    let v  = new Vector();

    if(inbetween(posX,dir,posY)){
      v = new Vector(this.side/2,this.side/2,0);
    }
    else if(inbetween(negX,dir,posY)){
      v = new Vector(-this.side/2,this.side/2,0);
    }
    else if(inbetween(negX,dir,negY)){
      v = new Vector(-this.side/2,-this.side/2,0);
    }
    else{
      v = new Vector(this.side/2,-this.side/2,0);
    }
    let q2 = quatSandwich(v,this.orientation);
    let supPoint = new Vector(q2.x,q2.y,q2.z);
    let cornerToCenter = new Vector(this.side/2,this.side/2,0);
    supPoint = this.position.add(cornerToCenter.add(supPoint))
    return supPoint;

  }

  update() {
    this.squareSvg.setAttribute("x", this.position.x);
    this.squareSvg.setAttribute("y", this.position.y);
    let theta = 2* Math.atan(this.orientation.z/this.orientation.w)*180/Math.PI;
    console.log(theta)
    this.squareSvg.setAttribute("transform",`rotate(${theta} ${this.position.x+this.side/2} ${this.position.y+this.side/2})`)
  }
}


function inbetween(v1,v,v2){
  return dot(v1,v)>=0 && dot(v,v2)>=0
}