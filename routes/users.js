const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

const saltRounds = 10;

// Rota para buscar os usuários da tabela users
router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.log("Erro ao buscar usuário", err);
            return res.status(500).send("Erro ao buscar usuários");
        }
        res.render('index', { users: results }); // Passa a lista de usuários para o template
    });
});

// Renderiza a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

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

        // Verifica se o usuário foi encontrado
        if (results.length === 0) {
            return res.status(401).send('Email ou senha inválidos');
        }

        const user = results[0]; // O usuário encontrado no banco de dados
        const hashPassword = user.password; // O hash de senha armazenado

        // Compara a senha fornecida pelo usuário com o hash armazenado usando bcrypt
        bcrypt.compare(password, hashPassword, (err, isMatch) => {
            if (err) {
                console.log('Erro ao comparar as senhas:', err);
                return res.status(500).send('Erro ao verificar a senha');
            }

            if (isMatch) {
                // Se as senhas coincidirem, o login está correto
                // Redireciona para a página inicial ou o dashboard
                res.redirect('/');
            } else {
                // Se as senhas não coincidirem
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
            res.redirect('/');
        });
    });
});

module.exports = router;
