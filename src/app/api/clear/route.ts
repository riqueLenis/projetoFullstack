import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const n8nClearWebhookUrl = process.env.N8N_CLEAR_URL;

  if (!n8nClearWebhookUrl) {
    console.error("A variável de ambiente N8N_CLEAR_URL não está definida.");
    return NextResponse.json(
      { message: "Erro de configuração no servidor." },
      { status: 500 }
    );
  }

  try {
    const n8nResponse = await fetch(n8nClearWebhookUrl, {
      method: 'POST',
    });

    if (!n8nResponse.ok) {
      throw new Error(`O N8N respondeu com o status: ${n8nResponse.status}`);
    }

    return NextResponse.json(
      { message: 'Dados limpos com sucesso!' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Erro ao chamar o webhook do N8N:", error.message);
    return NextResponse.json(
      { message: 'Falha ao executar a limpeza.', error: error.message },
      { status: 500 }
    );
  }
}