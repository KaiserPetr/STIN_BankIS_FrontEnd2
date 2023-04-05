import React, { Component } from 'react'
import './App.css'
import Login from './components/Login'
import Verify from './components/Verify'
import Account from './components/Account'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App(){

  const [clientId,setClientId] = React.useState(1);
  const [loginCode,setLoginCode] = React.useState(-1);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path="/" element={<Login clientCallback={setClientId} loginCallback={setLoginCode}/>}/>
          <Route exact path="/verify" element={<Verify loginCode={loginCode} />}/>
          <Route exact path="/account" element={<Account clientId={clientId} loginCallback={setLoginCode}/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App