import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Login({ clientCallback, loginCallback }) {
  let loginCode = -1
  const[clientId,setClientId]=useState('')
  let navigate = useNavigate();
  const[loginMsg,setLoginMsg]=useState('Přihlaste se zadáním vašeho klientského čísla.')

  const handleClickLogin=async(e)=>{
    try {
      e.preventDefault()
      if (clientId.length > 0) {
        await axios.post("https://bankis-backend.azurewebsites.net/",clientId)
        .then(res => {
          if(res.data == -1) {
            setLoginMsg('Neznámé klientské číslo, opakujte zadání.')
          } else {
            loginCode = res.data
            //console.log(loginCode)
            navigate("/verify")
            clientCallback(clientId)
            loginCallback(loginCode)
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  } 
    
  //number input only
  const handleChangeAccNum = (e) => {
    const value = e.target.value.replace(/\D/g, "");
      setClientId(value);
  };


  return (
    <Box
        display="block" 
        width={840} height={800} 
        component="form"
        noValidate
        autoComplete="off"
        marginTop={2}
        marginLeft={"auto"}
        marginRight={"auto"}
      > 
        <Paper elevation={6}>
        <Box
          m="auto"
          paddingTop={1}
          width={720} height={70}
          textAlign="center"
          >
          <Typography variant="h3" display="block" gutterBottom> 
            STIN 2023 Banka
          </Typography>
        </Box>

        <Box
          m="auto"
          width={720} height={70}
          textAlign="center"
          >
          <TextField id="outlined-basic" label="Číslo klienta" variant="outlined"
            sx={{input: {textAlign: "center"}}}
            value={clientId}
            onChange={handleChangeAccNum}
          />
        </Box>
        <Box
          m="auto"
          width={720} height={70}
          textAlign="center"
        >
          <Button variant="contained" size="large" onClick={handleClickLogin}
            >
            Přihlásit
          </Button>
        </Box>
          <Box
            marginLeft={"auto"}
            marginRight={"auto"}
            width={720} height={70}
            textAlign="center"
          >
            <Typography variant="h6" display="block" gutterBottom>
              {loginMsg}
            </Typography>
          </Box>
      </Paper>
    </Box>

  );
  
}
