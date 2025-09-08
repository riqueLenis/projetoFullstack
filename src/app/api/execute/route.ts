import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface EncryptedPackage {
  iv: string;
  authTag: string;
  encrypted: string;
}

interface DataPackage {
  encrypted: EncryptedPackage;
  secretKey: string;
}

export async function POST(_: NextRequest) {
  const encryptedDataUrl = process.env.ENCRYPTED_DATA_URL;
  const n8nAddWebhookUrl = process.env.N8N_ADD_URL;

  if (!encryptedDataUrl || !n8nAddWebhookUrl) {
    return NextResponse.json(
      { message: "Erro de configuração no servidor" },
      { status: 500 }
    );
  }

  try {
    const encryptedResponse = await fetch(encryptedDataUrl);
    if (!encryptedResponse.ok)
      throw new Error("Falha ao buscar os dados criptografados.");

    const dataPackageResponse = await encryptedResponse.json();
    const dataPackage: { data: DataPackage } = dataPackageResponse;

    if (!dataPackage?.data) throw new Error("Dados inválidos do endpoint.");

    const { encrypted, secretKey } = dataPackage.data;
    if (!encrypted || !secretKey)
      throw new Error("Campos criptografados ausentes.");

    const { iv, authTag, encrypted: encryptedText } = encrypted;
    const key = Buffer.from(secretKey, "hex");
    const ivBuffer = Buffer.from(iv, "hex");
    const authTagBuffer = Buffer.from(authTag, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    const decrypted =
      decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8");
    const decryptedData = JSON.parse(decrypted) as Record<string, unknown>[];

    const n8nResponse = await fetch(n8nAddWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decryptedData),
    });

    if (!n8nResponse.ok)
      throw new Error(`O n8n respondeu com status: ${n8nResponse.status}`);

    const usersFromN8N = (await n8nResponse.json()) as unknown;
    let finalData: Record<string, unknown>[] = [];

    if (Array.isArray(usersFromN8N)) {
      finalData = usersFromN8N.map((item) => {
        if (item && typeof item === "object" && "json" in item) {
          return (item as { json: Record<string, unknown> }).json;
        }
        return item as Record<string, unknown>;
      });
    } else if (usersFromN8N && typeof usersFromN8N === "object") {
      if ("json" in usersFromN8N) {
        finalData = [(usersFromN8N as { json: Record<string, unknown> }).json];
      } else {
        finalData = [usersFromN8N as Record<string, unknown>];
      }
    } else {
      finalData = [];
    }

    return NextResponse.json(finalData, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro no fluxo de execução:", errorMessage);
    return NextResponse.json(
      { message: "Ocorreu um erro no fluxo de execução: " + errorMessage },
      { status: 500 }
    );
  }
}
