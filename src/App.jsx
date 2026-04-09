import React from 'react'
import {BrowserRouter as Router ,Route, Routes} from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Login from './components/Login'
import Lab from './components/Lab'
import SignUp from './components/SignUp'
import FaceMatch from './components/FaceMatch'


const App = () => {
  return (
    <>
    <Router>
        <Navbar />
      <Routes>
       <Route path="/" element={<Hero/>} />
       <Route path='/login' element={<Login/>} />
       <Route path='/lab' element={<Lab/>}/>
       <Route path='/face-match' element={<FaceMatch/>}/>
       <Route path='/sign-up' element={<SignUp/>}/>

      </Routes>
    </Router>
  
    
    </>
  )
}

export default App
