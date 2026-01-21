// src/components/ModalComprovantePagamento.tsx
"use client";

import { FiX, FiCheckCircle, FiPrinter } from "react-icons/fi";

interface ModalComprovantePagamentoProps {
  isOpen: boolean;
  onClose: () => void;
  pendenciaId: number;
  clienteNome: string;
  valor: number;
  descricao: string;
  dataPago: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

export default function ModalComprovantePagamento({
  isOpen,
  onClose,
  pendenciaId,
  clienteNome,
  valor,
  descricao,
  dataPago,
}: ModalComprovantePagamentoProps) {

  const handlePrint = () => {
    const content = document.getElementById("comprovante-print");
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprovante de Pagamento</title>
          <style>
            * {
              box-sizing: border-box;
              font-family: Arial, sans-serif;
            }

            body {
              margin: 0;
              padding: 40px;
              background: white;
              color: black;
            }

            .bg-gray-50 { background: #f9fafb; }
            .bg-green-50 { background: #ecfdf5; }

            .text-gray-900 { color: #111827; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            .text-green-700 { color: #15803d; }

            .border-gray-300 { border-color: #d1d5db; }

            .rounded { border-radius: 8px; }
            .p-6 { padding: 24px; }
            .p-4 { padding: 16px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }

            .text-center { text-align: center; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-lg { font-size: 18px; }
            .text-2xl { font-size: 26px; }

            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }

            .border-b {
              border-bottom: 1px solid #d1d5db;
            }

            .border-t {
              border-top: 1px solid #d1d5db;
            }

            @page {
              size: A4;
              margin: 20mm;
            }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>
            window.onload = function () {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">
              Pagamento Confirmado
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* COMPROVANTE */}
        <div
          id="comprovante-print"
          className="bg-gray-50 p-6 rounded-lg"
        >
          <div className="text-center mb-6 pb-6 border-b border-gray-300 text-black">
            <h3 className="text-lg font-bold text-gray-900">
              COMPROVANTE DE PAGAMENTO
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Pendência #{pendenciaId}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Cliente
            </p>
            <p className="text-sm font-bold text-gray-900">
              {clienteNome}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Descrição
            </p>
            <p className="text-sm text-gray-900">
              {descricao}
            </p>
          </div>

          <div className="mb-4 p-4 bg-green-50 rounded">
            <p className="text-xs font-semibold text-green-700 uppercase">
              Valor Pago
            </p>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(valor)}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Data e Hora do Pagamento
            </p>
            <p className="text-sm text-gray-900">
              {formatDate(dataPago)}
            </p>
          </div>

          <div className="text-center pt-6 border-t border-gray-300">
            <p className="text-xs text-gray-500">Muller System</p>
            <p className="text-xs text-gray-500">
              Sistema de Gestão Comercial
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-brand-green text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <FiPrinter size={18} />
            Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
