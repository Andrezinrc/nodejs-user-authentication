const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const saltRounds = 8;
const SECRET_KEY = 'ilovenodejs'; // Use uma chave secreta segura

// Middleware para verificar o token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Rota para buscar os usuários da tabela users (rota protegida)
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.log("Erro ao buscar usuário", err);
            return res.status(500).send("Erro ao buscar usuários");
        }
        res.render('index', { users: results });
    });
});

// Renderiza a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Login de usuário
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Preencha todos os campos');
    }

    // Busca o usuário pelo email no banco de dados
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.log('Erro ao buscar o usuário:', err);
            return res.status(500).send('Erro ao buscar o usuário');
        }

        if (results.length === 0) {
            return res.status(401).send('Email ou senha inválidos');
        }

        const user = results[0];
        const hashPassword = user.password;

        // Compara a senha fornecida pelo usuário com o hash armazenado usando bcrypt
        bcrypt.compare(password, hashPassword, (err, isMatch) => {
            if (err) {
                console.log('Erro ao comparar as senhas:', err);
                return res.status(500).send('Erro ao verificar a senha');
            }

            if (isMatch) {
                // Se as senhas coincidirem, gera um token JWT
                const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
                res.json({ token }); // Retorna o token para o cliente
            } else {
                res.status(401).send('Email ou senha inválidos');
            }
        });
    });
});

// Renderiza a página de registro
router.get('/register', (req, res) => {
    res.render('register');
});

// Processa o registro
router.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }
    if (password != confirmPassword) {
        return res.status(400).send('As senhas não coincidem');
    }

    bcrypt.hash(password, saltRounds, (err, hashPassword) => {
        if (err) {
            console.log('Erro ao criar o hash da senha', err);
            return res.status(500).send('Erro ao processar a senha');
        }

        db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashPassword], (err, results) => {
            if (err) {
                console.log('Erro ao inserir o usuário', err);
                return res.status(500).send('Erro ao adicionar usuário');
            }
            res.redirect('/login');
        });
    });
});

module.exports = router;
