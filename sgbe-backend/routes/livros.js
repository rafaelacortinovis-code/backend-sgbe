const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [livros] = await db.query('SELECT * FROM livros');
        res.json(livros);
    } catch (err) {
        console.error('Erro ao buscar livros:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const [livro] = await db.query('SELECT * FROM livros WHERE id = ?', [req.params.id]);
        if (livro.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.json(livro[0]);
    } catch (err) {
        console.error('Erro ao buscar livro por ID:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { titulo, autor, disponivel } = req.body;
        if (!titulo || !autor) {
            return res.status(400).json({ error: 'Título e autor são obrigatórios' });
        }
        const [result] = await db.query(
            'INSERT INTO livros (titulo, autor, disponivel) VALUES (?, ?, ?)',
            [titulo, autor, disponivel !== undefined ? disponivel : true]
        );
        res.status(201).json({ message: 'Livro cadastrado com sucesso', id: result.insertId, titulo, autor, disponivel: disponivel !== undefined ? disponivel : true });
    } catch (err) {
        console.error('Erro ao cadastrar livro:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { titulo, autor, disponivel } = req.body;
        const { id } = req.params;
        if (!titulo || !autor || disponivel === undefined) {
            return res.status(400).json({ error: 'Título, autor e disponibilidade são obrigatórios' });
        }
        const [result] = await db.query(
            'UPDATE livros SET titulo = ?, autor = ?, disponivel = ? WHERE id = ?',
            [titulo, autor, disponivel, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.json({ message: 'Livro atualizado com sucesso', id, titulo, autor, disponivel });
    } catch (err) {
        console.error('Erro ao atualizar livro:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM livros WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.json({ message: 'Livro deletado com sucesso' });
    } catch (err) {
        console.error('Erro ao deletar livro:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;