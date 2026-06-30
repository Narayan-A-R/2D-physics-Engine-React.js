import { Vector } from "../utils/maths/vector";
import { Square } from "./bodies/Square";
import { createRandomCircles, createRandomSquares } from "./bodies/CreateBodies";
import { createBoundry } from "./bodies/CreateBodies";
import { quaternion } from "../utils/maths/quaternion";
import { Matrix } from "../utils/maths/matrix";
import { Circle } from "./bodies/Circle";

let sqSvg1=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg2=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg3=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg4=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg5=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg6=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg7=document.createElementNS("http://www.w3.org/2000/svg","rect"),
sqSvg8=document.createElementNS("http://www.w3.org/2000/svg","rect");

let side=100,mass=side*side,mss=mass*side*side,
orientation=new quaternion(1,0,0,0),
inertia=new Matrix([[mss/12,0,0],[0,mss/12,0],[0,0,mss/6]]),
angVel=new Vector(0,0,0);

let square1=new Square(sqSvg1,new Vector(200,450,0),new Vector(100,0,0),side,mass,orientation,inertia,angVel),
square2=new Square(sqSvg2,new Vector(500,450,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel),
square3=new Square(sqSvg3,new Vector(601,450,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);

let square4 = new Square(sqSvg4,new Vector(600,450,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);
let square5 = new Square(sqSvg5,new Vector(599,340,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);
let square6 = new Square(sqSvg6,new Vector(598,250,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);
let square7 = new Square(sqSvg7,new Vector(597,140,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);
let square8 = new Square(sqSvg8,new Vector(596,30,0),new Vector(0,0,0),side,mass,orientation,inertia,angVel);

const scenes = [
    {
        e:0.0,
        sf:0.6,
        df:0.4,
        g: new Vector(0,980,0),
        boundry: [...createBoundry()],
        objects: [square4,square5,square6,square7,square8]
        }
    ,
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
        g: new Vector(0,980,0),
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