const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000

const userRouter = require('./routes/users');

const app = express();

//configura o diretorio para arquivos estaticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//middleware de log de requisicao
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); //chama o proximo middleware
});

//configuracao do body-parser
app.use(bodyParser.urlencoded({ extended: true }));

//configura o diretorio de views e o engine de template
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts); 

//usa as rotas de usuarios
app.use('/', userRouter);

app.listen(port, () => {
    console.log(`servidor rodando na porta ${port}`);
});
