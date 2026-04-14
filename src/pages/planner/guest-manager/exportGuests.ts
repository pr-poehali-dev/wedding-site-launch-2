import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { GuestItem, TableItem } from "../SeatingEditor";

interface GuestGroup {
  table: TableItem | null;
  guests: GuestItem[];
}

function buildGroups(guests: GuestItem[], tables: TableItem[]): GuestGroup[] {
  const groups: GuestGroup[] = [];

  // Assigned tables — presidium first (table #0), then rest sorted by label
  const sortedTables = [...tables].sort((a, b) => {
    const aP = a.shape === "presidium" ? -1 : 0;
    const bP = b.shape === "presidium" ? -1 : 0;
    if (aP !== bP) return aP - bP;
    return a.label.localeCompare(b.label, "ru");
  });
  for (const table of sortedTables) {
    const seated = guests.filter((g) => g.tableId === table.id);
    if (seated.length > 0) {
      groups.push({ table, guests: seated });
    }
  }

  // Unassigned
  const unassigned = guests.filter((g) => !g.tableId);
  if (unassigned.length > 0) {
    groups.push({ table: null, guests: unassigned });
  }

  return groups;
}

// ── DOCX export ──────────────────────────────────────────────────────────────

export async function exportGuestsDocx(
  guests: GuestItem[],
  tables: TableItem[],
  planTitle: string
) {
  const groups = buildGroups(guests, tables);

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      text: planTitle || "Список гостей",
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    })
  );

  // Stats line
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Всего гостей: ${guests.length}`, size: 22, color: "666666" }),
        new TextRun({ text: `   •   Столов: ${tables.length}`, size: 22, color: "666666" }),
        new TextRun({
          text: `   •   Без места: ${guests.filter((g) => !g.tableId).length}`,
          size: 22,
          color: "666666",
        }),
      ],
      spacing: { after: 400 },
    })
  );

  for (const group of groups) {
    const tableNum = group.table
      ? group.table.shape === "presidium"
        ? "№0  "
        : ""
      : "";
    const tableLabel = group.table ? group.table.label : "Без стола";
    const seats = group.table ? `(${group.table.seats} мест)` : "";

    // Section heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${tableNum}${tableLabel}  `,
            bold: true,
            size: 28,
            color: "2C2008",
          }),
          new TextRun({
            text: seats,
            size: 22,
            color: "999999",
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 120 },
        border: {
          bottom: {
            color: "C9A96E",
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    // Guest table
    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "#", bold: true, size: 18, color: "999999" })] })],
          shading: { type: ShadingType.SOLID, color: "F5EDD8" },
          width: { size: 500, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Имя", bold: true, size: 20 })] })],
          shading: { type: ShadingType.SOLID, color: "F5EDD8" },
          width: { size: 3500, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Телефон", bold: true, size: 20 })] })],
          shading: { type: ShadingType.SOLID, color: "F5EDD8" },
          width: { size: 2500, type: WidthType.DXA },
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: "Заметка", bold: true, size: 20 })] })],
          shading: { type: ShadingType.SOLID, color: "F5EDD8" },
          width: { size: 3000, type: WidthType.DXA },
        }),
      ],
    });

    const dataRows = group.guests.map(
      (g, i) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(i + 1), bold: true, size: 18, color: "999999" })] })],
              shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "FFFFFF" : "FDFAF3" },
              width: { size: 500, type: WidthType.DXA },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: g.name, size: 20 })] })],
              shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "FFFFFF" : "FDFAF3" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: g.phone || "—", size: 20, color: "666666" })],
                }),
              ],
              shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "FFFFFF" : "FDFAF3" },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: g.note || "", size: 20, color: "888888" })],
                }),
              ],
              shading: { type: ShadingType.SOLID, color: i % 2 === 0 ? "FFFFFF" : "FDFAF3" },
            }),
          ],
        })
    );

    children.push(
      new Table({
        rows: [headerRow, ...dataRows],
        width: { size: 9500, type: WidthType.DXA },
      })
    );

    children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
    styles: {
      paragraphStyles: [
        {
          id: "Title",
          name: "Title",
          basedOn: "Normal",
          run: { size: 48, bold: true, color: "1A160F" },
          paragraph: { alignment: AlignmentType.LEFT },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          run: { size: 28, bold: true, color: "2C2008" },
        },
      ],
    },
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${(planTitle || "гости").replace(/[^а-яёa-z0-9\s]/gi, "")}_рассадка.docx`;
  saveAs(blob, filename);
}

// ── TXT export ───────────────────────────────────────────────────────────────

export function exportGuestsTxt(
  guests: GuestItem[],
  tables: TableItem[],
  planTitle: string
) {
  const groups = buildGroups(guests, tables);
  const lines: string[] = [];

  lines.push(planTitle || "Список гостей");
  lines.push("=".repeat(50));
  lines.push(`Всего: ${guests.length} гостей, ${tables.length} столов`);
  lines.push("");

  for (const group of groups) {
    const tableLabel = group.table
      ? `${group.table.shape === "presidium" ? "№0 " : ""}${group.table.label} (${group.table.seats} мест)`
      : "Без стола";
    lines.push(tableLabel);
    lines.push("-".repeat(40));
    group.guests.forEach((g, i) => {
      const phone = g.phone ? `  ${g.phone}` : "";
      const note = g.note ? `  [${g.note}]` : "";
      lines.push(`  ${i + 1}. ${g.name}${phone}${note}`);
    });
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const filename = `${(planTitle || "гости").replace(/[^а-яёa-z0-9\s]/gi, "")}_рассадка.txt`;
  saveAs(blob, filename);
}