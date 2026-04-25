import { useRef, useState ,useEffect } from 'react'
import './Playground.css'


class vector{
    constructor(x=0,y=0,z=0){
        this.x = x
        this.y = y
        this.z = z
    }
    
    add(v2){
        return new vector(
            this.x + v2.x,
            this.y + v2.y,
            this.z + v2.z
        )
    }

    sub(v2){
        return new vector(
            this.x - v2.x,
            this.y - v2.y,
            this.z - v2.z
        )
    }

    scale(k){
        return new vector(
            this.x*k,
            this.y*k,
            this.z*k
        )
    }

    magnitude(){
        const magnitude = Math.sqrt(
            this.x*this.x+
            this.y*this.y+
            this.z*this.z
        )
        return magnitude
    }

    unitize(){
        const magnitude = Math.sqrt(
            this.x*this.x+
            this.y*this.y+
            this.z*this.z
        )
        if(magnitude===0) return new vector(0,0,0)
        return new vector(this.x/magnitude,this.y/magnitude,this.z/magnitude)
    }

    copy(v){
        this.x = v.x
        this.y = v.y
        this.z = v.z
    }
}

const ORIGIN = new vector(0,0,0)

class RigidBody{
    constructor(pos,vel,mass){
        this.position = pos
        this.velocity = vel
        this.mass = mass
        if(this.mass===0){
            this.invMass = 0;
        }
        else{
            this.invMass = 1/this.mass;
        }
    }

    supportFunc(dir){
        throw new Error("support not implemented in child class")
    }
}

class Circle extends RigidBody{
    constructor(circleSvg,radius,pos,vel,mass){
        super(pos,vel,mass)
        this.circleSvg = circleSvg
        this.radius = radius
        this.circleSvg.setAttribute("cx",pos.x)
        this.circleSvg.setAttribute("cy",pos.y)
        this.circleSvg.setAttribute("r",radius)
        this.circleSvg.setAttribute("fill",'var(--primary)')
    }

    supportFunc(dir){
        dir = dir.unitize()
        dir = dir.scale(this.radius)
        dir = dir.add(this.position)
        return new vector(dir.x,dir.y,0)
    }

    update(){
        this.circleSvg.setAttribute("cx",this.position.x)
        this.circleSvg.setAttribute("cy",this.position.y)
    }
}

class Square extends RigidBody{
    constructor(sqSvg,pos,vel,side,mass){
        super(pos,vel,mass)
        this.side = side
        this.squareSvg = sqSvg
        this.squareSvg.setAttribute("x",pos.x)
        this.squareSvg.setAttribute("y",pos.y)
        this.squareSvg.setAttribute("height",side)
        this.squareSvg.setAttribute("width",side)
        // this.squareSvg.setAttribute("fill",'var(--accent-light)')
        this.squareSvg.setAttribute("fill",'red')
    }

    supportFunc(dir){
        let x = dir.x>=0?
            this.position.x+this.side
            :this.position.x
        let y = dir.y>=0?
            this.position.y+this.side
            :this.position.y
        return new vector(x,y,0)
    }

    update(){

    }
}

function cross(v1,v2){
    return new vector(
        v1.y*v2.z-v1.z*v2.y,
        v1.z*v2.x-v1.x*v2.z,
        v1.x*v2.y-v1.y*v2.x
    )
}

function dot(v1,v2){
    return  v1.x*v2.x+ 
            v1.y*v2.y+
            v1.z*v2.z
}

function sameDirection(d1,d2){
    return dot(d1,d2) > 0
}

function getNormal(v1,v2){
    let normal = cross(cross(v1,v2),v1)
    if(normal.magnitude()>0) return normal.unitize()
    let usableV = new vector(1,0,0)
    if(v1.magnitude()===0 && v2.magnitude()===0) return usableV.unitize()
    if(v1.magnitude()!==0) usableV = v1
    if(v2.magnitude()!==0) usableV = v2
    const axes = [
        new vector(1,0,0),
        new vector(0,1,0),
        new vector(0,0,1)
    ]

    let leastAlignedAxis = axes[0]
    for(const axis of axes){
        if(Math.abs(dot(usableV,axis))<Math.abs(dot(leastAlignedAxis,usableV))){
            leastAlignedAxis = axis
        }
    }
    normal = cross(cross(usableV,leastAlignedAxis),usableV)
    return normal.unitize()
}

function lineCase(simplex,dir){
    const b = simplex[0]
    const a = simplex[1]
    const ao = ORIGIN.sub(a)
    const ab = b.sub(a)
    const ab_perp = getNormal(ab,ao)
    // epsilon
    if(ab_perp.magnitude()==0){
        return true
    }
    dir.copy(ab_perp)
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

    const ab_perp = cross(ab,abc_perp).unitize()
    const ac_perp = cross(abc_perp,ac).unitize()

    if(sameDirection(ab_perp,ao)){
        simplex.splice(0,1)
        dir.copy(ab_perp)
        return false
    }

    if(sameDirection(ac_perp,ao)){
        simplex.splice(1,1)
        dir.copy(ac_perp)
        return false
    }

    // epsilon
    if( !sameDirection(ao,abc_perp) && 
        !sameDirection(ao,abc_perp.scale(-1))
    ){
        return true
    }

    if(sameDirection(abc_perp,ao)){
        dir.copy(abc_perp)
        return false
    }
    

    simplex = [a,c,b]
    dir.copy(abc_perp.scale(-1))
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
        console.log(1)
        simplex.splice(0,1)
        dir.copy(abc_perp)
        return false
    }
    if(sameDirection(acd_perp,ao)){
        console.log(2)
        simplex.splice(1,1)
        dir.copy(acd_perp)
        return false
    }
    if(sameDirection(adb_perp,ao)){
        console.log(3)
        simplex.splice(2,1)
        dir.copy(adb_perp)
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

function findSupportPoint(s1,s2,dir){
    return s1.supportFunc(dir).sub(s2.supportFunc(dir.scale(-1)))
}

function GJK(s1,s2){

    const randDir = new vector(1,0,0)
    let supportPoint = findSupportPoint(s1,s2,randDir)
    const simplex =[]
    let dir = ORIGIN.sub(supportPoint)

    simplex.push(supportPoint)
    let i=0
    // console.log([...simplex])
    while(true && i<1000){
        supportPoint = findSupportPoint(s1,s2,dir)
        if(dot(supportPoint,dir)<0) return {simplex:simplex,hasCollided:false}
        simplex.push(supportPoint)
        if(updateSimplex(simplex,dir)) return {simplex:simplex,hasCollided:true}
        i++
    }
}

function getRandom(a,b){
    return Math.random()*(b-a)+a
}

function addIfUniqueEdge(edges,faces,a,b){
    const reverse = edges.map((e,i)=>{if([faces[b],faces[a]]==e) return i})
    if(i<edges.length){
        edges[reverse] = edges.at(-1)
        edges.pop()
    }
    else{
        edges.push([faces[a],faces[b]])
    }
}

function getFaceNormals(polytope,faces){
    const normals = []
    let minDistance = Infinity
    let minTriangle = 0
    for (let i = 0; i < faces.length; i+=3) {
        const a = polytope[faces[i]]
        const b = polytope[faces[i+1]]
        const c = polytope[faces[i+2]]
        let normal = cross(b.sub(a),c.sub(a)).unitize()
        const distance = dot(normal,a)
        console.log(normal)
        console.log(a)
        if(distance < 0){
            normal.scale(-1)
            distance*=-1
        }

        normals.push({normal,distance})
        if(distance < minDistance){
            minTriangle = i/3
            minDistance = distance
        }
    }

    return [normals,minTriangle]
}


function EPA3D(polytope,s1,s2){
    const faces = [
        0,1,2,
        0,3,1,
        0,2,3,
        1,3,2
    ]

    let [normals,minFaceInd] = getFaceNormals(polytope,faces)
    let minNormal = new vector()
    let minDistance = Infinity
    
    while(minDistance===Infinity){
        minNormal = normals[minFaceInd].normal
        minDistance = normals[minFaceInd].distance
        const supportPoint = findSupportPoint(s1,s2,minNormal)

        const sDistance = dot(minNormal,supportPoint)

        if(Math.abs(sDistance-minDistance)> 0.001){
            minDistance = Infinity
            const uniqueEdges = []
            for (let i = 0; i < normals.length; i++) {
                if(sameDirection(normals,supportPoint)){
                    const f = i*3
                    addIfUniqueEdge(uniqueEdges,faces,f,f+1)
                    addIfUniqueEdge(uniqueEdges,faces,f+1,f+2)
                    addIfUniqueEdge(uniqueEdges,faces,f+2,f)

                    faces[f+2] = faces.at(-1)
                    faces.pop()
                    faces[f+1] = faces.at(-1)
                    faces.pop()
                    faces[f] = faces.at(-1)
                    faces.pop()

                    normals[i] = normals.at(-1)
                    normals.pop()

                    i--
                }
            }

            const newFaces = []
            for(const [edgeInd1,edgeInd2] of uniqueEdges){
                newFaces.push(edgeInd1)
                newFaces.push(edgeInd2)
                newFaces.push(polytope.length)
            }
            polytope.push(supportPoint)

            const [newNormals,newMinFace] = getFaceNormals(polytope,newFaces)

            let oldMinDist = Infinity
            for (let i = 0; i < normals.length; i++) {
                if(normals[i].distance < oldMinDist){
                    oldMinDist = normals[i].distance
                    minFaceInd = i
                }
            }
            if(newNormals[newMinFace].distance < oldMinDist){
                minFaceInd = newMinFace + normals.length
            }
            faces.push(...newFaces)
            normals.push(...newNormals)
        }
    }
    return minNormal.scale(minDistance+0.001)
}   

function EPA2D(polytope,s1,s2){
    console.log([...polytope])
    while(true){
        let minIndex = 0
        let minDistance = Infinity
        let minNormal;
        for (let i = 0; i < polytope.length; i++) {
            let j = (i+1)%polytope.length

            let vertexI = polytope[i]
            let vertexJ = polytope[j]

            let ij = vertexJ.sub(vertexI)
            // console.log(vertexJ)
            // console.log(ij)
            let normal = cross(ij,new vector(0,0,1)).unitize()
            // console.log(normal)
            // console.log(minNormal)
            
            if(dot(vertexI,normal)<0){
                normal = normal.scale(-1)
            }
            let distance = dot(vertexI,normal)
            if(distance<minDistance){
                minDistance = distance
                minIndex = j
                minNormal = normal
            }
        }
        // console.log(minNormal)
        let supportpoint = findSupportPoint(s1,s2,minNormal)
        let sDistance = dot(minNormal,supportpoint)

        // console.log(minDistance)
        if(Math.abs(sDistance - minDistance) < 0.0001){
            // console.log(minNormal.scale(minDistance))
            return minNormal.scale(minDistance+0.001)
        }
        polytope.splice(minIndex,0,supportpoint)
        minDistance = Infinity
    }
}

function EPA1D(simplex,s1,s2){
    const [b,a] = simplex
    if(b.magnitude()<a.magnitude()) return b
    return a
}

function EPA(simplex,s1,s2){
    console.log(simplex)
    switch (simplex.length) {
        case 2: return EPA1D(simplex,s1,s2)
        case 3: return EPA2D(simplex,s1,s2)
        case 4: return EPA3D(simplex,s1,s2)
        default: return new vector(0,0,0)
    }
}

function createCircles(n){
    const arr = []
    // for (let i = 0; i < n; i++) {
    //     const circleSvg = document.createElementNS("http://www.w3.org/2000/svg","circle")
    //     const radius = getRandom(10,50)
    //     const pos = new vector(getRandom(0,1000),getRandom(0,1000),0)
    //     const vel = new vector(getRandom(-5,5),getRandom(-5,5),0)
    //     const circle = new Circle(circleSvg,radius,pos,vel);
    //     arr.push(circle)
    // }
    
    for (let i = 0; i < n; i++) {
        let circleSvg = document.createElementNS("http://www.w3.org/2000/svg", "circle")

        let radius = getRandom(10, 50);
        let pos = new vector(getRandom(-0, 1000),getRandom(0, 1000),0)
        let vel = new vector(getRandom(-5, 5),getRandom(-5, 5),0)
        let mass = radius*radius
        let circle = new Circle(circleSvg, radius, pos, vel, mass)
        arr.push(circle);
    }

    let circleSvg = document.createElementNS("http://www.w3.org/2000/svg", "circle");

    let radius = 50;
    let pos = new vector(500, 500, 0);
    let vel = new vector(0, 0, 0); 
    let mass = 0;

    let circle = new Circle(circleSvg, radius, pos, vel, mass);

    arr.push(circle);
    console.log([...arr])
    return arr
}

function resolveCollision(p,s1,s2){
    let s1Tos2 = s2.position.sub(s1.position)
    if(!sameDirection(p,s1Tos2)) p = p.scale(-1)
    let normal = p.unitize()
    let relVelocity = s2.velocity.sub(s1.velocity)
    let totInvMass = s1.invMass + s2.invMass
    if(totInvMass===0) return

    s1.position =s1.position.sub(p.scale(s1.invMass/totInvMass))
    s2.position =s2.position.add(p.scale(s2.invMass/totInvMass))


    let speedAlongNormal = dot(relVelocity,normal)

    if(speedAlongNormal > 0) return

    let e = 0.8
    let j = -(1+e)* speedAlongNormal
    j = j/totInvMass

    let impulse = normal.scale(j)

    if(s1.invMass!==0) s1.velocity = s1.velocity.sub(impulse.scale(s1.invMass))
    if(s2.invMass!==0) s2.velocity = s2.velocity.add(impulse.scale(s2.invMass))
    console.log(s1.velocity)
    console.log(s2.velocity)
    s1.update()
    s2.update()
}

function createBoundry(){
    const arr = []
    let rect1 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect2 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect3 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect4 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect5 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect6 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect7 = document.createElementNS("http://www.w3.org/2000/svg","rect")
    let rect8 = document.createElementNS("http://www.w3.org/2000/svg","rect")

    let vel = new vector(0,0,0)
    arr.push(new Square(rect1, new vector(-1000 , -1000 , 0), vel, 1000,0))
    arr.push(new Square(rect2, new vector(0     , -1000 , 0), vel, 1000,0))
    arr.push(new Square(rect3, new vector(1000  , -1000 , 0), vel, 1000,0))

    arr.push(new Square(rect4, new vector(-1000 , 0      , 0), vel, 1000,0))
    arr.push(new Square(rect5, new vector(1000  , 0      , 0), vel, 1000,0))

    arr.push(new Square(rect6, new vector(-1000 , 1000   , 0), vel, 1000,0))
    arr.push(new Square(rect7, new vector(0     , 1000   , 0), vel, 1000,0))
    arr.push(new Square(rect8, new vector(1000  , 1000   , 0), vel, 1000,0))
    return arr
}

function move(circles){
    circles.map(c=>{
        const dt = 1
        c.position.x+= c.velocity.x*dt
        c.position.y+= c.velocity.y*dt
        c.update()
    })
}


function Playground() {

    const [n,setN] = useState(10)

    const [frameNo, setFrameNo] = useState(0)
    const [t1,setT1] = useState(-1);
    const [t2,setT2] = useState(0);
    
    const circlesRef = useRef(createCircles(n))
    const boundryRef = useRef(createBoundry(n))
    
    const [isBoundry, setisBoundry] = useState(new Set([...boundryRef.current]))
    
    const environmentRef= useRef((()=>{
        const circles = circlesRef.current
        const boundry = boundryRef.current
        return [
            ...circles,
            ...boundry
        ]
    })())

    const svgRef = useRef();

    useEffect(() => {
        const circles = circlesRef.current
        const boundry = boundryRef.current
        boundry.map(b=>svgRef.current.appendChild(b.squareSvg))
        circles.map(c=>svgRef.current.appendChild(c.circleSvg))
    }, [])

    useEffect(() => {
        let frameId;
        function animate() {
            
        }

        // frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, []);

    let frameId;
    function animate() {
        const circles = circlesRef.current
        const environment = environmentRef.current

        move(circles)
        for (let i = 0; i < environment.length; i++) {
            for (let j = i+1; j < environment.length; j++) {
                if(isBoundry.has(environment[i]) && isBoundry.has(environment[j])) continue
                const gjkResult = GJK(environment[i],environment[j])
                if(!gjkResult.hasCollided) continue
                const epaResult = EPA(gjkResult.simplex,environment[i],environment[j])
                console.log(epaResult)
                resolveCollision(epaResult,environment[i],environment[j])
                console.log("--")
            }
        }
        console.log("\n")
        setFrameNo(f=>{
                if(f>=1000) return f;
                frameId = requestAnimationFrame(animate)
                return f+1;
        })
    }


    const nextFrame = ()=>{
        const circles = circlesRef.current
        requestAnimationFrame(animate);
    }

  return (
    <div className='playground'>
        <button onClick={nextFrame}>Next Frame</button>
        <svg viewBox='0 0 1000 1000' className='boundingBox' ref={svgRef}>
            {/* <rect x={0} y={0} height={1000} width={1000} fill='white'></rect> */}
        </svg>
    </div>
  )
}

export default Playground
