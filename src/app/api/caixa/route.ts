// src/app/api/caixa/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Gera o relatório de fluxo de caixa em um período (para gráficos e KPIs)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Parâmetros de data
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        // Define um período padrão de 7 dias se não for especificado
        const endDate = endDateParam ? new Date(endDateParam) : new Date();
        const startDate = startDateParam ? new Date(startDateParam) : new Date();
        
        // Se startDateParam não foi fornecido, define a data inicial como 7 dias atrás
        if (!startDateParam) {
            startDate.setDate(endDate.getDate() - 7);
        }

        // Garante que o final do dia final seja incluído
        endDate.setHours(23, 59, 59, 999);
        startDate.setHours(0, 0, 0, 0);

        // --- 1. Movimentações Detalhadas (para a tabela) ---
        const movimentos = await prisma.movimentacaoCaixa.findMany({
            where: {
                dataHora: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            orderBy: {
                dataHora: 'desc',
            }
        });

        // --- 2. KPIs e Agrupamento (para gráficos) ---
        const totalEntradas = movimentos
            .filter(m => m.tipo === 'ENTRADA')
            .reduce((sum, m) => sum + Number(m.valor), 0);

        const totalSaidas = movimentos
            .filter(m => m.tipo === 'SAIDA')
            .reduce((sum, m) => sum + Number(m.valor), 0);

        const saldoFinal = totalEntradas - totalSaidas;

        // Agrupamento por dia (para o gráfico de barras)
        const fluxoDiario: { [key: string]: { entradas: number, saidas: number } } = {};
        
        movimentos.forEach(mov => {
            const dateKey = mov.dataHora.toISOString().split('T')[0]; // Ex: 2025-10-14
            if (!fluxoDiario[dateKey]) {
                fluxoDiario[dateKey] = { entradas: 0, saidas: 0 };
            }

            const valor = Number(mov.valor);
            if (mov.tipo === 'ENTRADA') {
                fluxoDiario[dateKey].entradas += valor;
            } else {
                fluxoDiario[dateKey].saidas += valor;
            }
        });

        const graficoData = Object.keys(fluxoDiario).sort().map(date => ({
            data: date,
            entradas: fluxoDiario[date].entradas,
            saidas: fluxoDiario[date].saidas,
        }));

        return NextResponse.json({
            kpis: {
                totalEntradas,
                totalSaidas,
                saldoFinal,
            },
            grafico: graficoData,
            movimentacoes: movimentos.map(m => {
                const dataHoraISO = m.dataHora instanceof Date 
                    ? m.dataHora.toISOString() 
                    : new Date(m.dataHora).toISOString();
                return {
                    id: m.id,
                    tipo: m.tipo,
                    valor: Number(m.valor),
                    descricao: m.descricao,
                    dataHora: dataHoraISO,
                };
            }),
            periodo: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
            }
        });

    } catch (error) {
        console.error("Erro ao gerar relatório de caixa:", error);
        return NextResponse.json({ error: 'Erro interno do servidor ao buscar dados do caixa' }, { status: 500 });
    }
}

// POST: Registra uma nova movimentação no caixa
export async function POST(request: NextRequest) {
    try {
        const { tipo, valor, descricao } = await request.json();

        if (!tipo || !valor || !descricao || (tipo !== 'ENTRADA' && tipo !== 'SAIDA')) {
            return NextResponse.json({ error: 'Dados incompletos ou tipo inválido' }, { status: 400 });
        }

        const novaMovimentacao = await prisma.movimentacaoCaixa.create({
            data: {
                tipo,
                valor: parseFloat(valor),
                descricao,
            }
        });

        return NextResponse.json({
            ...novaMovimentacao,
            valor: Number(novaMovimentacao.valor),
        }, { status: 201 });

    } catch (error) {
        console.error('Erro ao registrar movimentação:', error);
        return NextResponse.json({ error: 'Erro ao registrar movimentação' }, { status: 500 });
    }
}