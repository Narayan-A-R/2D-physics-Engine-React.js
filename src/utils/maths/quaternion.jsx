import { Matrix } from "./matrix";
export class quaternion {
  constructor(w=0,x=0,y=0,z=0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  mult(q){
    return new quaternion( 
        this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
        this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
        this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
        this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w
    )
  }

  add(q){
    return new quaternion(
        this.w+q.w,
        this.x+q.x,
        this.y+q.y,
        this.z+q.z
    );
  }

  unitize(){
    if(this.magnitude()===0){
        return new quaternion(0,0,0,0);
    }
    return new quaternion(this.w,this.x,this.y,this.z).scale(1/this.magnitude())
  }

  scale(k=1){
    return new quaternion(this.w*k,this.x*k,this.y*k,this.z*k);
  }

  magnitude(){
    let mag = Math.sqrt(
        this.w*this.w+
        this.x*this.x+
        this.y*this.y+
        this.z*this.z
    )
    return mag;
  }

  congugate(){
    return new quaternion(this.w,-this.x,-this.y,-this.z);
  }

  inv(){
    let mag = this.magnitude();
    if(mag===0){
        return new quaternion(0,0,0,0);
    }
    let q = this.congugate().scale(1/(mag*mag));
    return new quaternion(q.w,q.x,q.y,q.z)
  }

  toRotMat(){
    if(this.magnitude()===0){
        return new Matrix([0,0,0],[0,0,0],[0,0,0])
    }
    let s= 1/this.magnitude()*this.magnitude();
    return new Matrix([
        [1-2*s*(this.y*this.y+this.z*this.z),2*s*(this.x*this.y-this.z*this.w),2*s*(this.x*this.z+this.y*this.w)],
        [2*s*(this.x*this.y+this.z*this.w),1-2*s*(this.x*this.x+this.z*this.z),2*s*(this.y*this.z-this.x*this.w)],
        [2*s*(this.x*this.z-this.y*this.w),2*s*(this.y*this.z+this.x*this.w),1-2*s*(this.x*this.x+this.y*this.y)]
    ]);
  }

}

export function quatSandwich(v,q){
    let v1 = new quaternion(0,v.x,v.y,v.z);
    let vq_inv = v1.mult(q.inv());
    let res = q.mult(vq_inv);
    return res
}