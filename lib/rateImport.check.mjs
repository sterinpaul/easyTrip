// Run: node lib/rateImport.check.mjs <file.xlsx> — prints what an import would parse.
import { readFile } from "node:fs/promises";
import { parseRatesWorkbook } from "./rateImport.js";
const res = await parseRatesWorkbook(await readFile(process.argv[2]));
console.log(res.sheet, res.rows.length, "rows,", res.skipped.length, "skipped", res.rows[0], res.rows.at(-1), res.skipped);
