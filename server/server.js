const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();
const { Todo } = require('../models/todo');
const { User } = require('../models/user')
const { authenticate } = require('../middleware/authenticate')
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/todosdb', { useMongoClient: true });

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcom To The Home Page');
});

//---------------TODOS---------------//

//------GET ALL TODOS---------//
app.get('/todos', authenticate, (req, res) => {
    let creatorId = req.user._id;
    Todo.find({ creatorId }).then((todos) => {
        res.json(todos)
    }).catch((err) => {
        res.send(err);
    })
});

//-----------------ADD A TODO----------//
app.post('/todos', authenticate, (req, res) => {
    let todo = req.body.todo;
    let creatorId = req.user._id;
    if (!todo) return res.send('Nothing was sent');

    Todo.create({ todo, creatorId }).then((todo) => {
        res.send(todo)
    }).catch((err) => {
        res.send(err);
    });
});

//--------------UPDATE TODO-------------//
app.patch('/todos/:id', authenticate, (req, res) => {
    let _id = req.params.id;
    let todo = req.body.todo;
    let completed = req.body.completed;
    let creatorId = req.user._id;

    if (!todo) return res.send('Nothing was sent');


    Todo.findOneAndUpdate({ _id, creatorId }, { todo, completed }, { new: true }).then((todo) => {
        return res.json(todo);
    }).catch((err) => {
        res.send('Somthig went wrong');
    });
});

//-------------DELETE TODO-----------//
app.delete('/todos/:id', authenticate, (req, res) => {
    let _id = req.params.id;
    let creatorId = req.user._id;

    Todo.findOneAndRemove({ _id, creatorId }).then(() => {
        res.send('Todo was deleted')
    }).catch((err) => {
        res.send('something went wrong');
    })
});


//---------------USERS-----------------//


app.post('/signup', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) return res.send('Where is the f email and password');

    User.findOne({ email }).then((user) => {
        if (user) return res.send('Email Alread in use');

        let newUser = new User({ email, password });
        newUser.generateAuthToken();
        newUser.save();
        res.header('x-auth', newUser.tokens[0].token).send('welcom to our website');

    });
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) return res.send('Where is the f email and password');

    User.findOne({ email }).then((user) => {
        if (!user) return res.send('No User Was found');
        user.comparePassword(password, (err, success) => {
            if (err) return res.send(err);
            if (!success) return res.send('Password Incorrect');
            user.generateAuthToken();
            res.header('x-auth', user.tokens[0].token).send('welcom back');
        });
    });
});


app.delete('/logout', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send('you logged out');
    }, () => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log('server is listening');
})