const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    const data = req.body;

    const item = await prisma.usuario.create({
        data
    });

    res.json(item).status(201).end();
};

const listar = async (req, res) => {
    const lista = await prisma.usuario.findMany();

    res.json(lista).status(200).end();
};


const buscar = async (req, res) => {
    const { id } = req.params;

    try {
        const item = await prisma.usuario.findUnique({
            where: {
                id_usuario: Number(id)
            }
        });

        if (!item) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({
            mensagem: "Erro ao buscar usuário.",
            erro: error.message
        });
    }
};

const atualizar = async (req, res) => {
    const { id } = req.params;
    const dados = req.body;
    
    const item = await prisma.usuario.update({
        where: { id_usuario : Number(id) },
        data: dados
    });

    res.json(item).status(200).end();
};

const excluir = async (req, res) => {
    const { id } = req.params;
    
    const item = await prisma.usuario.delete({
        where: { id_usuario : Number(id) }
    });

    res.json(item).status(200).end();
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
}
