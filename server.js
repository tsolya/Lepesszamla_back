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
let stepdata = []
const USERS_FILE = path.join(__dirname, 'user.json')
const STEPS_FILE = path.join(__dirname, 'steps.json')
 
loadUsers()
loadStepdata()
// ENDPOINTS
 
app.get('/', (req, res) => {
  res.send({msg:'Backend API by Bajai SZC Türr István Technikum - 13.A Szoftverfejlesztő '})
})
 
// --------------------------USERS----------------------------
 
// GET all users
 
app.get('/users', (req, res)=>{
    res.send(users)
});
 
// GET one user by id
 
app.get('/users/:id',(req,res)=>{
    let id = Number(req.params.id)
    let idx = users.findIndex(user => Number(user.id) === id)
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
    let id = Number(req.params.id)
    let idx = users.findIndex(user => Number(user.id) === id)
    if(idx >-1){
        users.splice(idx,1)
        saveUsers()
        return res.send({msg:"A felhasználó törölve."})
    }
    return res.status(400).send({msg:"Nincs ilyen azonosítójú felhasználó!"})
})
 
// UPDATE user by id
 
app.patch('/users/:id', (req, res) => {
    let id = Number(req.params.id)
    let data = req.body
    let idx = users.findIndex(user => Number(user.id) === id)
    if (idx > -1) {
        if (data.email && data.email != users[idx].email) {
            let exists = users.some(user => user.email === data.email && Number(user.id) !== id)
            if (exists) {
                return res.status(400).send({ msg: "Ez az email cím már foglalt!" })
            }
            users[idx].email = data.email
        }
        if (data.name) users[idx].name = data.name
        saveUsers()
        return res.send({ msg: "A felhasználó módosítva.", user: users[idx] })
    }
    return res.status(400).send({ msg: "Nincs ilyen azonosítójú felhasználó!" })
})
 
//UPDATE password
app.patch('/users/changepass/:id', (req, res) => {
    let id = Number(req.params.id)
    let data = req.body
    let idx = users.findIndex(user => Number(user.id) === id)
    if (idx > -1) {
        if (data.oldpass && data.newpass) {
            if (data.oldpass != users[idx].password) {
                return res.status(400).send({ msg: "A régi jelszó nem megfelelő!" })
            }
            users[idx].password = data.newpass
            saveUsers()
            return res.send({ msg: "A jelszó módosítva.",user : users[idx] })
        }
        return res.status(400).send({ msg: "Nincsenek meg a szükséges adatok!" })
    }
    return res.status(400).send({ msg: "Nincs ilyen azonosítójú felhasználó!" })
})
 
 
// --------------------------STEPS----------------------------
 
// GET all steps of all users
app.get('/steps',(req,res) => {
    res.send(stepdata)
})
 
 
// GET all steps by userID
 
app.get('/steps/user/:uid',(req,res) => {
    let usersteps = []
    let uid = Number(req.params.uid)
    for (let i = 0; i < stepdata.length; i++) {
        if(stepdata[i].uid == uid){
            usersteps.push(stepdata[i])
        }
       
    }
    res.send(usersteps)
})
 
// GET one step by id
 
app.get('/steps/:id', (req,res) =>{
    let id = Number(req.params.id)
    let idx = stepdata.findIndex(step => Number(step.id) === id)
    if(idx >-1){
        return res.send(stepdata[idx])
    }
    return res.status(400).send({msg:"Nincs ilyen azonosítójú léps!"})
})
 
//POST new stepdata
app.post('/steps',(req,res) =>{
    let data = req.body;
    data.id = getNextStepId();
    stepdata.push(data)
    res.send({msg: "Sikeres adatfelvitel!"})
    saveStepdata()
});
 
 
 
//PATCH stepdata by id
 
 
 
// DELETE stepdata
 
 
 
// DELETE all steps by userID
app.delete('/steps/:uid', (req,res) =>{
    let uid = Number(req.params.uid)
    for (let i = 0; i < stepdata.length; i++) {
        if(stepdata[i].uid == uid){
            stepdata.splice(stepdata[i],1)
            i--
        }
       
    }
    res.send("Sikeresen törölve!")
})
 
// DELETE all steps by users
 
 
 
 
app.listen(3000)
function getNextStepId(){
    let nextID = 1;
 
    if (stepdata.length == 0){
        return nextID
    }
   
    let maxIndex = 0
    for (let i = 0; i < stepdata.length; i++) {
        if(stepdata[i].id > stepdata[maxIndex].id){
            maxIndex = i
        }
       
    }
    return stepdata[maxIndex].id + 1
}
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
function saveStepdata(){
    fs.writeFileSync(STEPS_FILE,JSON.stringify(stepdata))
}
function loadStepdata(){
    if(fs.existsSync(STEPS_FILE)){
        const raw = fs.readFileSync(STEPS_FILE)
        try{
            stepdata = JSON.parse(raw)
        }
        catch(err){
            console.log("Hiba az adatok beolvasása közben!", err)
            stepdata = [];
 
        }
    }
    else{
        saveStepdata()
    }
}
 