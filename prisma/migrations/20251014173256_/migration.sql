-- CreateTable
CREATE TABLE "MovimentacaoCaixa" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoCaixa_pkey" PRIMARY KEY ("id")
);
