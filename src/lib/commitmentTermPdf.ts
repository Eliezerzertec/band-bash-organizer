import jsPDF from 'jspdf';

export interface CommitmentTermPdfData {
  churchName: string;
  churchAddress: string;
  churchPhone: string;
  ministryName: string;
  memberName: string;
  memberRole: string;
  agreedAt: string;
}

function formatDatePtBr(value: string): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('pt-BR');
  } catch {
    return value;
  }
}

export function downloadCommitmentTermPdf(data: CommitmentTermPdfData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const marginX = 14;
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 5.2;
  let y = 16;

  const addLine = (text: string, opts?: { bold?: boolean; size?: number; gapBefore?: number; gapAfter?: number }) => {
    const size = opts?.size ?? 11;
    if (opts?.gapBefore) y += opts.gapBefore;
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    doc.setFontSize(size);

    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    const requiredHeight = lines.length * lineHeight;

    if (y + requiredHeight > 282) {
      doc.addPage();
      y = 16;
    }

    doc.text(lines, marginX, y);
    y += requiredHeight;
    if (opts?.gapAfter) y += opts.gapAfter;
  };

  addLine('REGULAMENTO E TERMO DE COMPROMISSO', { bold: true, size: 14 });
  addLine('Ministerio de Louvor', { bold: true, size: 12, gapAfter: 2 });

  addLine(`Igreja: ${data.churchName || '______________________________'}`);
  addLine(`Endereco: ${data.churchAddress || '______________________________'}`);
  addLine(`Telefone: ${data.churchPhone || '______________________________'}`);
  addLine(`Ministerio: ${data.ministryName || '______________________________'}`);
  addLine(`Nome do Integrante: ${data.memberName || '______________________________'}`);
  addLine(`Funcao (vocal / instrumento): ${data.memberRole || '______________________________'}`);
  addLine(`Data: ${formatDatePtBr(data.agreedAt) || '____/____/______'}`, { gapAfter: 2 });

  addLine('CAPITULO 1 - DA MISSAO DO MINISTERIO', { bold: true, gapBefore: 1 });
  addLine('O Ministerio de Louvor tem como finalidade conduzir a igreja a adoracao a Deus por meio da musica, colaborando com a liturgia dos cultos e demais atividades da igreja.');
  addLine('O ministerio busca: Glorificar a Deus atraves da musica; Conduzir a congregacao a adoracao; Servir a igreja com excelencia espiritual e musical; Desenvolver comunhao entre os integrantes.');

  addLine('CAPITULO 2 - DOS REQUISITOS PARA PARTICIPAR', { bold: true, gapBefore: 1 });
  addLine('Para integrar o Ministerio de Louvor, o candidato devera: Ser membro ou congregado ativo da igreja; Demonstrar vida crista compativel com os principios biblicos; Demonstrar capacidade musical minima para exercer sua funcao; Passar por avaliacao ou periodo de experiencia quando necessario; Aceitar e concordar com este regulamento.');
  addLine('A entrada de novos membros sera sempre definida pela lideranca do ministerio em conjunto com a lideranca pastoral.');

  addLine('CAPITULO 3 - DOS COMPROMISSOS ESPIRITUAIS', { bold: true, gapBefore: 1 });
  addLine('O integrante compromete-se a: Manter vida de oracao e leitura da Palavra; Buscar santidade e testemunho cristao; Participar da vida espiritual da igreja; Entender que o ministerio de louvor e um servico espiritual antes de ser musical.');

  addLine('CAPITULO 4 - DOS COMPROMISSOS COM O MINISTERIO', { bold: true, gapBefore: 1 });
  addLine('O membro compromete-se a: Participar dos ensaios programados; Chegar pontualmente aos cultos e ensaios; Estudar previamente as musicas definidas; Manter postura adequada durante ensaios e ministracoes; Zelar pelos equipamentos e instrumentos da igreja.');

  addLine('CAPITULO 5 - DO COMPORTAMENTO E TESTEMUNHO', { bold: true, gapBefore: 1 });
  addLine('Espera-se que o integrante: Demonstre respeito a lideranca pastoral e ministerial; Trabalhe em equipe com os demais integrantes; Evite comportamentos que gerem divisao ou conflitos; Mantenha bom testemunho dentro e fora da igreja. Atitudes incompativeis com o ministerio poderao ser avaliadas pela lideranca.');

  addLine('CAPITULO 6 - DA ORGANIZACAO DO MINISTERIO', { bold: true, gapBefore: 1 });
  addLine('O Ministerio de Louvor sera organizado da seguinte forma: Lider do Ministerio de Louvor; Equipe de musicos; Equipe de vocal; Equipe tecnica (som, midia, etc.). As escalas de ministracao serao organizadas pela lideranca.');

  addLine('CAPITULO 7 - DAS AUSENCIAS', { bold: true, gapBefore: 1 });
  addLine('O integrante devera: Informar antecipadamente quando nao puder participar de ensaios ou cultos; Evitar faltas frequentes sem justificativa. Faltas constantes poderao resultar em reavaliacao da participacao no ministerio.');

  addLine('CAPITULO 8 - DA DISCIPLINA', { bold: true, gapBefore: 1 });
  addLine('Caso um integrante descumpra os compromissos estabelecidos, apresente conduta incompativel com o ministerio ou gere conflitos dentro da equipe, a lideranca podera aplicar medidas como: Orientacao pastoral; Acompanhamento ou aconselhamento; Afastamento temporario; Desligamento do ministerio. Todas as decisoes buscarao sempre restauracao e edificacao do membro.');

  addLine('CAPITULO 9 - DA SAIDA DO MINISTERIO', { bold: true, gapBefore: 1 });
  addLine('O integrante podera solicitar desligamento do ministerio a qualquer momento, comunicando previamente a lideranca. Caso o integrante se afaste por longo periodo, seu retorno devera ser avaliado pela lideranca.');

  addLine('DECLARACAO DE COMPROMISSO', { bold: true, gapBefore: 1 });
  addLine('Declaro que li e compreendi este regulamento e assumo o compromisso de servir no Ministerio de Louvor com dedicacao, respeito, unidade e temor a Deus.');

  addLine('Assinatura do Integrante: __________________________________________', { gapBefore: 3 });
  addLine('Lider do Ministerio: _______________________________________________', { gapBefore: 2 });
  addLine('Pastor Responsavel: ________________________________________________', { gapBefore: 2 });
  addLine(`Data: ${formatDatePtBr(data.agreedAt) || '____/____/______'}`, { gapBefore: 2 });

  const fileDate = formatDatePtBr(data.agreedAt).replace(/\//g, '-');
  doc.save(`termo-compromisso-${fileDate || 'sem-data'}.pdf`);
}
