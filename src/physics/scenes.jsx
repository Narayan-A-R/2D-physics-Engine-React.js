import { Vector } from "../utils/maths/vector";
import { Square } from "./bodies/Square";
import { createRandomCircles, createRandomSquares } from "./bodies/CreateBodies";
import { createBoundry } from "./bodies/CreateBodies";
import { quaternion } from "../utils/maths/quaternion";
import { Matrix } from "../utils/maths/matrix";

let sqSvg1=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg2=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg3=document.createElementNS("http://www.w3.org/2000/svg","rect");

let side=100,mass=side*side,mss=mass*side*side,
orientation=new quaternion(1,0,0,0),
inertia=new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]),
angVel=new Vector(0,0,0);

let square1=new Square(sqSvg1,new Vector(200,450,0),new Vector(100,0,0),side,mass,orientation,inertia,angVel),
square2=new Square(sqSvg2,new Vector(500,450,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel),
square3=new Square(sqSvg3,new Vector(601,450,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);




const scenes = [
    {
        e:1,
        sf:0.0,
        df:0.0,
        g: new Vector(0,0,0),
        boundry: [...createBoundry()],
        objects: [...createRandomSquares(1)]
    },
    {
        e:1,
        sf:0.6,
        df:0.4,
        g: new Vector(0,0,0),
        boundry: [...createBoundry()],
        objects: [square1,square2,square3]
    },
    {
        e: 1,
        sf:0.6,
        df:0.4,
        g: new Vector(0,0,0),
        boundry: [...createBoundry()],
        objects: [...createRandomSquares(1)]
    },
    {
        e:0.7,
        sf:0.6,
        df:0.4,
        g: new Vector(0,0,0),
        boundry: [...createBoundry()],
        objects: [...createRandomCircles(10),...createRandomSquares(10)]
    },
    {
        e:0.8,
        sf:0.6,
        df:0.4,
        g: new Vector(0,980,0),
        boundry: [...createBoundry()],
        objects: [...createRandomCircles(1),...createRandomSquares(1)]
    },
]

export default scenes