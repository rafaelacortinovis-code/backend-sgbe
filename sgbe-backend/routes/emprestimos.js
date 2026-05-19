const express = require('express');
const router = express.Router();
const db = require('../db');

// Rota para listar todos os empréstimos
router.get('/', async (req, res) => {
    try {
        const [emprestimos] = await db.query('SELECT * FROM emprestimos');
        res.json(emprestimos);
    } catch (err) {
        console.error('Erro ao buscar empréstimos:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar um empréstimo por ID
router.get('/:id', async (req, res) => {
    try {
        const [emprestimo] = await db.query('SELECT * FROM emprestimos WHERE id = ?', [req.params.id]);
        if (emprestimo.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }
        res.json(emprestimo[0]);
    } catch (err) {
        console.error('Erro ao buscar empréstimo por ID:', err);
        res.status(500).json({ error: err.message });
    }
});

// Rota para criar um novo empréstimo
router.post('/novo', async (req, res) => {
    try {
        const { aluno_id, livro_id } = req.body;

        // Validação básica de entrada
        if (!aluno_id || !livro_id) {
            return res.status(400).json({ error: 'aluno_id e livro_id são obrigatórios' });
        }

        // Verificar se o livro existe e está disponível
        const [livros] = await db.query(
            'SELECT id, disponivel FROM livros WHERE id = ?', [livro_id]
        );
        if (livros.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        const livro = livros[0];
        if (!livro.disponivel) {
            return res.status(400).json({ error: 'Livro indisponível para empréstimo' });
        }

        // Verificar se o aluno existe
        const [alunos] = await db.query('SELECT id FROM alunos WHERE id = ?', [aluno_id]);
        if (alunos.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const hoje = new Date();
        const prevista = new Date();
        prevista.setDate(hoje.getDate() + 7); // Data de devolução prevista (7 dias após)

        const [result] = await db.query(
            `INSERT INTO emprestimos (aluno_id, livro_id, data_emprestimo, data_prevista)
            VALUES (?, ?, ?, ?)`,
            [aluno_id, livro_id, hoje, prevista]
        );

        await db.query('UPDATE livros SET disponivel = FALSE WHERE id = ?', [livro_id]);

        res.status(201).json({ message: 'Empréstimo realizado com sucesso', id: result.insertId, aluno_id, livro_id, data_emprestimo: hoje, data_prevista: prevista });
    } catch (err) {
        console.error('Erro ao realizar empréstimo:', err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;