import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './Sidebar.css'



function Sidebar() {
  const [count, setCount] = useState(0)

  return (
    <div className='vertRect'>
        <div className='roundSquare'>test1</div>
        <div className='roundSquare'>test2</div>
        <div className='roundSquare'>test3</div>
        <div className='roundSquare'>test4</div>
        <div className='roundSquare'>test5</div>
    </div>
  )
}

export default Sidebar
