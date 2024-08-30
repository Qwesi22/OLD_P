const express = require('express');
const port = 4000;
const path = require ('path');
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { error } = require('console');
const { ClientRequest } = require('http');
const { data } = require('jquery');

const app = express();
// bcrypt
const saltRounds = 10;

app.use(bodyParser.json());
// Access HTML files n Css
app.use(express.static(path.join(__dirname, '/src/user')));



app.use(bodyParser.urlencoded({
    extended: true
}));

// Connect to database
mongoose.connect('mongodb://localhost:27017/healthease', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', () => console.log("Error connecting to database"));
db.once('open', () => console.log("Connected to database"));

// Create Schema 

const clientSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    password2: String
});
//var Client = [];

const Client = mongoose.model('clients', clientSchema);


// Serve the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/src/user/index.html'));
});

// Sign up
app.post("/sign-up", async (req, res) => {
    const { username, email, password, password2 } = req.body;

    // Not Null and alert
    if (!username || !email || !password || !password2) {
        return res.status(400).send(`
            <script>
            window.alert("Please fill all fields");
            window.history.back();
        </script> 
        `)
        
    }
    
    // Validate password and alert
    if (password !== password2) {
        return res.status(400).send(`    
            <script>
            window.alert("Passwords do not match");
            window.history.back();
        </script> 
        `)
    }
    // Hash Password
    const hashPassword = await bcrypt.hash(password, saltRounds);

        const data = {
        username: username,
        email: email,
        password: hashPassword,
        password2: hashPassword
    };
    db.collection('clients').insertOne(data, (err, collection) => {
        if (err) {
            console.error('Error saving client data:', err);
            return res.status(500).send('Error saving data');
        }
        console.log("Account created successfully");
        return res.redirect('sign-in.html');
    });
    
});

// Sign-In
app.post("/sign-in",async ( req, res ) => {
    const { login_username, login_password } = req.body;

    const user = await Client.findOne({ username: login_username});
        if(!user) {
            return res.status(400).send(`
                 <script>
            window.alert("User not found");
            window.history.back();
        </script>
                `);
            } 
            
    const isMatch = await bcrypt.compare(login_password, user.password);
            if (isMatch){
                console.log("Logged In Successfully")
                return res.redirect('homepage.html');
            } else {
                return res.status(400).send('Incorrect login details')
            }
        })


    

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
