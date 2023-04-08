import React from "react";
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 80,
        },
    },
};

const Root = styled('div')(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    '& > :not(style) + :not(style)': {
      marginTop: theme.spacing(0),
    },
  }));


const operations = ["+","-"]

export default function Account({ clientId, loginCallback }) {
    
    //clientId="1234" //TOTO PAK SMAZAT
    let navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [newAccountChecked, setNewAccountChecked] = React.useState(false);
    const [newPaymentChecked, setNewPaymentChecked] = React.useState(false);
    const [userData,setUserData] = useState([]);
    const [accountData,setAccountData] = useState([]);
    const [userAccounts,setUserAccounts] = useState([]);
    const [selectedAccount,setSelectedAccount] = useState([]);
    const [allCurrencies,setAllCurrencies] = useState([]);
    const [payCurrency,setPayCurrency] = useState("");
    const [payOperator,setPayOperator] = useState("");
    const [payResult,setPayResult] = useState("");
    const [exRateDate,setExRateDate] = useState("");
    const [newAccNum,setNewAccNum] = useState("");
    const [newAccCurr,setNewAccCurr] = useState("");
    const [newAccRes,setNewAccRes] = useState("");
    const handleLogout = (e) => {
        loginCallback(-1)
        navigate("/")   
    };
    const [payWrbtr, setPayWrbtr] = useState("");

    //toto se vola kazdou minutu
    const MINUTE_MS = 60000;

    React.useEffect(() => {
        const interval = setInterval(() => {
            let today = new Date()
            if (!((today.getDay() === 6) || (today.getDay()  === 0))) {
                let date = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear()
                if (date != exRateDate){
                    if (today.getHours() == 10 && today.getMinutes() >= 20 && today.getMinutes <= 50){
                        axios.get("https://bankis-backend.azurewebsites.net/downloadExchangeRates")
                        .then( res=> {
                            setExRateDate(res.data)
                        })
                    }
                }
            }
        }, MINUTE_MS);
        return () => clearInterval(interval);
      }, [])


    React.useEffect(() => {
        try {
            axios.post("https://bankis-backend.azurewebsites.net/getUserData",clientId)
            .then(res => {
                setUserData(res.data);
                
            })
            axios.post("https://bankis-backend.azurewebsites.net/getAccountsData",clientId)
            .then(res => {
                setAccountData(res.data);
                setSelectedAccount(res.data[0])
                handleUserAccounts(res.data)
                axios.post("https://bankis-backend.azurewebsites.net/getTransactions",res.data[0].accountNumber)
                .then(resTrans => {
                    setTransactions([])
                    resTrans.data.forEach(t => {
                        let newTransaction = createTransactionData(t['operation'], t['wrbtr'], t['waers'], t['message'])
                        setTransactions(transactions => [...transactions, newTransaction]);
                    })    
                })
            })
            /*
            axios.get("http://localhost:8081/downloadExchangeRates")
            .then( res=> {
                setExRateDate(res.data)
            })
            */
            axios.get("https://bankis-backend.azurewebsites.net/getAllCurrencies")
            .then(res => {
                setAllCurrencies([]);
                setAllCurrencies(res.data);
            })
        } catch (err) {
            console.log(err)
        }
    }, []);

    function createTransactionData( operation, wrbtr, waers, message) {
        return { operation, wrbtr, waers, message };
      }

    const handleUserAccounts = (e) => {
        setUserAccounts(e.map(item => item.accountNumber))
    }

    const handlePaymentSwitchChange = (event) => {
        setPayCurrency('')
        setPayOperator('')
        setPayWrbtr('')
        setPayResult('')
        setNewPaymentChecked(event.target.checked);
      };

    const handleAccountSwitchChange = (event) => {
        setNewAccNum('')
        setNewAccCurr('')
        setNewAccRes('')
    setNewAccountChecked(event.target.checked);
    };

    const handlePayWrbtr = (e) => {
        const value = e.target.value.replace(/\D/g, "");
        setPayWrbtr(value);
    };  

    const handlePayCurrencyChange = (e) => {
        setPayCurrency(e.target.value)
    }
    
    const handlePayOperator = (e) => {
        setPayOperator(e.target.value)
    }

    const handleNewAccNum = (e) => {
        setNewAccNum(e.target.value)
    }

    const handleNewAccCurr = (e) => {
        setNewAccCurr(e.target.value)
    }

    const handleTransMessage = (e) => {
        if (e == 0) {
            setPayResult("Chyba, nedostatečný zůstatek.")
        } else if  (e == 1) {
            setPayResult("Chyba, špatný operátor transakce.")
        } else {
            setPayResult(`Platba provedena na účet číslo ${e}.`)
        }
    }

    const handleCreateAccount = (e) => {
        if (newAccNum === "" || newAccCurr === ""){
            setNewAccRes("Chyba, vyplňte všechna povinná pole.")
        } else {
            let params = [clientId,newAccNum,newAccCurr]
            axios.post("https://bankis-backend.azurewebsites.net/createNewAccount",params)
            .then(res=> {
                switch (res.data){
                    case 0:
                        axios.post("https://bankis-backend.azurewebsites.net/getAccountsData",clientId)
                        .then(res => {
                            setAccountData(res.data);
                            handleUserAccounts(res.data)
                            setNewAccRes("Účet úspěšně založen.")
                        })
                        break
                    case 1:
                        setNewAccRes("Chyba, účet s tímto číslem již existuje.")
                        break
                }
            })
        }
    }

    const handleAccountChange = (e) => {
        for (let i = 0; i < accountData.length; i++){
            if (accountData[i].accountNumber === e.target.value){
                setSelectedAccount(accountData[i])
                axios.post("https://bankis-backend.azurewebsites.net/getTransactions",accountData[i].accountNumber)
                .then(resTrans => {
                    setTransactions([])
                    resTrans.data.forEach(t => {
                        let newTransaction = createTransactionData(t['operation'], t['wrbtr'], t['waers'], t['message'])
                        setTransactions(transactions => [...transactions, newTransaction]);
                    })    
                })
                return
            }
        }
    }
    
    const handleRndTrans = (e) => {
        axios.post("https://bankis-backend.azurewebsites.net/generateRandomTransaction",selectedAccount.accountNumber)
            .then(res => {
                setPayOperator(res.data['operation'])
                setPayWrbtr(res.data['wrbtr'])
                setPayCurrency(res.data['waers'])
                setPayResult("")
        })
    };

  
    const handlePay = (e) => {
        try{
            if (payOperator === "" || payWrbtr === "" || payCurrency === ""){
                setPayResult("Chyba, vyplňte všecha povinná pole.")
            } else {
                let params = [clientId,payOperator,payWrbtr,payCurrency]
                axios.post("https://bankis-backend.azurewebsites.net/newTransaction",params)
                .then(resTrans => {
                    handleTransMessage(resTrans.data)
                    if (resTrans.data != 1 && resTrans.data != 0 ){
                        //refresh transakci
                        axios.post("https://bankis-backend.azurewebsites.net/getTransactions",selectedAccount.accountNumber)
                        .then(res => {
                            setTransactions([])
                            res.data.forEach(t => {
                                let newTransaction = createTransactionData(t['operation'], t['wrbtr'], t['waers'], t['message'])
                                setTransactions(transactions => [...transactions, newTransaction]);
                            })    
                        })
                        axios.post("https://bankis-backend.azurewebsites.net/getAccountsData",clientId)
                        .then(res => {
                            setAccountData(res.data);
                            for (let i = 0; i < res.data.length; i++){
                                if (res.data[i].accountNumber === selectedAccount.accountNumber){
                                    setSelectedAccount(res.data[i])
                                }
                            }    
                        })
                    }
                })
            }
        } catch (err) {
            console.log(err)
        }
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
          <Paper elevation={6} >
            <Box display="inline-flex">
                <Box
                    m="auto"
                    paddingTop={2}
                    paddingLeft={2}
                    width={680} height={70}
                    textAlign="left"
                >
                    <Typography variant="h4" display="block" gutterBottom> 
                        Správa klientského účtu
                    </Typography>
                </Box>
                <Box
                    m="auto"
                    paddingTop={2}
                    width={40} height={70}
                    textAlign="right"
                >
                    <Button variant="contained" size="large" onClick={handleLogout} 
                    >
                    Odhlásit
                    </Button>
                </Box>
            </Box>
            <Box display="inline-flex" textAlign="center" marginBottom={2}>
                <Box paddingLeft={2} width={250}>
                    <Paper elevation={4}>
                        <Root>
                            <Typography variant="h6"> 
                                    ID klienta
                            </Typography>
                        <Divider></Divider>
                            <Typography variant="h6"> 
                                    {userData.id}
                            </Typography>
                        </Root>
                    </Paper>
                </Box>
                <Box paddingLeft={3} width={250}>
                    <Paper elevation={4}>
                        <Root>
                            <Typography variant="h6"> 
                                    Jméno a příjmení
                            </Typography>
                            <Divider></Divider>
                            <Typography variant="h6"> 
                                    {userData.firstname} {userData.surname}
                            </Typography>
                        </Root>
                    </Paper>
                </Box>
                <Box paddingLeft={3} width={250}>
                    <Paper elevation={4}>
                        <Root>
                            <Typography variant="h6"> 
                                    Email
                            </Typography>
                            <Divider></Divider>
                            <Typography variant="h6"> 
                                    {userData.email}
                            </Typography>
                        </Root>
                    </Paper>
                </Box>
            </Box>
            </Paper>
            <Paper elevation={6} style={{
                marginTop: 5,
            }}>
                <Box display="inline-flex" textAlign="center" marginBottom={2} marginTop={2}>
                    <Box paddingLeft={2} width={250}>
                        <Paper elevation={4}>
                            <Root>
                                <Typography variant="h6"> 
                                        Číslo účtu
                                </Typography>
                            <Divider></Divider>
                            <FormControl sx={{ width: 200}} size="small">
                        
                                <Select
                                value={selectedAccount.accountNumber || ''}
                                onChange={handleAccountChange}
                                MenuProps={MenuProps}
                                >
                                {userAccounts.map((name) => (
                                    <MenuItem
                                    key={name}
                                    value={name}
                                    >
                                    {name}
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                            </Root>
                        </Paper>
                    </Box>
                    <Box paddingLeft={3} width={250}>
                        <Paper elevation={4}>
                            <Root>
                                <Typography variant="h6"> 
                                        Zůstatek 
                                </Typography>
                                <Divider></Divider>
                                <Typography variant="h6"> 
                                        {selectedAccount.wrbtr}
                                </Typography>
                            </Root>
                        </Paper>
                    </Box>
                    <Box paddingLeft={3} width={250}>
                        <Paper elevation={4}>
                            <Root>
                                <Typography variant="h6"> 
                                        Měna
                                </Typography>
                                <Divider></Divider>
                                <Typography variant="h6"> 
                                        {selectedAccount.waers}
                                </Typography>
                            </Root>
                        </Paper>
                    </Box>
                </Box>
                <Box display="inline-flex" textAlign="center" marginLeft={5} marginBottom={1} marginTop={1}>
                    <Box width={270}>
                        <FormGroup>
                            <FormControlLabel control={<Switch onChange={handlePaymentSwitchChange} />} label="Nová platba" />
                        </FormGroup>
                    </Box>
                    <Box width={250}>
                        <FormGroup>
                            <FormControlLabel control={<Switch onChange={handleAccountSwitchChange} />} label="Založení účtu" />
                        </FormGroup>
                    </Box>
                </Box>
            </Paper>
            { newPaymentChecked && 
                <Paper elevation={6} style={{
                marginTop: 5,
                }}>
                <Box
                    paddingTop={1}
                    paddingLeft={2}
                    width={680} height={25}
                    textAlign="left"
                >
                    <Typography variant="h6" display="block" gutterBottom> 
                        Nová platba
                    </Typography>
                </Box>
                <Box display="inline-flex" textAlign="left" marginLeft={2} marginTop={2}>

                        <FormControl sx={{ width: 120}} size="small">
                            <InputLabel>Operátor</InputLabel>
                            <Select
                            value={payOperator}
                            onChange={handlePayOperator}
                            input={<OutlinedInput label="Operator" />}
                            MenuProps={MenuProps}
                            >
                            {operations.map((name) => (
                                <MenuItem
                                key={name}
                                value={name}
                                >
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>

                        <TextField id="outlined-basic" label="Částka" variant="outlined" size="small"
                        sx={{input: {textAlign: "left"  }, marginLeft: 1}}
                        value={payWrbtr}
                        onChange={handlePayWrbtr}
                        />

                        <FormControl sx={{ width: 120, marginLeft: 1}} size="small">
                            <InputLabel>Měna</InputLabel>
                            <Select
                            value={payCurrency}
                            onChange={handlePayCurrencyChange}
                            input={<OutlinedInput label="Měna" />}
                            MenuProps={MenuProps}
                            >
                            {allCurrencies.map((name) => (
                                <MenuItem
                                key={name}
                                value={name}
                                >
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                <Box
                    display="inline-block"
                    paddingLeft={3}
                    width={800} height={50}
                    textAlign="left"
                >
                    <Button variant="contained" color="success" onClick={handlePay}
                    >
                    Zaplatit
                    </Button>

                    <Button variant="contained" sx={{ marginLeft: 15 } } onClick={handleRndTrans}
                    >
                    Náhodná platba
                    </Button>
                    
                </Box>
                </Box>
                <Box display="inline-block" paddingLeft={2} paddingBottom={2} textAlign="left">
                    <Typography variant="h6"> 
                        {payResult}
                    </Typography>
                </Box>
                </Paper>
            }
            { newAccountChecked && 
                <Paper elevation={6} style={{
                marginTop: 5,
                }}>
                <Box
                    paddingTop={1}
                    paddingLeft={2}
                    width={680} height={25}
                    textAlign="left"
                >
                    <Typography variant="h6" display="block" gutterBottom> 
                        Nový účet
                    </Typography>
                </Box>
                <Box display="inline-flex" textAlign="left" marginLeft={2} marginTop={2}>

                        <TextField id="outlined-basic" label="Číslo účtu" variant="outlined" size="small"
                        sx={{input: {textAlign: "left"  }, marginLeft: 1}}
                        value={newAccNum}
                        onChange={handleNewAccNum}
                        />

                        <FormControl sx={{ width: 120, marginLeft: 1}} size="small">
                            <InputLabel>Měna</InputLabel>
                            <Select
                            value={newAccCurr}
                            onChange={handleNewAccCurr}
                            input={<OutlinedInput label="Měna" />}
                            MenuProps={MenuProps}
                            >
                            {allCurrencies.map((name) => (
                                <MenuItem
                                key={name}
                                value={name}
                                >
                                {name}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                        
                    
                
                <Box
                    display="inline-block"
                    paddingLeft={3}
                    width={800} height={50}
                    textAlign="left"
                >
                    <Button variant="contained" color="success" onClick={handleCreateAccount}
                    >
                    Založit
                    </Button>
                    
                </Box>
                </Box>
                <Box display="inline-block" paddingLeft={2} paddingBottom={2} textAlign="left">
                    <Typography variant="h6"> 
                        {newAccRes}
                    </Typography>
                </Box>
                </Paper>
            }
            
          <Paper elevation={6} style={{
            marginTop: 5,
            }}>
            <Box display="inline-flex" textAlign="left" marginBottom={1} paddingLeft ={2} paddingTop ={2}>
                <Typography variant="h5" display="block" gutterBottom> 
                        Pohyby na účtu {selectedAccount.accountNumber}
                </Typography>
            </Box>
            <Box paddingLeft ={2} paddingRight ={2} paddingBottom ={2}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left" sx={{ fontWeight: 'bold', width: '5%'}}>Operace</TableCell>
                                <TableCell align="left" sx={{ fontWeight: 'bold', width: '20%'}}>Částka</TableCell>
                                <TableCell align="left" sx={{ fontWeight: 'bold', width: '5%'}}>Měna</TableCell>
                                <TableCell align="left" sx={{ fontWeight: 'bold'}}>Zpráva</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                        {transactions.map((row) => (
                            <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                            <TableCell align="left">{row.operation}</TableCell>
                            <TableCell align="left">{row.wrbtr}</TableCell>
                            <TableCell align="left">{row.waers}</TableCell>
                            <TableCell align="left">{row.message}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
          </Paper>
        </Box>
    )
}
