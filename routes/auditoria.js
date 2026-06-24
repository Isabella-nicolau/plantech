const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

router.get("/", (req, res) => {
  const { dataInicio, dataFim } = req.query;
  let sql = `SELECT * FROM LogAuditoria`;
  const params = [];
  const conditions = [];

  if (dataInicio) {
    conditions.push("date(dataHora) >= ?");
    params.push(dataInicio);
  }
  if (dataFim) {
    conditions.push("date(dataHora) <= ?");
    params.push(dataFim);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += " ORDER BY dataHora DESC LIMIT 200";

  db.all(sql, params, (err, logs) => {
    res.render("auditoria", {
      logs: logs || [],
      query: { dataInicio: dataInicio || "", dataFim: dataFim || "" },
      erro: err ? err.message : null
    });
  });
});

module.exports = router;
