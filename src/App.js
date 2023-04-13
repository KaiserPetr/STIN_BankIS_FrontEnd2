import React, { Component } from 'react'
import './App.css'
import Login from './components/Login'
import Verify from './components/Verify'
import Account from './components/Account'
import axios from 'axios';
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App(){

  const [clientId,setClientId] = React.useState(1);
  const [loginCode,setLoginCode] = React.useState(-1);
  const [exRateDate,setExRateDate] = useState("");

  //toto se vola kazdou minutu
  const MINUTE_MS = 60000;

  React.useEffect(() => {
      const interval = setInterval(() => {
          let today_str = new Date().toLocaleDateString("en-US", {timeZone: "Europe/Vienna"})
          let today = new Date(today_str)
          if (!((today.getDay() === 6) || (today.getDay()  === 0))) {
              let day = today.getDay().toLocaleString('en-US', {
                  minimumIntegerDigits: 2,
                  useGrouping: false
                })
              let month = today.getMonth().toLocaleString('en-US', {
                  minimumIntegerDigits: 2,
                  useGrouping: false
                })
              let date = day + '.' + month + '.' + today.getFullYear()
              if (date != exRateDate){
                  if (today.getHours() == 14 && today.getMinutes() >= 20 && today.getMinutes <= 50){
                      axios.get("https://stinbankisbackend2-production.up.railway.app/downloadExchangeRates")
                      .then( res=> {
                          setExRateDate(res.data)
                      })
                  }
              }
          }
      }, MINUTE_MS);
      return () => clearInterval(interval);
    }, [])

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