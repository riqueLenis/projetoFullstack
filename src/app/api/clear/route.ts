import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  const n8nClearWebhookUrl = process.env.N8N_CLEAR_URL;

  if (!n8nClearWebhookUrl) {
    console.error("a variavel de ambiente N8N_CLEAR_URL não esta definida");
    return NextResponse.json(
      { message: "erro de config no servidor." },
      { status: 500 }
    );
  }

  try {
    const n8nResponse = await fetch(n8nClearWebhookUrl, {
      method: 'POST',
    });

    if (!n8nResponse.ok) {
      throw new Error(`o N8N respondeu com o status: ${n8nResponse.status}`);
    }
    
    return NextResponse.json(
      { message: 'dados limpos' },
      { status: 200 }
    );

  } catch (error: unknown) {
    let errorMessage = 'um erro desconhecido ocorreu.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("erro ao chamar o webhook do N8N:", errorMessage);
    return NextResponse.json(
      { message: 'falha ao executar a limpeza.', error: errorMessage },
      { status: 500 }
    );
  }
}