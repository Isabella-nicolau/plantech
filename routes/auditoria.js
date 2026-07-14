const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.get("/", (req, res) => {
  const { dataInicio, dataFim } = req.query;
  let sql = `
    SELECT log.idLog, log.dataHora, log.idUsuario, log.acao, log.detalhe, log.ip,
           COALESCE(u.username, 'anonimo') AS usuario
    FROM LogAuditoria log
    LEFT JOIN Usuario u ON u.id = log.idUsuario
  `;
  const params = [];
  const conditions = [];

  if (dataInicio) {
    conditions.push("date(log.dataHora) >= ?");
    params.push(dataInicio);
  }
  if (dataFim) {
    conditions.push("date(log.dataHora) <= ?");
    params.push(dataFim);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY log.dataHora DESC LIMIT 200";

  db.all(sql, params, (err, logs) => {
    res.render("auditoria", {
      logs: logs || [],
      query: { dataInicio: dataInicio || "", dataFim: dataFim || "" },
      erro: err ? err.message : null
    });
  });
});

module.exports = router;
