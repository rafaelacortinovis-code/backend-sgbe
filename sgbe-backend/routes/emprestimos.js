const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                e.*,
                a.nome AS aluno_nome,
                l.titulo AS livro_titulo,
                CASE
                    WHEN e.data_devolucao IS NULL AND e.data_prevista < CURDATE() THEN TRUE
                    ELSE FALSE
                END AS atrasado
            FROM
                emprestimos e
            JOIN alunos a ON e.aluno_id = a.id
            JOIN livros l ON e.livro_id = l.id`);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Erro ao buscar empréstimos:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            return res.status(400).json({ error: 'ID de empréstimo inválido' });
        }
        const [rows] = await db.query(`
            SELECT
                e.*,
                a.nome AS aluno_nome,
                l.titulo AS livro_titulo,
                CASE
                    WHEN e.data_devolucao IS NULL AND e.data_prevista < CURDATE() THEN TRUE
                    ELSE FALSE
                END AS atrasado
            FROM
                emprestimos e
            JOIN alunos a ON e.aluno_id = a.id
            JOIN livros l ON e.livro_id = l.id
            WHERE e.id = ?`, [parsedId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error('Erro ao buscar empréstimo por ID:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { aluno_id, livro_id } = req.body;

        if (!aluno_id || !livro_id) {
            return res.status(400).json({ error: 'aluno_id e livro_id são obrigatórios' });
        }

        const [livros] = await db.query(
            'SELECT id, disponivel FROM livros WHERE id = ?', [livro_id]
        );
        if (livros.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        if (!livros[0].disponivel) {
            return res.status(400).json({ error: 'Livro indisponível para empréstimo' });
        }

        const [alunos] = await db.query('SELECT id FROM alunos WHERE id = ?', [aluno_id]);
        if (alunos.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const hoje = new Date();
        const prevista = new Date();
        prevista.setDate(hoje.getDate() + 7);

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

router.put('/:id/devolver', async (req, res) => {
    try {
        const { id } = req.params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            return res.status(400).json({ error: 'ID de empréstimo inválido' });
        }
        
        const [emprestimos] = await db.query('SELECT livro_id, data_devolucao FROM emprestimos WHERE id = ?', [parsedId]);
        if (emprestimos.length === 0) {
            return res.status(404).json({ error: 'Empréstimo não encontrado' });
        }
        const emprestimo = emprestimos[0];

        if (emprestimo.data_devolucao) {
            return res.status(400).json({ error: 'Este empréstimo já foi devolvido' });
        }

        const hoje = new Date();
        await db.query(
            'UPDATE emprestimos SET data_devolucao = ? WHERE id = ?',
            [hoje, parsedId]
        );

        await db.query('UPDATE livros SET disponivel = TRUE WHERE id = ?', [emprestimo.livro_id]);

        res.status(200).json({ message: 'Livro devolvido com sucesso', id, data_devolucao: hoje });
    } catch (err) {
        console.error('Erro ao registrar devolução:', err);
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;