import React from 'react';
import extenso from 'extenso';

// --- Tipos ---
type CartItem = {
  produto: { nome: string; preco: number; };
  quantidade: number;
};
type CupomProps = {
  itens: CartItem[];
  total: number;
  pagamento: string;
  id: number;
  cliente?: string;
};

// --- Funções Auxiliares (Não Mudam) ---
const dataPorExtenso = (data: Date): string => {
    const dia = data.getDate();
    const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    const mes = meses[data.getMonth()];
    const ano = data.getFullYear();
    return `${dia} dias do mês de ${mes} do ano de ${ano}`;
};

// --- 1. Componente: Layout Estreito do Cupom ---
const CupomTicket = ({ id, itens, total, pagamento, cliente, dataVenda }: Omit<CupomProps, 'pagamento'> & { pagamento: string, dataVenda: Date }) => {
    return (
        // Força uma quebra de página *após* este bloco, se não houver espaço
        <div className="font-mono w-[794px] bg-white text-sm mx-auto p-8 rounded-lg shadow-lg border border-gray-300">
  {/* Cabeçalho */}
  <div className="text-center mb-6 border-b border-dashed border-gray-400 pb-3">
    <p className="text-xl font-bold tracking-wide">MULLER SYSTEM AUTO PEÇAS</p>
    <p className="text-[13px] text-gray-700 mt-1">CNPJ: 00.000.000/0001-00</p>
    <p className="text-[13px] text-gray-700">
      Av. Primeiro de Maio, 123 - Ouro Fino - MG
    </p>
  </div>

  {/* Informações da venda */}
  <div className="border-b border-dashed border-gray-400 pb-3 mb-4">
    <div className="flex justify-between text-[15px]">
      <span>{dataVenda.toLocaleDateString("pt-BR")}</span>
      <span>{dataVenda.toLocaleTimeString("pt-BR")}</span>
    </div>
    <div className="flex justify-between mt-2 text-[15px] font-semibold">
      <span>Venda Nº {id}</span>
      <span className="text-gray-700">CUPOM NÃO FISCAL</span>
    </div>
    {cliente && (
      <p className="mt-2 text-gray-700 text-[15px]">
        <span className="font-semibold">Cliente:</span> {cliente}
      </p>
    )}
  </div>

  {/* Tabela de itens */}
  <table className="w-full border-collapse text-[15px]">
    <thead>
      <tr className="border-b border-dashed border-gray-400">
        <th className="text-left font-semibold pb-2">DESCRIÇÃO</th>
        <th className="text-center font-semibold pb-2">QTD</th>
        <th className="text-right font-semibold pb-2">UNIT.</th>
        <th className="text-right font-semibold pb-2">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      {itens.map((item, index) => (
        <tr key={index} className="border-b border-gray-200">
          <td className="py-2">{item.produto.nome}</td>
          <td className="text-center py-2">{item.quantidade}</td>
          <td className="text-right py-2">
            {item.produto.preco.toFixed(2)}
          </td>
          <td className="text-right py-2">
            {(item.quantidade * item.produto.preco).toFixed(2)}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* Totais */}
  <div className="mt-6 border-t border-dashed border-gray-400 pt-3 text-[15px]">
    <div className="flex justify-between mb-1">
      <span>Subtotal</span>
      <span>R$ {total.toFixed(2)}</span>
    </div>
    <div className="flex justify-between font-bold text-lg mt-2">
      <span>TOTAL A PAGAR</span>
      <span>R$ {total.toFixed(2)}</span>
    </div>
    <div className="flex justify-between text-[14px] mt-2 text-gray-700">
      <span>Pagamento:</span>
      <span className="capitalize">{pagamento}</span>
    </div>
  </div>

  {/* Rodapé */}
  <div className="text-center mt-8 border-t border-dashed border-gray-400 pt-3 text-[13px]">
    <p className="font-semibold text-gray-800">Obrigado pela preferência!</p>
    <p className="mt-1 text-gray-700">
      Para trocas, apresente este comprovante.
    </p>
  </div>
</div>

    );
};

// --- 2. Componente: Layout Amplo da Nota Promissória ---
const NotaPromissoria = ({ total, cliente, dataVenda }: { total: number, cliente?: string, dataVenda: Date }) => {
    const valorExtenso = extenso(total, { mode: 'currency', currency: { type: 'BRL' } });
    const dataVencimento = new Date(dataVenda);
    dataVencimento.setDate(dataVenda.getDate() + 30);
    const dataVencimentoExtenso = dataPorExtenso(dataVencimento);

    return (
        <div
            // break-before-page: GARANTE que sempre começará em uma nova página.
            // w-11/12 mx-auto: Garante que o documento use uma boa largura em A4 e fique centralizado.
            className="font-serif border-2 border-black p-4 text-sm 
                       break-before-page break-inside-avoid 
                       w-11/12 mx-auto"
        >
            {/* ... (Conteúdo da Nota Promissória, sem mudanças no layout) ... */}
            <h2 className="text-center font-bold text-xl mb-4">NOTA PROMISSÓRIA</h2>
            <div className="grid grid-cols-3 gap-x-8 mb-2">
                <div className="border border-black px-2 py-1">Nº <span className="ml-4 font-semibold">NP-{1000 + dataVenda.getMilliseconds()}</span></div>
                <div className="border border-black px-2 py-1">Vencimento: <span className="ml-2 font-semibold">{dataVencimento.toLocaleDateString('pt-BR')}</span></div>
                <div className="border border-black px-2 py-1 font-bold text-center">R$ {total.toFixed(2)}</div>
            </div>
            <p className="mb-2">
                Ao(s) <span className="font-semibold">{dataVencimentoExtenso}</span>, pagarei por esta única via de <span className="font-bold">NOTA PROMISSÓRIA</span> a{' '}
                <span className="font-semibold">MULLER SYSTEM AUTO PEÇAS</span> (CPF/CNPJ: Seu CNPJ de MEI aqui) ou à sua ordem, a quantia de:
            </p>
            <div className="border border-black p-2 text-center font-semibold mb-2">
                {valorExtenso.toUpperCase()}
            </div>
            <p className="mb-4">em moeda corrente deste país, pagável em <span className="font-semibold">Ouro Fino-MG</span>.</p>
            <div className="grid grid-cols-2 gap-x-8">
                <div>
                    <p className="mb-1">EMITENTE: <span className="font-bold">{cliente || '_________________________________'}</span></p>
                    <p className="mb-1">CPF/CNPJ: ________________________</p>
                    <p className="mb-1">ENDEREÇO: ____________________________________________________</p>
                </div>
                <div className="text-right">
                    <p>Ouro Fino-MG, {dataVenda.toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
            <div className="border-2 border-black mt-4 p-2">
                <p className="font-bold mb-4">Avalistas</p>
                <p className="mb-1">NOME: ____________________________________________________</p>
                <p className="mb-1">CPF/CNPJ: ________________________</p>
            </div>
            <div className="mt-12 flex justify-end">
                <div className="text-center">
                    <p className="border-t border-black px-20 pt-1">ASSINATURA</p>
                </div>
            </div>
        </div>
    );
};

// --- Componente Principal (Junta os dois) ---
export default function CupomNaoFiscal({ id, itens, total, pagamento, cliente }: CupomProps) {
    const dataVenda = new Date();

    return (
        // O container principal pode ter a largura de uma página para a impressão
        <div className="print-section bg-white text-black font-sans min-h-screen max-w-full">
            
            {/* 1. COMPROVANTE DE VENDA (Sempre visível) */}
            <CupomTicket
                id={id}
                itens={itens}
                total={total}
                pagamento={pagamento}
                cliente={cliente}
                dataVenda={dataVenda}
            />

            {/* 2. NOTA PROMISSÓRIA (Condicional e em nova página) */}
            {pagamento === 'A Prazo' && (
                <NotaPromissoria total={total} cliente={cliente} dataVenda={dataVenda} />
            )}
        </div>
    );
}