import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function Login({ loginCode }) {

  const[loginCodeInput,setloginCodeInput]=useState('')
  let navigate = useNavigate();
  const[loginMsg,setLoginMsg]=useState('Zadejte ověřovací kód.')

  const handleClickVerify=async(e)=>{
    e.preventDefault()
    if (loginCodeInput.length > 0) {
      if(loginCode == loginCodeInput){
        navigate("/account")
      } else {
        setLoginMsg('Chybný ověřovací kód, opakujte zadání.')
      }
    }
  }
  
  //number input only
  const handleChangeLoginCode = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setloginCodeInput(value);
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
        <TextField id="outlined-basic" label="Ověřovací kód" variant="outlined"
        sx={{input: {textAlign: "center"}}}
        value={loginCodeInput}
        onChange={handleChangeLoginCode}
        />
    </Box>
    <Box
        m="auto"
        width={720} height={70}
        textAlign="center"
    >
        <Button variant="contained" size="large" onClick={handleClickVerify}
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