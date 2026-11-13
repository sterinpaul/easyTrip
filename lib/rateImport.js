import ExcelJS from "exceljs";

const norm = (v) => String(v ?? "").toLowerCase().replace(/[^a-z]/g, "");
// header text -> field; first matching rule wins
const HEADERS = [
    ["packageName", (h) => h.startsWith("package")],
    ["guests", (h) => h.startsWith("guest") || h === "pax"],
    ["rooms", (h) => h.startsWith("room")],
    ["category", (h) => h.includes("category")],
    ["groupRate", (h) => h.includes("rate") || h.includes("price") || h.includes("amount")],
];
const REQUIRED = ["packageName", "guests", "category", "groupRate"];

const cellValue = (cell) => {
    const v = cell.value;
    if (v && typeof v === "object") return v.result ?? v.text ?? v.richText?.map((r) => r.text).join("") ?? "";
    return v;
};

// Returns { rows: [{packageName, guests, rooms, category, groupRate}], skipped: [{row, reason}] } or throws.
export async function parseRatesWorkbook(buffer) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    for (const ws of wb.worksheets) {
        let cols = null, headerRow = 0;
        ws.eachRow((row, n) => {
            if (cols) return;
            const found = {};
            row.eachCell((cell, c) => {
                const h = norm(cellValue(cell));
                const hit = HEADERS.find(([f, test]) => !found[f] && h && test(h));
                if (hit) found[hit[0]] = c;
            });
            if (REQUIRED.every((f) => found[f])) { cols = found; headerRow = n; }
        });
        if (!cols) continue;

        const rows = [], skipped = [];
        ws.eachRow((row, n) => {
            if (n <= headerRow) return;
            const get = (f) => (cols[f] ? cellValue(row.getCell(cols[f])) : undefined);
            const r = {
                packageName: String(get("packageName") ?? "").trim(),
                guests: Number(get("guests")),
                rooms: get("rooms") === undefined || get("rooms") === "" || get("rooms") === null ? undefined : Number(get("rooms")),
                category: String(get("category") ?? "").trim(),
                groupRate: Number(String(get("groupRate") ?? "").toString().replace(/[,₹\s]/g, "")),
            };
            if (!r.packageName && !r.category && !get("groupRate")) return; // blank line
            const reason =
                !r.packageName ? "Missing package" :
                !Number.isInteger(r.guests) || r.guests < 1 ? "Invalid guests" :
                !r.category ? "Missing category" :
                !Number.isFinite(r.groupRate) || r.groupRate < 0 ? "Invalid rate" :
                r.rooms !== undefined && !Number.isFinite(r.rooms) ? "Invalid rooms" : null;
            if (reason) skipped.push({ row: n, reason, sheet: ws.name });
            else rows.push(r);
        });
        return { sheet: ws.name, rows, skipped };
    }
    throw new Error("No sheet with columns Package, Guests, Category and Rate was found");
}
