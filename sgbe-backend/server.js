const express = require('express');
const db = require('./db');

const alunoRoutes = require('./routes/aluno');
const livrosRoutes = require('./routes/livros');
const emprestimosRoutes = require('./routes/emprestimos');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/alunos', alunoRoutes);
app.use('/livros', livrosRoutes);
app.use('/emprestimos', emprestimosRoutes);

// Rota de status
app.get('/', (req, res) => {
    res.json({ message: 'SGBE API - Sistema de Gestão de Biblioteca Escolar', status: 'Online' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
