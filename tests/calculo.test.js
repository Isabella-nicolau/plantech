describe("Calculo do total da venda", () => {
  function calcularTotalVenda(itens, desconto) {
    const subtotal = itens.reduce((acc, item) => acc + item.qtd * item.preco, 0);
    return Math.max(0, subtotal - (desconto || 0));
  }

  test("subtotal sem desconto", () => {
    const itens = [
      { qtd: 2, preco: 45.0 },
      { qtd: 1, preco: 25.0 },
    ];
    expect(calcularTotalVenda(itens, 0)).toBe(115.0);
  });

  test("subtotal com desconto", () => {
    const itens = [{ qtd: 3, preco: 10.0 }];
    expect(calcularTotalVenda(itens, 5)).toBe(25.0);
  });

  test("desconto maior que subtotal resulta em 0", () => {
    const itens = [{ qtd: 1, preco: 10.0 }];
    expect(calcularTotalVenda(itens, 50)).toBe(0);
  });

  test("carrinho vazio resulta em 0", () => {
    expect(calcularTotalVenda([], 0)).toBe(0);
  });
});
