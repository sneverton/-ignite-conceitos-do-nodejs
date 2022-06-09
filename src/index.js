const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * @typedef Todo
 * @type {object}
 * @property {string} id 
 * @property {string} title
 * @property {boolean} done
 * @property {string} deadline
 * @property {string} createdat
 */

/**
 * @typedef User
 * @type {object}
 * @property {string} id 
 * @property {string} name
 * @property {string} username
 * @property {Todo[]} todos
 */

/**
 * @type {User[]}
 */
const users = [];

function checksExistsUserAccount(request, response, next) {
  /**
   * @type {{username: string}}
   */
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: 'O usuário não existe.' });
  }

  request.user = user;

  return next();
}

function checksExistsTodo(request, response, next) {
  /**
   * @type {{user: User}}
   */
  const { user } = request;

  /**
  * @type {{id: string}}
  */
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'A tarefa não existe.' });
  }

  request.todo = todo;

  return next();
}

app.post('/users', (request, response) => {
  /**
   * @type {{name: string, username: string}}
   */
  const { name, username } = request.body;


  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return response.status(400).send({ error: 'O usuário já existe.' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  /**
   * @type {{user: User, title: string, deadline: string}}
   */
  const { user } = request;

  response.send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  /**
   * @type {{user: User}}
   */
  const { user } = request;

  /**
   * @type {{title: string, deadline: string}}
   */
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date().toISOString()
  };

  user.todos.push(todo);

  response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  /**
   * @type {{todo: Todo}}
   */
  const { todo } = request;

  /**
   * @type {{title: string, deadline: string}}
   */
  const { title, deadline } = request.body;


  Object.assign(todo, { title, deadline });

  response.send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  /**
   * @type {{todo: Todo}}
   */
  const { todo } = request;

  todo.done = true;

  response.send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  /**
   * @type {{id: string}}
   */
  const { id } = request.params;

  /**
   * @type {{user: User}}
   */
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  user.todos.splice(todoIndex, 1);

  response.status(204).send();
});

module.exports = app;