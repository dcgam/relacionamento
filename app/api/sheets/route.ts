import { type NextRequest, NextResponse } from "next/server"

// EM PRODUÇÃO: Descomente as linhas abaixo
// import { GoogleSpreadsheet } from "google-spreadsheet"
// import { JWT } from "google-auth-library"

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json()

    // CÓDIGO PARA PRODUÇÃO (descomente quando fizer deploy):
    /*
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const SHEET_ID = '1FE1d6CWBVFXJ2xfl--fOTs_q59eDgTswRBWgezI1b9c';
    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByIndex[0];
    
    // Verificar se o cabeçalho existe
    const headerValues = await sheet.getRows({ limit: 1 });
    if (headerValues.length === 0) {
      await sheet.setHeaderRow([
        'Data/Hora', 'Nome', 'Email', 'WhatsApp', 'Idade', 'Gênero',
        'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term',
        'Interessado', 'Respostas Quiz', 'Score Total'
      ]);
    }
    
    await sheet.addRow(data);
    */

    // CÓDIGO ATUAL (apenas para preview do v0):
    console.log("📊 Dados enviados para Google Sheets:", {
      timestamp: new Date().toISOString(),
      data: data,
    })

    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "✅ Dados salvos com sucesso no Google Sheets",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Erro na API do Google Sheets:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Falha ao salvar dados",
      },
      { status: 500 },
    )
  }
}
