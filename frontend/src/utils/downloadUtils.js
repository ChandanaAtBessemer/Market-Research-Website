import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';


/* ---------- Helpers ---------- */

// Remove inline SVGs (they bloat PDFs and sometimes break layout)
const stripSvgs = (html = '') => html.replace(/<svg[\s\S]*?<\/svg>/gi, '');

// Extract all <table> blocks (as head/body) and remaining text paragraphs
// Each cell carries { text, href? } so we can overlay a clickable link on the whole cell.
const extractTablesFromHtml = (html = '') => {
  const container = document.createElement('div');
  container.innerHTML = stripSvgs(html);

  const tables = [];
  const tableNodes = Array.from(container.querySelectorAll('table'));
  tableNodes.forEach((table) => {
    const headRowEl =
      table.querySelector('thead tr') || table.querySelector('tr');
    const headCells = headRowEl
      ? Array.from(headRowEl.children).map((th) => (th.textContent || '').trim())
      : [];

    const bodyRows = [];
    const bodyTrs = table.querySelectorAll('tbody tr');
    const rowNodes = bodyTrs.length
      ? bodyTrs
      : table.querySelectorAll('tr:not(thead tr)');

    rowNodes.forEach((tr, idx) => {
      // If our first row is <th> cells and we already used it as header, skip it
      if (idx === 0 && headCells.length) {
        const isHeader = Array.from(tr.children).every((el) => /TH/i.test(el.tagName));
        if (isHeader) return;
      }
      const cols = Array.from(tr.children).map((td) => {
        const links = Array.from(td.querySelectorAll('a[href]'))
          .map((a) => a.getAttribute('href'))
          .filter(Boolean);
        const href = links.length ? links[0] : undefined; // first link wins
        const text = (td.textContent || '').replace(/\s+/g, ' ').trim();
        return { text, href };
      });
      if (cols.length) bodyRows.push(cols);
    });

    if (headCells.length || bodyRows.length) {
      tables.push({ head: headCells, body: bodyRows });
    }

    // Remove processed table so remaining text can be gathered
    table.remove();
  });

  // Collect remaining text blocks (p, h1-3, blockquote). Fallback: entire innerText.
  const textBlocks = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, null);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (/^(P|H1|H2|H3|BLOCKQUOTE)$/i.test(node.tagName)) {
      const t = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (t) textBlocks.push(t);
    }
  }
  if (!textBlocks.length) {
    const t = (container.textContent || '').replace(/\s+/g, ' ').trim();
    if (t) textBlocks.push(t);
  }

  return { tables, textBlocks };
};

// Add a paragraph with automatic page breaking
const addParagraph = (doc, text, x, y, maxWidth, pageHeight, margin) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    if (y > pageHeight - margin - 12) { doc.addPage(); y = margin; }
    doc.text(line, x, y);
    y += 14; // 12pt text + 2pt leading
  }
  return y + 6; // space after paragraph
};

/* ---------- Export: PDF only ---------- */

export const downloadAsPDF = async (analysisData, filename) => {
  const { marketName, analysisType, timestamp, sections = [] } = analysisData;

  const doc = new jsPDF('p', 'pt', 'a4'); // points → better CSS-ish sizing
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;  // 0.55"
  const x = margin;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(20);
  doc.text(`${marketName || 'Market'} Analysis`, x, y); y += 20;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(110);
  doc.text(`Analysis Type: ${analysisType || ''}`, x, y); y += 14;
  doc.text(`Generated: ${timestamp || new Date().toLocaleString()}`, x, y); y += 12;
  doc.setDrawColor(220); doc.line(x, y, pageWidth - margin, y); y += 16;
  doc.setTextColor(30);

  // Use provided sections or fallback to metrics/companies
  const blocks = sections.length
    ? sections
    : [
        { title: 'Market Metrics', html: analysisData.metrics || '' },
        { title: 'Top Companies', html: analysisData.companies || '' }
      ];

  for (const s of blocks) {
    // Section title
    if (y > pageHeight - margin - 40) { doc.addPage(); y = margin; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(20);
    doc.text(s.title || 'Section', x, y); y += 10;
    doc.setDrawColor(230); doc.line(x, y, pageWidth - margin, y); y += 10;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(30);

    // Parse this section's HTML into tables + text
    const { tables, textBlocks } = extractTablesFromHtml(s.html || '');

    // Text blocks
    for (const t of textBlocks) {
      y = addParagraph(doc, t, x, y, maxWidth, pageHeight, margin);
    }

    // Tables
    for (const table of tables) {
      if (y > pageHeight - margin - 40) { doc.addPage(); y = margin; }

      // Map for link overlays; key = "row-col" within this table
      const linkMap = {};

      const head =
        table.head && table.head.length ? [table.head] : undefined;

      const body = table.body.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if (cell?.href) linkMap[`${rIdx}-${cIdx}`] = cell.href;

          // Display text (shorten very long URLs for readability only)
          const txt = (cell?.text || '').trim().replace(/\s+/g, ' ');
          if (/^https?:\/\//i.test(txt) && txt.length > 80) {
            try {
              const u = new URL(txt);
              const shortPath =
                u.pathname.length > 24 ? u.pathname.slice(0, 24) + '…' : u.pathname;
              return `${u.origin}${shortPath}`;
            } catch { /* leave as-is if invalid URL */ }
          }
          return txt;
        })
      );

      autoTable(doc, {
        head,
        body,
        startY: y,
        margin: { left: margin, right: margin },
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'top',
          textColor: 50,
          lineColor: [230, 232, 236],
          lineWidth: 0.5,
        },
        headStyles: { fillColor: [245, 247, 250], textColor: 20, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 251, 252] },
        tableWidth: 'wrap', // prevents cutting at right edge; wraps long content

        // Style link cells (blue + underline) before drawing
        didParseCell: (d) => {
          if (d.section !== 'body') return;
          const href = linkMap[`${d.row.index}-${d.column.index}`];
          if (href) {
            d.cell.styles.textColor = [29, 78, 216]; // blue
            d.cell.styles.fontStyle = 'underline';
          }
        },

        // Make the entire cell clickable after it's drawn (covers wrapped text)
        didDrawCell: (d) => {
          if (d.section !== 'body') return;
          const href = linkMap[`${d.row.index}-${d.column.index}`];
          if (!href) return;
          const pad = 2; // stay inside borders
          const lx = d.cell.x + pad;
          const ly = d.cell.y + pad;
          const lw = d.cell.width - pad * 2;
          const lh = d.cell.height - pad * 2;
          doc.link(lx, ly, lw, lh, { url: href });
        },
      });

      y = (doc.lastAutoTable?.finalY || y) + 12; // spacing after table
    }
  }

  // Footer page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Page ${i} of ${total}`, pageWidth - margin, pageHeight - 14, { align: 'right' });
  }

  doc.save(filename);
};

  
  
  

  

  export const downloadAsExcel = (analysisData, filename) => {
    const { marketName, analysisType, timestamp, sections = [] } = analysisData;
    const workbook = XLSX.utils.book_new();
  
    // Summary
    const summaryData = [
      ['Market Analysis Report'],
      [''],
      ['Market:', marketName || ''],
      ['Analysis Type:', analysisType || ''],
      ['Generated:', timestamp || new Date().toLocaleString()],
      ['Sections:', sections.length || 0],
      ['']
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');
  
    // Helper: strip HTML to text lines
    const stripHtml = (html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return (tmp.textContent || tmp.innerText || '').trim();
    };
  
    // For each section -> its own sheet
    const blocks = sections.length
      ? sections
      : [
          { title: 'Market Metrics', html: analysisData.metrics || '' },
          { title: 'Top Companies', html: analysisData.companies || '' },
        ];
  
    blocks.forEach((s) => {
      const text = stripHtml(s.html);
      const rows = text.split('\n').map(line => [line.trim()]).filter(r => r[0]);
      const aoa = [[s.title], [''], ...rows];
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(aoa), s.title.slice(0,31));
    });
  
    XLSX.writeFile(workbook, filename);
  };
  

  export const downloadAsMarkdown = (analysisData, filename) => {
    const { marketName, analysisType, timestamp, sections = [] } = analysisData;
  
    const stripHtml = (html) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return (tmp.textContent || tmp.innerText || '').trim();
    };
  
    const parts = [
      `# ${marketName || 'Market'} Analysis`,
      ``,
      `**Analysis Type:** ${analysisType || ''}  `,
      `**Generated:** ${timestamp || new Date().toLocaleString()}`,
      ``,
      `---`,
      ``
    ];
  
    const blocks = sections.length
      ? sections
      : [
          { title: 'Market Metrics', html: analysisData.metrics || '' },
          { title: 'Top Companies', html: analysisData.companies || '' },
        ];
  
    blocks.forEach((s) => {
      parts.push(`## ${s.title}`);
      parts.push(stripHtml(s.html || 'No data available.'));
      parts.push('');
    });
  
    parts.push(`---`);
    parts.push(`*Generated by Market Research Intelligence Platform*`);
  
    const blob = new Blob([parts.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  