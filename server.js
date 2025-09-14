const express = require('express')
const fs = require('fs');
const path = require('path');
var cors = require('cors')
const { json } = require('stream/consumers');
const app = express()

// Middleware-ek
app.use(cors())
app.use(express.json()) //json formátum megkövetelése
app.use(express.urlencoded({extended: true})); //req body-n keresztül átmenjenek az adatok


let users = []
const USERS_FILE = path.join(__dirname, 'user.json')

loadUsers()
// ENDPOINTS

app.get('/', (req, res) => {
  res.send({msg:'Backend API by Bajai SZC Türr István Technikum - 13.A Szoftverfejlesztő '})
})

// GET all users

app.get('/users', (req, res)=>{
    res.send(users)
});

// GET one user by id

app.get('/users/:id',(req,res)=>{
    let id = Number(req.params.id)
    let idx = users.findIndex(user => Number(user.id) == id)
    if(idx >-1){
        return res.send(users[idx])
    }
    return res.status(400).send({msg:"Nincs ilyen azonosítójú felhasználó!"})
    
})


// POST new user
app.post('/users', (req,res)=>{
 let data = req.body;
 if(isEmailExist(data.email)){
    return res.status(400).send({msg:"bademail"})
 }
 data.id = getNextId();
 users.push(data)
 res.send({msg: "Sikeres regisztráció!"})
 saveUsers()
});

//POST user login

app.post('/users/login', (req, res) => {
    let {email, password} = req.body;
    let loggeduser = {}
    users.forEach(user=> {
        if(user.email == email && user.password == password){
            loggeduser = user
            return
        }

    })
    res.send(loggeduser)
})
// DELETE user
app.delete('/users/:id', (req,res)=>{
    let id = req.params.id
    let idx = users.findIndex(user => user.id == id)
    if(idx >-1){
        users.splice(idx,1)
        return res.send({msg:"A felhasználó törölve."})
    }
    return res.status(400).send({msg:"Nincs ilyen azonosítójú felhasználó!"})
    saveUsers()
});
//UPDATE password
app.patch('/users/changepass/:id', (req, res) => {
    let id = Number(req.params.id)
    let data = req.body
    let idx = users.findIndex(user => Number(user.id) === id)
    if (idx > -1) {
        if (data.oldpass && data.newpass) {
            if (data.oldpass != users[idx].password) {
                return res.status(400).send({ msg: "A regi jelszo nem jo" })
            }
            users[idx].password = data.newpass
            saveUsers()
            return res.send({ msg: "A jelszo modositva",user : users[idx] })
        }
        return res.status(400).send({ msg: "nem irtal be minden adatot" })
    }
    return res.status(400).send({ msg: "nincs ilyen azonositoval rendelkezo felhasznalo" })
})

// UPDATE user by id
app.patch('/users/:id', (req,res)=>{
    let id=Number(req.params.id)
    let data = req.body
    let idx = users.findIndex(user => Number(user.id) == id)
    if(idx >-1){
        if(data.email&&data.email!=users[idx].email){
            let exists=users.some(user=>user.email==data.email&&Number(user.id)!=id)
            if(exists){
                return res.status(400).send({msg:"Ez az email cim mar foglalt :0"})
            }
            users[idx].email=data.email;
        }
        if(data.name) users[idx].name=data.name;
        saveUsers();
        return res.send({msg: "FElhasznalo modositva",user:users[idx]}) 
    }
    return res.status(400).send({msg:"Nincs ilyen azonosítójú felhasználó!"})
    
})



app.listen(3000)

function getNextId(){
    let nextID = 1;

    if (users.length == 0){
        return nextID
    }
    
    let maxIndex = 0
    for (let i = 0; i < users.length; i++) {
        if(users[i].id > users[maxIndex].id){
            maxIndex = i
        }
        
    }
    return users[maxIndex].id + 1
}

function loadUsers(){
    if(fs.existsSync(USERS_FILE)){
        const raw = fs.readFileSync(USERS_FILE)
        try{
            users = JSON.parse(raw)
        }
        catch(err){
            console.log("Hiba az adatok beolvasása közben!", err)
            users = [];

        }
    }
    else{
        saveUsers()
    }
   
}

function saveUsers(){
    fs.writeFileSync(USERS_FILE,JSON.stringify(users))
}
function isEmailExist(email){
    let exists = false
    users.forEach(user=> {
        if(user.email == email){
            exists = true
            return
        }
    })
    return exists
}
function userLogin(){
    
}