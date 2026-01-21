// src/components/ComprovantePrint.tsx
interface Props {
  pendenciaId: number;
  clienteNome: string;
  valor: number;
  descricao: string;
  dataPago: string;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrency = (value: number) =>
  `R$ ${value.toFixed(2).replace(".", ",")}`;

export default function ComprovantePrint({
  pendenciaId,
  clienteNome,
  valor,
  descricao,
  dataPago,
}: Props) {
  return (
    <div className="print-root">
      <h1>COMPROVANTE DE PAGAMENTO</h1>
      <p className="small">Pendência #{pendenciaId}</p>

      <hr />

      <p className="label">Cliente</p>
      <p className="value">{clienteNome}</p>

      <p className="label">Descrição</p>
      <p className="value">{descricao}</p>

      <div className="valor">
        <span>VALOR PAGO</span>
        <strong>{formatCurrency(valor)}</strong>
      </div>

      <p className="label">Data e Hora</p>
      <p className="value">{formatDate(dataPago)}</p>

      <hr />

      <footer>
        <p>Muller System</p>
        <p>Sistema de Gestão Comercial</p>
      </footer>
    </div>
  );
}
