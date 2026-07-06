const express = require("express");
const router = express.Router();
const seedDemo = require("../db/seedDemo");
const { registrarLog } = require("../helpers/audit");

// GERAR DADOS DE DEMONSTRACAO (ADMIN) - util quando o disco do Render
// e efemero e os dados somem apos o servico "dormir"/reiniciar.
router.get("/demo", async (req, res) => {
  try {
    const resumo = await seedDemo();
    if (resumo.jaSeedado) {
      return res.redirect("/dashboard?info=Dados de demonstracao ja existiam, nada foi inserido.");
    }
    registrarLog(req, "SEED_DEMO", `Dados de demonstracao gerados: ${JSON.stringify(resumo)}`);
    res.redirect("/dashboard?info=Dados de demonstracao gerados com sucesso.");
  } catch (err) {
    res.status(500).send("Erro ao gerar dados de demonstracao: " + err.message);
  }
});

module.exports = router;
