import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const encryptedDataUrl = process.env.ENCRYPTED_DATA_URL;
  const n8nAddWebhookUrl = process.env.N8N_ADD_URL;
  const SECRET_KEY_FIXA = "COLOQUE_A_CHAVE_SECRETA_FIXA_AQUI_EM_FORMATO_HEXADECIMAL";

  if (!encryptedDataUrl || !n8nAddWebhookUrl) {
    return NextResponse.json({ message: "Erro de configuração no servidor." }, { status: 500 });
  }

  try {
    const encryptedResponse = await fetch(encryptedDataUrl);
    if (!encryptedResponse.ok) throw new Error("Falha ao buscar os dados criptografados.");

    const dataPackage = await encryptedResponse.json();
    const { iv, authTag, encrypted } = dataPackage.data.encrypted;

    if (!iv || !authTag || !encrypted) {
        throw new Error("Formato de dados criptografados inválido recebido do endpoint.");
    }

    console.log("Iniciando descriptografia...");

    const key = Buffer.from(SECRET_KEY_FIXA, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const decryptedData = JSON.parse(decrypted);
    console.log("Dados descriptografados com sucesso!");

    const n8nResponse = await fetch(n8nAddWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decryptedData),
    });

    if (!n8nResponse.ok) throw new Error(`O N8N respondeu com o status: ${n8nResponse.status}`);

    const usersFromN8N = await n8nResponse.json();
    return NextResponse.json(usersFromN8N, { status: 200 });

  } catch (error: any) {
    console.error("Ocorreu um erro no fluxo de execução:", error.message);
    return NextResponse.json(
      { message: 'Ocorreu um erro no fluxo de execução: ' + error.message },
      { status: 500 }
    );
  }
}