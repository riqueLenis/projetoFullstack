import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  const n8nClearWebhookUrl = process.env.N8N_CLEAR_URL;

  if (!n8nClearWebhookUrl) {
    console.error("variavel de ambiente N8N_CLEAR_URL não está definida.");
    return NextResponse.json(
      { message: "erro de config no servidor." },
      { status: 500 }
    );
  }

  try {
    const n8nResponse = await fetch(n8nClearWebhookUrl, { method: 'POST' });

    if (!n8nResponse.ok) {
      throw new Error(`o n8n respondeu com o status: ${n8nResponse.status}`);
    }

    const result = await n8nResponse.json().catch(() => ({}));

    console.log("limpeza executada:", result);

    return NextResponse.json(
      { message: 'dados limpos', details: result },
      { status: 200 }
    );

  } catch (error: unknown) {
    let errorMessage = 'um erro desconhecido ocorreu';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("erro ao chamar:", errorMessage);
    return NextResponse.json(
      { message: 'falha ao executar a limpeza.', error: errorMessage },
      { status: 500 }
    );
  }
}
