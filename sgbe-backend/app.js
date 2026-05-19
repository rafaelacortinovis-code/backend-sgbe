const express = require('express');
const db = require('./db');

const alunoRoutes = require('./routes/aluno');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/alunos', alunoRoutes);
app.use('/livros', livrosRoutes);
app.use('/emprestimos', emprestimosRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'SGBE API - Sistema de Gestão de Biblioteca Escolar', status: 'Online' });
});

db.query('SELECT 1')
    .then(() => console.log('Banco de Dados Conectado!'))
    .catch(err => {
        console.error('ERRO DE CONEXÃO COM O BANCO:', err.message);
    });

module.exports = app;