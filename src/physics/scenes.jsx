import { Vector } from "../utils/maths/vector";
import { createRandomCircles, createRandomSquares } from "./bodies/CreateBodies";
import { createBoundry } from "./bodies/CreateBodies";

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
        e:0.7,
        sf:0.6,
        df:0.4,
        g: new Vector(0,0,0),
        boundry: [...createBoundry()],
        objects: [...createRandomCircles(1)]
    },
    {
        e:0.7,
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