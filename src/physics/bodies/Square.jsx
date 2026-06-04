import { quatSandwich } from "../../utils/maths/quaternion";
import { Vector } from "../../utils/maths/vector";
import { dot } from "../../utils/maths/vectorFunc";
import { quaternion } from "../../utils/maths/quaternion";
import { RigidBody } from "./RigidBody";
export class Square extends RigidBody {
  constructor(svg, pos, vel, side, mass,orientation,inertia,angVel) {
    super(pos, vel, mass,orientation,inertia,angVel);
    this.side = side;
    this.svg = svg;
    this.svg.setAttribute("x", pos.x);
    this.svg.setAttribute("y", pos.y);
    this.svg.setAttribute("height", side);
    this.svg.setAttribute("width", side);
    this.svg.setAttribute("fill", "red");
    this.shape = "square";
  }

  getCenter(){
    return this.position.add(new Vector(this.side/2,this.side/2,0));
  }

  getVertices(){
    let vertices = [
      new Vector(this.side/2,this.side/2,0),
      new Vector(-this.side/2,this.side/2,0),
      new Vector(-this.side/2,-this.side/2,0),
      new Vector(this.side/2,-this.side/2,0)
    ];

    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      let quat_v = quatSandwich(v,this.orientation)
      vertices[i] = new Vector(quat_v.x,quat_v.y,quat_v.z).add(this.getCenter())
    }
    return vertices;
  }
  supportFunc(dir) {

    let q1 = quatSandwich(dir,this.orientation.inv());
    dir = new Vector(q1.x,q1.y,q1.z);
    dir = dir.unitize()
    let posX = new Vector(1,0,0);
    let negX = new Vector(-1,0,0);
    let posY = new Vector(0,1,0);
    let negY = new Vector(0,-1,0);
    let v  = new Vector();

    if(dot(dir,posX)===1){
      v = new Vector(this.side/2,0,0)
    }
    else if(dot(dir,posY)===1){
      v = new Vector(0,this.side/2,0)
    }
    else if(dot(dir,negX)===1){
      v = new Vector(-this.side/2,0,0)
    }
    else if(dot(dir,negY)===1){
      v = new Vector(0,-this.side/2,0)
    }
    else if(inbetween(posX,dir,posY)){
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
    this.svg.setAttribute("x", this.position.x);
    this.svg.setAttribute("y", this.position.y);
    let theta = 2* Math.atan(this.orientation.z/this.orientation.w)*180/Math.PI;
    this.svg.setAttribute("transform",`rotate(${theta} ${this.position.x+this.side/2} ${this.position.y+this.side/2})`)
  }
}


function inbetween(v1,v,v2){
  return dot(v1,v)>=0 && dot(v,v2)>=0
}