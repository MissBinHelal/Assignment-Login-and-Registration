const express = require("express");
const app = express();
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require("bcrypt");
mongoose.connect('mongodb://localhost/validation', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const flash = require('express-flash');
app.use(flash());
//session 
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
//model set up
const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, minlength: 3 },
    last_name: { type: String, required: true, minlength: 3 },
    email: {
        type: String, required: true, minlength: 10, unique: true,
        //   validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: { type: String, required: [true, 'Password cannot be left blank'], minlength: 8 },
    birthday: { type: Date, required: [true, 'Date of birth must be provided'] }
}, { timestamps: true });

// create an object to that contains methods for mongoose to interface with MongoDB
const User = mongoose.model('User', userSchema);


app.get('/', (req, res) => {

    res.render('index')
})
app.get('/registeration', (req, res) => {

    res.render('reg')
})

app.post('/registeration', (req, res) => {

    const hashedPasword = bcrypt.hash(req.body.password, 10)
    const user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        birthday: req.body.birthday,
        password: hashedPasword
    })

    user.save()
        .then(() => res.redirect('/'))
        .catch(err => {
            console.log("We have an error!", err);
            for (var key in err.errors) {
                req.flash('registration', err.errors[key].message);
            }
            res.redirect('/');
        });
});

app.get('/login', (req, res) => {
    res.render('login')
})
//this  asynchronous  code
app.post('/login', async (req, res) => {
    try {
        var user = User.findOne({ email: req.body.email })
        //first if the email doesnt exist
        if (!user) {
            console.log("the email doesnt exsit");

            // return res.status(400).send({ message: "the email doesnt exsit" })
            res.redirect('/registeration')
        }
        //second if the password is wrong
        var passwordform = bcrypt.hash(req.body.password, 10)
        if (!bcrypt.compare(passordform, user.password)) {
            console.log("wrong password");

            return res.status(400).send({ message: "wrong password" })
        }
        res.redirect('/')

    } catch (err) {
        console.log("error");

        return res.status(500).send(err)
    }

});

app.listen(3000, () => console.log("listening on port 3000"))