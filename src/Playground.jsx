import { useRef, useState ,useEffect } from 'react'
import './Playground.css'


function getRandom(a,b){
    return Math.random()*(b-a)+a
}

function createCircle(){
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle")
    circle.setAttribute("cx",getRandom(10,900))
    circle.setAttribute("cy",getRandom(10,900))
    circle.setAttribute("r",getRandom(10,50))
    circle.setAttribute("fill",'red')
    return circle
}

function createVelocity(){
    const velocity = {vx: (Math.random()-0.5)*1,vy:(Math.random()-0.5)*1}
    // const velocity = {vx: 0,vy:-0.05}
    return velocity
}

function collide(environment){

}

function Playground() {

    const [n,setN] = useState(10)
    const [velocities,setVelocities] = useState([])
    const [circles,setCircles] = useState([])
    const [environment, setEnvironment] = useState([])
    // const [frameNo, setFrameNo] = useState(0)
    // const [t1,setT1] = useState(0);
    // const [t2,setT2] = useState(0);

    const svgRef = useRef();
    const circlesRef = useRef(circles);
    const velocitiesRef = useRef(velocities);
    useEffect(() => {
        const circleCopy = []
        const velocityCopy = []
        for (let i = 0; i < n; i++) {
            const circle = createCircle()
            circleCopy.push(circle)
            svgRef.current.appendChild(circle)

            const velocity = createVelocity()
            velocityCopy.push(velocity)
        }
        setCircles((circles) =>[...circles,...circleCopy])
        setVelocities(velocities => [...velocities,...velocityCopy])
    }, [])

    useEffect(()=>{
        circlesRef.current = circles
        velocitiesRef.current = velocities
    },[circles,velocities])

    useEffect(() => {
        if(!circles.length>0 && !velocities.length>0) return
        let frameId;
        let frameNo = 0;
        let t1 = -1;
        let t2 = 0;
        function animate() {
            const circles = circlesRef.current
            const velocities = velocitiesRef.current
            // console.log(velocities[0])
            // console.log(frameNo)
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i]
                const vel = velocities[i]
                const dt = t2 - t1
                // console.log("dt ",dt)
                const x= parseFloat(circle.getAttribute("cx"))
                const y= parseFloat(circle.getAttribute("cy"))
                const r= parseFloat(circle.getAttribute("r"))
                // console.log("x ",x," y ",y," r ",r)
                if((y<=r && vel.vy<0) || (1000-y<=r && vel.vy>0)){
                    setVelocities(v => {
                        const copy = [...v];
                        copy[i] = { ...copy[i], vy: -copy[i].vy };
                        return copy;
                    });
                }
                if((x<=r && vel.vx<0) || (1000-x<=r && vel.vx>0)){
                    setVelocities(v => {
                        const copy = [...v];
                        copy[i] = {...copy[i], vx: -copy[i].vx };
                        return copy;
                    });
                    
                }
                circle.setAttribute("cy",y+vel.vy*dt)
                
                circle.setAttribute("cx",x+vel.vx*dt)
            }
            t1 = t2
            t2 += 10
            // setT1(t2)
            // setT2(t2=> t2+=100)
            if(frameNo++<100) frameId = requestAnimationFrame(animate);
        }

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [circles,velocities]);


    function nextFrame(){
        function animate() {
            const circles = circlesRef.current
            const velocities = velocitiesRef.current
            console.log(velocities[0])
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i]
                const vel = velocities[i]
                const dt = t2
                t2++ - t1
                // console.log("dt ",dt)
                const x= parseFloat(circle.getAttribute("cx"))
                const y= parseFloat(circle.getAttribute("cy"))
                const r= parseFloat(circle.getAttribute("r"))
                console.log("x ",x," y ",y," r ",r)
                if((y<=r && vel.vy<0) || (1000-y<=r && vel.vy>0)){
                    setVelocities(v => {
                        const copy = [...v];
                        console.log("copy",copy)
                        copy[i] = { ...copy[i], vy: -copy[i].vy };
                        return copy;
                    });
                    console.log(velocities[0]);
                }
                if((x<=r && vel.vx<0) || (1000-x<=r && vel.vx>0)){
                    setVelocities(v => {
                        const copy = [...v];
                        copy[i] = {...copy[i], vx: -copy[i].vx};
                        return copy;
                    });
                    console.log(velocities[0]);
                }
                circle.setAttribute("cy",y+vel.vy*dt)
                circle.setAttribute("cx",x+vel.vx*dt)
            }
            t1 = t2
            t2+=10
        }
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
