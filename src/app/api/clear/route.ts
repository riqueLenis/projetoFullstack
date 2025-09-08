/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_: NextRequest) {
  const n8nClearWebhookUrl = process.env.N8N_CLEAR_URL;

  if (!n8nClearWebhookUrl) {
    console.error('Variável de ambiente N8N_CLEAR_URL não está definida.');
    return NextResponse.json({ message: 'Erro de configuração no servidor.' }, { status: 500 });
  }

  try {
    const n8nResponse = await fetch(n8nClearWebhookUrl, { method: 'POST' });

    if (!n8nResponse.ok) throw new Error(`O n8n respondeu com status: ${n8nResponse.status}`);

    const result = await n8nResponse.json().catch(() => ({}));
    console.log('Limpeza executada:', result);

    return NextResponse.json({ message: 'Dados limpos', details: result }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao chamar:', errorMessage);

    return NextResponse.json({ message: 'Falha ao executar a limpeza.', error: errorMessage }, { status: 500 });
  }
}
