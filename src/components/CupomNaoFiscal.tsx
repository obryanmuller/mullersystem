import React from 'react';
import Image from 'next/image';

// Define os tipos de dados
type CartItem = {
  produto: { nome: string; preco: number; };
  quantidade: number;
};
type CupomProps = {
  itens: CartItem[];
  total: number;
  pagamento: string;
  id: number; // ID da Venda
  cliente?: string;
};

export default function CupomNaoFiscal({ id, itens, total, pagamento, cliente }: CupomProps) {
  const dataVenda = new Date();

  return (
    <div className="print-section bg-white text-black font-sans w-[302px] p-2">
      <div className="text-center mb-2">
        <Image
          src="/logo/Logo.png"
          alt="Logo Muller System"
          width={100}
          height={33}
          className="mx-auto my-2"
        />
        <p className="font-semibold text-sm">MULLER SYSTEM</p>
        <p className="text-xs">Seu CNPJ de MEI aqui</p>
        <p className="text-xs">Avenida Primeiro de Maio, 123 - Ouro Fino - MG</p>
      </div>
      
      <div className="border-t border-b border-dashed border-black py-1 my-2 text-xs">
        <div className="flex justify-between">
          <span>{dataVenda.toLocaleDateString('pt-BR')}</span>
          <span>{dataVenda.toLocaleTimeString('pt-BR')}</span>
        </div>
        <div className="flex justify-between">
          <span>Venda Nº: {id}</span>
          <span>CUPOM NÃO FISCAL</span>
        </div>
        {cliente && <p>Cliente: {cliente}</p>}
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="text-left font-semibold pb-1">PRODUTO</th>
            <th className="text-right font-semibold pb-1">QTD</th>
            <th className="text-right font-semibold pb-1">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, index) => (
            <tr key={index}>
              <td className="text-left py-1">
                <div>{item.produto.nome}</div>
                <div className="text-gray-600">R$ {item.produto.preco.toFixed(2)}</div>
              </td>
              <td className="text-right align-top pt-1">{item.quantidade}</td>
              <td className="text-right align-top pt-1">R$ {(item.quantidade * item.produto.preco).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 border-t border-dashed border-black pt-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-2">
          <span>TOTAL</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>Pagamento:</span>
          <span>{pagamento}</span>
        </div>
      </div>
      
      <div className="text-center mt-4 border-t border-dashed border-black pt-2">
        <p className="font-semibold text-xs">Obrigado pela preferência!</p>
        <p className="text-xs mt-1">Para trocas, apresente este comprovante.</p>
      </div>
    </div>
  );
};