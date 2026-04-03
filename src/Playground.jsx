import { useRef, useState ,useEffect } from 'react'
import './Playground.css'


class circle{
    constructor(circleSvg,radius,pos,velocity){
        this.circleSvg = circleSvg
        this.position = pos
        this.velocity = velocity
        this.radius = radius
        this.circleSvg.setAttribute("cx",pos.x)
        this.circleSvg.setAttribute("cy",pos.y)
        this.circleSvg.setAttribute("r",radius)
        this.circleSvg.setAttribute("fill",'var(--primary)')
        // this.circleSvg.setAttribute("fill",'red')
    }
}


class vector{

    constructor(){
        this.x = 0
        this.y = 0
        this.z =0
    }

    sub(v2){
        return {
            x: this.x - v2.x,
            y: this.y - v2.y,
            z: this.z - v2.z
        }
    }
}

function cross(v1,v2){
    return {
        x:v1.y*v2.z-v1.z*v2.y,
        y:v1.z*v2.x-v1.x*v2.z,
        z:v1.x*v2.y-v1.y*v2.x
    }
}

function dot(v1,v2){
    return v1.x*v2.x+ v1.y*v2.y+v1.z*v1.z
}

function sameDirection(d1,d2){
    return dot(d1,d2) > 0
}

function lineCase(simplex,dir){
    const b = simplex[0]
    const a = simplex[1]
    const ao = ORIGIN.sub(a)
    const ab = b.sub(a)
    ab_perp = cross(cross(ab,ao),ab)
    dir = ab_perp
    return false
}

function triangleCase(simplex,dir){
    const c = simplex[0]
    const b = simplex[1]
    const a = simplex[2]

    const ab = b.sub(a)
    const ac = c.sub(a)
    const ao = ORIGIN.sub(a)

    const abc_perp = cross(ab,ac)

    const ab_perp = cross(abc_perp,ab)
    const ac_perp = cross(abc_perp,ac)

    if(sameDirection(ab_perp,ao)){
        simplex.splice(0,1)
        dir = ab_perp
        return false
    }

    if(sameDirection(ac_perp,ao)){
        simplex.splice(1,1)
        dir = ac_perp
        return false
    }

    return false
}

function tetrahedronCase(simplex,dir){
    const d = simplex[0]
    const c = simplex[1]
    const b = simplex[2]
    const a = simplex[3]

    const ad = d.sub(a)
    const ab = b.sub(a)
    const ac = c.sub(a)
    const ao = ORIGIN.sub(a)

    const abc_perp = cross(ab,ac)
    const acd_perp = cross(ac,ad)
    const adb_perp = cross(ad,ab)

    if(sameDirection(abc_perp,ao)){
        simplex.splice(0,1)
        dir = abc_perp
        return false
    }
    if(sameDirection(acd_perp,ao)){
        simplex.splice(1,1)
        dir = acd_perp
        return false
    }
    if(sameDirection(adb_perp,ao)){
        simplex.splice(2,1)
        dir = adb_perp
        return false
    }
    return true
}

function updateSimplex(simplex,dir){
    switch (simplex.length) {
        case 2: return lineCase(simplex,dir);
        case 3: return triangleCase(simplex,dir);
        case 4: return tetrahedronCase(simplex,dir);
        default: return false;
    }
}

function GJK(s1,s2){
    const randDir = {x:0,y:1,z:0}
    supportPoint = findSupportPoint(s1,s2,randDir)
    const simplex =[]
    simplex.push(supportPoint)
    let dir = ORIGIN.sub(supportPoint)

    while(true){
        supportPoint = findSupportPoint(s1,s2,dir)
        if(supportPoint.dot(dir)<=0) return false
        simplex.push(supportPoint)
        if(updateSimplex(simplex,d)) return true
    }
}

function getRandom(a,b){
    return Math.random()*(b-a)+a
}

function collide(environment){

}

function createCircles(n){
    const arr = []
    for (let i = 0; i < n; i++) {
        const circleSvg = document.createElementNS("http://www.w3.org/2000/svg","circle")
        const radius = getRandom(10,50)
        const pos = {x:getRandom(0,1000),y:getRandom(0,1000)}
        const vel = {x: getRandom(-5,5),y:getRandom(-5,5)}
        const circleOb = new circle(circleSvg,radius,pos,vel);
        arr.push(circleOb)
    }
    return arr
}
function Playground() {

    const [n,setN] = useState(30)

    const [environment, setEnvironment] = useState([])
    const [frameNo, setFrameNo] = useState(0)
    const [t1,setT1] = useState(-1);
    const [t2,setT2] = useState(0);

    const circlesRef = useRef(createCircles(n))
    const svgRef = useRef();

    useEffect(() => {
        const circles = circlesRef.current
        circles.map(c=>svgRef.current.appendChild(c.circleSvg))
    }, [])

    useEffect(() => {
        let frameId;
        function animate() {
            const circles = circlesRef.current
            circles.map((cO)=>{
                const circle = cO.circleSvg
                const vel = cO.velocity
                const pos = cO.position
                const r = cO.radius
                const dt = t2 - t1
                if((pos.y<=r && vel.y<0) || (1000-pos.y<=r && vel.y>0)){
                    vel.y*=-1
                }
                if((pos.x<=r && vel.x<0) || (1000-pos.x<=r && vel.x>0)){
                    vel.x*=-1
                }
                pos.x += vel.x*dt
                pos.y += vel.y*dt
                circle.setAttribute("cx",pos.x)
                circle.setAttribute("cy",pos.y)
            })
            setT1(t2)
            setT2(t2=> t2+=1/60)
            setFrameNo(f=>{
                if(f>=200) return f;
                frameId = requestAnimationFrame(animate)
                return f+1;
            })
        }

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []);


    const nextFrame = ()=>{
        requestAnimationFrame(animate);
    }

  return (
    <div className='playground'>
        <button onClick={nextFrame}>Next Frame</button>
        <svg viewBox='0 0 1000 1000' className='boundingBox' ref={svgRef}>
            <rect x={0} y={0} height={1000} width={1000} fill='white'></rect>
        </svg>
    </div>
  )
}

export default Playground
