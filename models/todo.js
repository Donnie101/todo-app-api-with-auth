const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    todo: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }

});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = { Todo };