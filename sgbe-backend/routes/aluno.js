const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para listar todos os alunos
router.get('/', async (req, res) => {
    try {
        const [alunos] = await db.query('SELECT * FROM alunos');
        res.json(alunos);
    } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar um aluno por ID
router.get('/:id', async (req, res) => {
    try {
        const [aluno] = await db.query('SELECT * FROM alunos WHERE id = ?', [req.params.id]);
        if (aluno.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json(aluno[0]);
    } catch (err) {
        console.error('Erro ao buscar aluno por ID:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para criar um novo aluno
router.post('/', async (req, res) => {
    try {
        const { nome, email, matricula } = req.body;
        if (!nome || !email || !matricula) {
            return res.status(400).json({ error: 'Nome, email e matrícula são obrigatórios' });
        }
        const [result] = await db.query(
            'INSERT INTO alunos (nome, email, matricula) VALUES (?, ?, ?)',
            [nome, email, matricula]
        );
        res.status(201).json({ message: 'Aluno cadastrado com sucesso', id: result.insertId, nome, email, matricula });
    } catch (err) {
        console.error('Erro ao cadastrar aluno:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para atualizar um aluno
router.put('/:id', async (req, res) => {
    try {
        const { nome, email, matricula } = req.body;
        const { id } = req.params;
        if (!nome || !email || !matricula) {
            return res.status(400).json({ error: 'Nome, email e matrícula são obrigatórios' });
        }
        const [result] = await db.query(
            'UPDATE alunos SET nome = ?, email = ?, matricula = ? WHERE id = ?',
            [nome, email, matricula, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno atualizado com sucesso', id, nome, email, matricula });
    } catch (err) {
        console.error('Erro ao atualizar aluno:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para deletar um aluno
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM alunos WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }
        res.json({ message: 'Aluno deletado com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar aluno:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;