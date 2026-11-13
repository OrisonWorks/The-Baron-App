/**
 * The Baron — stock writer endpoint.
 *
 * Paste this file into Extensions -> Apps Script on Aaron's stock Google
 * Sheet, then:
 *   1. Project Settings -> Script Properties: STOCK_TOKEN = <any long
 *      random string>  (same value as the STOCK_WRITER_TOKEN env var)
 *   2. Deploy -> New deployment -> Web app -> Execute as Me,
 *      Anyone can access. Copy the /exec URL into STOCK_WRITER_URL.
 *   3. Run installTriggers() once (Authorise) — daily sales email +
 *      weekly sheet backup.
 *
 * Sheet layout — one STOCK row per variant on the first tab:
 *   SKU | NAME | BRAND | CATEGORY | TYPE | FOR | VARIANT | PRICE (K) |
 *   STOCK | CONDITION | WARRANTY | PHOTO | DESCRIPTION
 *
 * POST JSON bodies (all need "token"):
 *   { token, model, variant, delta? | set? , undo? }  — stock write.
 *     Finds rows matching SKU+VARIANT, sums STOCK as live count, writes the
 *     new count to the first row and zeroes duplicates. Restocking a
 *     variant with no row appends one.
 *   { token, action: "updateProduct", model, fields } — metadata overrides
 *     (name, price_k, brand, category, type, for, condition, warranty,
 *     photo, description, active). All fields write to the model's first
 *     row; price_k writes to EVERY variant row (price is per-variant).
 *   { token, action: "createProduct", model, fields, variants } — appends
 *     one STOCK row per variant.
 *   { token, action: "logEvent", event, model, variant?, note? } — LOG row
 *     (TS, ACTION, MODEL, VARIANT, NOTE).
 *   { token, action: "subscribe"/"unsubscribe", email }
 *   { token, action: "createReceipt", ... } — RECEIPTS row, returns a
 *     TB-#### number + public link key.
 *   { token, action: "sendReceiptEmail", no, email }
 *   { token, action: "sendNewsletter", subject, html, text }
 *
 * GET /exec?token=…&kind=log|receipt|receipts|subscribers|leads[&n=&day=]
 *
 * A script lock serializes writes so overlapping sales can't lose updates;
 * SpreadsheetApp.flush() before releasing the lock ensures the write is
 * committed before the next writer reads.
 */
function doPost(e) {
  const out = (o) =>
    ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
      ContentService.MimeType.JSON
    );
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const token = PropertiesService.getScriptProperties().getProperty(
      "STOCK_TOKEN"
    );
    if (!token || body.token !== token)
      return out({ ok: false, error: "unauthorized" });

    if (body.action === "updateProduct")
      return updateProduct(body, out);
    if (body.action === "createProduct")
      return createProduct(body, out);
    if (body.action === "logEvent") return logEvent(body, out);
    if (body.action === "subscribe") return subscribeEmail(body, out);
    if (body.action === "createReceipt") return createReceipt(body, out);
    if (body.action === "sendReceiptEmail")
      return sendReceiptEmail(body, out);
    if (body.action === "sendNewsletter")
      return sendNewsletter(body, out);
    if (body.action === "unsubscribe")
      return unsubscribeEmail(body, out);

    const model = String(body.model || "").trim();
    const variant = String(body.variant || "").trim();
    if (!model || !variant)
      return out({ ok: false, error: "model and variant required" });

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      const data = sheet.getDataRange().getValues();
      const norm = (h) =>
        String(h).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      const headers = data[0].map(norm);
      const skuCol =
        headers.indexOf("sku") >= 0
          ? headers.indexOf("sku")
          : headers.indexOf("model");
      const varCol = headers.indexOf("variant");
      const stockCol =
        headers.indexOf("stock") >= 0
          ? headers.indexOf("stock")
          : headers.indexOf("count") >= 0
            ? headers.indexOf("count")
            : headers.indexOf("qty");
      if (skuCol < 0 || varCol < 0 || stockCol < 0)
        return out({ ok: false, error: "needs SKU/VARIANT/STOCK columns" });

      const rowIdxs = [];
      for (let i = 1; i < data.length; i++) {
        if (
          String(data[i][skuCol]).trim() === model &&
          String(data[i][varCol]).trim() === variant
        )
          rowIdxs.push(i);
      }
      if (rowIdxs.length === 0) {
        // variant never stocked: append a row so restock works
        const applySet =
          body.set != null
            ? Math.max(0, parseInt(body.set, 10) || 0)
            : Math.max(0, body.delta || -1);
        if (applySet <= 0)
          return out({ ok: false, error: "row not found", model, variant });
        const newRow = new Array(data[0].length).fill("");
        newRow[skuCol] = model;
        newRow[varCol] = variant;
        newRow[stockCol] = applySet;
        sheet.appendRow(newRow);
        appendLog_(body.undo ? "undo" : "restock", model, variant, "0→" + applySet);
        return out({
          ok: true,
          model,
          variant,
          previous: 0,
          count: applySet,
          appended: true,
        });
      }

      const current = rowIdxs.reduce(
        (sum, i) => sum + (parseInt(data[i][stockCol], 10) || 0),
        0
      );
      const next =
        body.set != null
          ? Math.max(0, parseInt(body.set, 10) || 0)
          : Math.max(0, current + (body.delta || -1));
      sheet.getRange(rowIdxs[0] + 1, stockCol + 1).setValue(next);
      for (let k = 1; k < rowIdxs.length; k++)
        sheet.getRange(rowIdxs[k] + 1, stockCol + 1).setValue(0);
      appendLog_(body.undo ? "undo" : next < current ? "sold" : "restock", model, variant,
        current + "→" + next);
      return out({ ok: true, model, variant, previous: current, count: next });
    } finally {
      SpreadsheetApp.flush();
      lock.releaseLock();
    }
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

// Writes product metadata overrides (name/price/category/description/photo/
// colour/active) into the model's first row, creating columns when missing.
// The site's parser prefers these sheet values over the built-in catalogue.
function updateProduct(body, out) {
  const model = String(body.model || "").trim();
  const fields = body.fields;
  if (!model || !fields || typeof fields !== "object")
    return out({ ok: false, error: "model and fields required" });
  // Baron STOCK columns (normalized). price_k is special: price lives on
  // each variant row, so it is written to every row of the model.
  const ALLOWED = [
    "name",
    "price_k",
    "brand",
    "category",
    "type",
    "for",
    "condition",
    "warranty",
    "description",
    "photo",
    "active",
  ];

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) =>
      String(h).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
    );
    const skuCol =
      headers.indexOf("sku") >= 0
        ? headers.indexOf("sku")
        : headers.indexOf("model");
    if (skuCol < 0)
      return out({ ok: false, error: "no sku column" });
    const rowIdxs = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][skuCol]).trim() === model) rowIdxs.push(i);
    }
    if (rowIdxs.length === 0) return out({ ok: false, error: "row not found", model });

    let nextCol = data[0].length;
    const written = {};
    for (const key of ALLOWED) {
      if (fields[key] == null) continue;
      let value = String(fields[key]).trim();
      // A leading =, +, -, @ would be stored as a live formula; the
      // apostrophe prefix forces a literal cell (not displayed).
      if (/^[=+\-@]/.test(value)) value = "'" + value;
      let col = headers.indexOf(key);
      if (col < 0) {
        col = nextCol;
        headers.push(key);
        sheet.getRange(1, col + 1).setValue(key.toUpperCase());
        nextCol++;
      }
      const targets = key === "price_k" ? rowIdxs : [rowIdxs[0]];
      for (const r of targets) sheet.getRange(r + 1, col + 1).setValue(value);
      written[key] = value;
    }
    return out({ ok: true, model, updated: written });
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// POST { action: "createProduct", model, fields: {name, brand, category,
// type, for, condition, warranty, photo, description}, variants:
// [{label, price, count}, ...] }
// Adds a brand-new product: one STOCK row per variant, each row carrying
// the product metadata. The parser groups rows by SKU, so the product is
// live on the shop without a catalogue entry.
function createProduct(body, out) {
  const model = String(body.model || "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,29}$/.test(model))
    return out({ ok: false, error: "model: 2-30 letters/digits/-/_" });
  const fields = body.fields || {};
  if (!String(fields.name || "").trim())
    return out({ ok: false, error: "name required" });
  const variants = (Array.isArray(body.variants) ? body.variants : [])
    .map((v) => ({
      label: String(v && v.label || "").trim().slice(0, 60) || "Standard",
      price: Math.max(0, parseInt(String(v && v.price), 10) || 0),
      count: Math.max(0, parseInt(String(v && v.count), 10) || 0),
    }))
    .filter((v) => v.count > 0);
  if (variants.length === 0)
    return out({ ok: false, error: "at least one variant with stock required" });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) =>
      String(h).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
    );
    const skuCol = headers.indexOf("sku");
    const varCol = headers.indexOf("variant");
    const stockCol = headers.indexOf("stock");
    const priceCol = headers.indexOf("price_k");
    if (skuCol < 0 || varCol < 0 || stockCol < 0 || priceCol < 0)
      return out({ ok: false, error: "needs Baron STOCK layout (SKU/VARIANT/PRICE (K)/STOCK)" });
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][skuCol]).trim() === model)
        return out({ ok: false, error: "model already exists", model });
    }

    let nextCol = data[0].length;
    const ensureCol = (key) => {
      let col = headers.indexOf(key);
      if (col < 0) {
        col = nextCol;
        headers.push(key);
        sheet.getRange(1, col + 1).setValue(key.toUpperCase());
        nextCol++;
      }
      return col;
    };

    // Every field writes on every row: each variant row is self-contained.
    const META = {
      name: "name",
      brand: "brand",
      category: "category",
      type: "type",
      for: "for",
      condition: "condition",
      warranty: "warranty",
      description: "description",
      photo: "photo",
    };
    const metaCols = {};
    for (const key of Object.keys(META)) {
      if (fields[key] != null && String(fields[key]).trim() !== "")
        metaCols[key] = ensureCol(META[key]);
    }
    for (const v of variants) {
      const row = new Array(nextCol).fill("");
      row[skuCol] = model;
      row[varCol] = safe_(v.label);
      row[stockCol] = v.count;
      row[priceCol] = v.price;
      for (const key of Object.keys(metaCols))
        row[metaCols[key]] = safe_(fields[key]);
      sheet.appendRow(row);
    }
    appendLog_(
      "restock",
      model,
      "",
      "new product · " + variants.map((v) => v.label + "×" + v.count).join(", ")
    );
    return out({ ok: true, model, variants });
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// ---------- shared helpers ----------

// Finds a tab by name, creating it with the given header row when missing.
function getOrCreate_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

// Appends one LOG row: TS, ACTION, MODEL, VARIANT, NOTE. Never throws — a
// failed log must not fail the stock write it trails (a reported failure
// would invite a retry that double-counts the sale).
function appendLog_(action, model, variant, note) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreate_(ss, "LOG", ["TS", "ACTION", "MODEL", "VARIANT", "NOTE"]);
    sheet.appendRow([
      new Date(),
      safe_(action),
      safe_(model),
      variant == null ? "" : safe_(variant),
      safe_(note || ""),
    ]);
    return true;
  } catch (err) {
    // deliberately swallowed — see comment above
    return false;
  }
}

// Prefixes formula-leading characters so values can't execute in the sheet.
function safe_(value) {
  let v = String(value).trim();
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

// Small stable hash (djb2) for campaign keys — identical input always
// gives the same key, so newsletter retries resume the same campaign.
function hash_(s) {
  let h = 5381;
  const str = String(s);
  for (let i = 0; i < str.length; i++) h = (h * 33 + str.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

// Returns a tab's data rows as objects keyed by header name.
function sheetRows_(ss, name) {
  const sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0].map((h) => String(h).trim().toLowerCase());
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((h, c) => {
      row[h] = data[i][c] instanceof Date
        ? Utilities.formatDate(
            data[i][c],
            Session.getScriptTimeZone(),
            "yyyy-MM-dd'T'HH:mm:ss"
          )
        : String(data[i][c]);
    });
    rows.push(row);
  }
  return rows;
}

// ---------- event log ----------

// POST { action: "logEvent", event, model, variant?, note? }
// "interest" events come from public site taps; sold/restock are written
// automatically by the stock path — those events are accepted here too only
// so the API surface stays simple; the app never sends them directly.
function logEvent(body, out) {
  const event = String(body.event || "").trim();
  const model = String(body.model || "").trim();
  if (!["interest", "sold", "restock"].includes(event))
    return out({ ok: false, error: "unknown event" });
  if (!model) return out({ ok: false, error: "model required" });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    const logged = appendLog_(event, model, body.variant || body.size || "",
      safe_(String(body.note || "")).slice(0, 300));
    // Unlike stock writes (which must not fail on a log failure), an
    // interest event IS the log write — report it honestly.
    if (!logged) return out({ ok: false, error: "log write failed" });
    return out({ ok: true });
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// ---------- mailing list ----------

// POST { action: "subscribe", email } → appends to a SUBSCRIBERS tab
// (TS, EMAIL), deduped case-insensitively. Public-facing (the site's
// newsletter form) so it does as little as possible.
function subscribeEmail(body, out) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 320)
    return out({ ok: false, error: "invalid email" });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreate_(ss, "SUBSCRIBERS", ["TS", "EMAIL"]);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => String(h).trim().toLowerCase());
    const emailCol = headers.indexOf("email");
    const statusCol = headers.indexOf("status");
    let exists = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][emailCol]).trim().toLowerCase() === email) {
        exists = true;
        // A resubscribe after opting out clears the stop marker.
        if (statusCol >= 0 && String(data[i][statusCol]).trim()) {
          sheet.getRange(i + 1, statusCol + 1).setValue("");
          sheet.getRange(i + 1, 1).setValue(new Date());
          SpreadsheetApp.flush();
        }
        break;
      }
    }
    if (!exists) {
      sheet.appendRow([new Date(), safe_(email)]);
      SpreadsheetApp.flush();
    }
    return out({ ok: true, email, already: exists });
  } finally {
    lock.releaseLock();
  }
}

// POST { action: "unsubscribe", email } → marks STATUS=stop on the
// SUBSCRIBERS row (a suppression, not a deletion — the address stays for
// dedupe, and resubscribing clears the marker).
function unsubscribeEmail(body, out) {
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    return out({ ok: false, error: "invalid email" });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreate_(ss, "SUBSCRIBERS", ["TS", "EMAIL"]);
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map((h) => String(h).trim().toLowerCase());
    const colOf = (name) => {
      let col = header.lastIndexOf(name);
      if (col < 0) {
        col = header.length;
        header.push(name);
        sheet.getRange(1, col + 1).setValue(name.toUpperCase());
      }
      return col;
    };
    const emailCol = header.indexOf("email");
    const statusCol = colOf("status");
    const data = sheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][emailCol]).trim().toLowerCase() === email) {
        sheet.getRange(i + 1, statusCol + 1).setValue("stop");
        found = true;
        break;
      }
    }
    if (!found) {
      // Row to mark stop on even when the address isn't on file — a
      // later re-add via subscribe clears it.
      const row = new Array(statusCol + 1).fill("");
      row[0] = new Date();
      row[emailCol] = safe_(email);
      row[statusCol] = "stop";
      sheet.appendRow(row);
    }
    SpreadsheetApp.flush();
    return out({ ok: true, email });
  } finally {
    lock.releaseLock();
  }
}

// ---------- receipts ----------

// POST { action: "createReceipt", fields: { client, phone, items, amount,
// words, method, balance, note } } → { ok, no: "TB-0007" }
// items is a plain-text lines blob; words is amount-in-words (site-generated).
function createReceipt(body, out) {
  const f = body.fields || {};
  const amount = parseInt(String(f.amount || "").replace(/[^0-9]/g, ""), 10);
  if (!(amount > 0)) return out({ ok: false, error: "amount must be positive" });
  if (!String(f.client || "").trim())
    return out({ ok: false, error: "client name required" });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreate_(ss, "RECEIPTS", [
      "NO", "DATE", "CLIENT", "PHONE", "ITEMS", "AMOUNT",
      "WORDS", "METHOD", "BALANCE", "NOTE", "KEY",
    ]);
    // Write every field under its own header — a pre-existing tab may be
    // missing KEY or have columns in a different order, and positional
    // writes would land values under the wrong headers. One setValues
    // call keeps the write atomic: no half-written receipt on failure.
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map((h) => String(h).trim().toLowerCase());
    const colOf = (name) => {
      // lastIndexOf matches sheetRows_, which lets the last duplicate
      // header win — writing the first would leave the read column empty.
      let col = header.lastIndexOf(name);
      if (col < 0) {
        col = header.length;
        header.push(name);
        sheet.getRange(1, col + 1).setValue(name.toUpperCase());
      }
      return col;
    };
    const no =
      "TB-" + String(sheet.getLastRow()).padStart(4, "0");
    // Unguessable per-receipt key — the public /receipt/<no>?k=<key> link
    // needs it, so sequential numbers can't be enumerated.
    const key = Utilities.getUuid().replace(/-/g, "").slice(0, 12);
    const row = [];
    const put = (name, value) => {
      row[colOf(name)] = value;
    };
    put("no", no);
    put("date", new Date());
    put("client", safe_(f.client));
    put("phone", safe_(f.phone || ""));
    put("items", safe_(String(f.items || "")).slice(0, 1500));
    put("amount", amount);
    put("words", safe_(String(f.words || "")).slice(0, 200));
    put("method", safe_(String(f.method || "")));
    put("balance", safe_(String(f.balance || "")));
    put("note", safe_(String(f.note || "")).slice(0, 300));
    put("area", safe_(String(f.area || "")).slice(0, 100));
    put("heard", safe_(String(f.heard || "")).slice(0, 60));
    put("key", key);
    for (let c = 0; c < row.length; c++) if (row[c] === undefined) row[c] = "";
    const rowNum = sheet.getLastRow() + 1;
    sheet.getRange(rowNum, 1, 1, row.length).setValues([row]);
    return out({ ok: true, no, key });
  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }
}

// POST { action: "sendReceiptEmail", email, subject, body }
function sendReceiptEmail(body, out) {
  const email = String(body.email || "").trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return out({ ok: false, error: "valid email required" });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return out({ ok: false, error: "busy" });
  try {
    MailApp.sendEmail(
      email,
      safe_(String(body.subject || "The Baron receipt")).slice(0, 200),
      String(body.body || "").slice(0, 8000)
    );
    return out({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// ---------- newsletter ----------

// POST { action: "sendNewsletter", subject, html, text? }
// Sends to every SUBSCRIBERS row. Free Gmail sends ~100 recipients/day —
// MailApp.getRemainingDailyQuota() gates the loop so a big list degrades
// to a partial send the caller can rerun tomorrow, not an error. Rows
// with a STATUS value (e.g. "stop") are skipped; each send stamps
// LAST_BATCH with a key hashed from the full subject+text+html, so a
// quota-interrupted rerun continues where it stopped — while any NEW
// content (same subject, different message or photo) has a different
// key and sends to all.
function sendNewsletter(body, out) {
  const subject = safe_(String(body.subject || "").trim()).slice(0, 200);
  const html = String(body.html || "").slice(0, 60000);
  const text = String(body.text || "").slice(0, 20000);
  if (!subject) return out({ ok: false, error: "subject required" });
  if (!html && !text) return out({ ok: false, error: "html or text required" });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(60000)) return out({ ok: false, error: "busy" });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreate_(ss, "SUBSCRIBERS", ["TS", "EMAIL"]);
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map((h) => String(h).trim().toLowerCase());
    const colOf = (name) => {
      let col = header.lastIndexOf(name);
      if (col < 0) {
        col = header.length;
        header.push(name);
        sheet.getRange(1, col + 1).setValue(name.toUpperCase());
      }
      return col;
    };
    const emailCol = header.indexOf("email");
    const statusCol = colOf("status");
    const batchCol = colOf("last_batch");
    // Campaign identity = hash of the FULL delivered content (subject +
    // text + html), not the subject alone: rerunning the same send
    // resumes it, while any content change — a different message, a new
    // featured photo — gets a different key and reaches everyone.
    const batchKey = hash_(subject + "|" + text + "|" + html);
    const data = sheet.getDataRange().getValues();
    let eligible = 0;
    let sent = 0;
    let failed = 0;
    for (let i = 1; i < data.length; i++) {
      const email = String(data[i][emailCol] || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) continue;
      if (String(data[i][statusCol] || "").trim()) continue; // opted out
      if (String(data[i][batchCol] || "").trim() === batchKey) continue; // got this send
      eligible++;
      if (MailApp.getRemainingDailyQuota() <= 0) continue;
      try {
        const plain = text || "View this email in a browser-capable client — The Baron.";
        MailApp.sendEmail(email, subject, plain, html ? { htmlBody: html } : {});
        sheet.getRange(i + 1, batchCol + 1).setValue(batchKey);
        sent++;
      } catch (err) {
        failed++;
      }
    }
    const remaining = eligible - sent - failed;
    SpreadsheetApp.flush();
    appendLog_("newsletter", "-", "",
      subject.slice(0, 80) + " · " + sent + " sent" +
      (failed ? " · " + failed + " failed" : "") +
      (remaining ? " · " + remaining + " left (quota)" : ""));
    return out({ ok: true, total: eligible, sent, failed, remaining });
  } finally {
    lock.releaseLock();
  }
}

// ---------- read endpoints ----------

// GET /exec?token=…&kind=log&n=300 | kind=receipt&no=TB-0001 | kind=subscribers | kind=receipts
function doGet(e) {
  const out = (o) =>
    ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
      ContentService.MimeType.JSON
    );
  try {
    const p = (e && e.parameter) || {};
    const token = PropertiesService.getScriptProperties().getProperty(
      "STOCK_TOKEN"
    );
    if (!token || p.token !== token)
      return out({ ok: false, error: "unauthorized" });
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const kind = String(p.kind || "");
    if (kind === "log") {
      const n = Math.min(5000, parseInt(p.n || "300", 10) || 300);
      const day = String(p.day || "");
      // Filter by day BEFORE the row cap so older days don't fall off the
      // tail of the log.
      let rows = sheetRows_(ss, "LOG");
      if (day) rows = rows.filter((r) => String(r.ts).indexOf(day) === 0);
      return out({ ok: true, rows: rows.slice(-n) });
    }
    if (kind === "receipt") {
      const no = String(p.no || "").trim();
      const k = String(p.k || "").trim();
      if (!no || !k) return out({ ok: false, error: "no and k required" });
      const row = sheetRows_(ss, "RECEIPTS").find(
        (r) => r.no === no && r.key === k
      );
      if (!row) return out({ ok: false, error: "not found" });
      delete row.key;
      return out({ ok: true, receipt: row });
    }
    if (kind === "subscribers") {
      const rows = sheetRows_(ss, "SUBSCRIBERS").map((r) => ({
        ts: r.ts,
        email: r.email,
        status: r.status || "",
      }));
      return out({ ok: true, subscribers: rows });
    }
    if (kind === "receipts") {
      // All receipts for admin analytics — key stripped so the
      // unguessable share links are never exposed by this read.
      const rows = sheetRows_(ss, "RECEIPTS").map((r) => {
        const copy = Object.assign({}, r);
        delete copy.key;
        return copy;
      });
      return out({ ok: true, receipts: rows });
    }
    if (kind === "leads") {
      // Order taps (interest) never followed by a sale of the same
      // model+variant — unfilled demand worth a follow-up or a restock.
      const rows = sheetRows_(ss, "LOG");
      // Pair each undo with the write it reversed (same model+variant,
      // mirror a→b note) and drop both — an undone sale must not keep
      // hiding the taps it once filled. Same pairing as the admin UI.
      const dead = new Array(rows.length).fill(false);
      for (let i = rows.length - 1; i >= 0; i--) {
        const u = rows[i];
        if (u.action !== "undo") continue;
        const m = String(u.note || "").split("→").map((x) => parseInt(x, 10));
        if (m.length !== 2 || m.some((x) => isNaN(x))) continue;
        const kind = m[1] > m[0] ? "sold" : "restock";
        const mirror = m[1] + "→" + m[0];
        for (let j = i - 1; j >= 0; j--) {
          const o = rows[j];
          if (dead[j] || o.action !== kind) continue;
          if (o.model === u.model && String(o.variant) === String(u.variant) && String(o.note) === mirror) {
            dead[j] = true;
            dead[i] = true;
            break;
          }
        }
      }
      const lastSold = {};
      rows.forEach((r, i) => {
        const key = r.model + "|" + r.variant;
        if (!dead[i] && r.action === "sold" && (!lastSold[key] || String(r.ts) > String(lastSold[key])))
          lastSold[key] = r.ts;
      });
      const leads = {};
      rows.forEach((r, i) => {
        if (dead[i] || r.action !== "interest") return;
        const key = r.model + "|" + r.variant;
        // A sale AFTER the tap counts it as filled — a tap newer than
        // the last sale is still open demand.
        if (lastSold[key] && String(r.ts) <= String(lastSold[key])) return;
        // Contact rides in the note as `· for NAME · tel PHONE` when the
        // client consented at checkout — the newest tap wins. Rows arrive in
        // write order, so >= keeps the later row when two taps share a second.
        if (!leads[key]) leads[key] = { model: r.model, size: r.variant, taps: 0, lastTs: "", who: "", phone: "" };
        leads[key].taps++;
        if (String(r.ts) >= String(leads[key].lastTs)) {
          leads[key].lastTs = r.ts;
          const who = / · for ([^·]+?) · tel ([^·]+?)\s*(?:·|$)/.exec(String(r.note || ""));
          leads[key].who = who ? who[1].trim() : "";
          leads[key].phone = who ? who[2].trim() : "";
        }
      });
      return out({ ok: true, leads: Object.values(leads) });
    }
    return out({ ok: false, error: "unknown kind" });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

// ---------- scheduled jobs (install as time-driven triggers) ----------

// Emails today's sales + interest summary. Daily trigger, e.g. 21:00.
function dailyDigest() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = Session.getScriptTimeZone();
  const today = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  const rows = sheetRows_(ss, "LOG").filter((r) =>
    String(r.ts).indexOf(today) === 0
  );
  const sales = rows.filter((r) => r.action === "sold");
  const interest = rows.filter((r) => r.action === "interest");
  const restock = rows.filter((r) => r.action === "restock");
  const receipts = sheetRows_(ss, "RECEIPTS").filter((r) =>
    String(r.date).indexOf(today) === 0
  );
  const perModel = {};
  sales.forEach((r) => {
    perModel[r.model] = (perModel[r.model] || 0) + 1;
  });
  const lines = Object.keys(perModel)
    .sort()
    .map((m) => "  " + m + "  ×  " + perModel[m]);
  const revenue = receipts.reduce(
    (sum, r) => sum + (parseInt(String(r.amount), 10) || 0),
    0
  );
  const text =
    "The Baron — " +
    today +
    "\n\nPairs marked sold: " +
    sales.length +
    (lines.length ? "\n" + lines.join("\n") : "\n  (none)") +
    "\n\nReceipts issued: " +
    receipts.length +
    " (K" +
    revenue.toLocaleString() +
    ")" +
    "\nInterest taps on WhatsApp order: " +
    interest.length +
    "\nRestocks: " +
    restock.length +
    "\n\n— The Baron shop";
  MailApp.sendEmail(
    reportEmail_(),
    "The Baron — daily sales " + today,
    text
  );
}

// Emails every tab as CSV attachments. Daily or weekly trigger.
function backupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const date = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd"
  );
  const attachments = ss.getSheets().map((sh) => {
    const csv = sh
      .getDataRange()
      .getValues()
      .map((row) => row.map(csvCell_).join(","))
      .join("\n");
    return Utilities.newBlob(
      csv,
      "text/csv",
      ss.getName() + "-" + sh.getName() + "-" + date + ".csv"
    );
  });
  MailApp.sendEmail(
    reportEmail_(),
    "The Baron — sheet backup " + date,
    "CSV export of every tab is attached. To restore, re-import the CSV(s) into the sheet.",
    { attachments: attachments }
  );
}

function reportEmail_() {
  return (
    PropertiesService.getScriptProperties().getProperty("REPORT_EMAIL") ||
    Session.getActiveUser().getEmail()
  );
}

// Run ONCE from the editor (Run ▶): creates the scheduled jobs. Safe to
// rerun — existing triggers for these functions are replaced, so nothing
// double-fires. First run asks for the Gmail/Calendar-style authorizations
// MailApp needs; approve once.
function installTriggers() {
  const handlers = ["dailyDigest", "backupSheet"];
  ScriptApp.getProjectTriggers().forEach((t) => {
    if (handlers.indexOf(t.getHandlerFunction()) >= 0)
      ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("dailyDigest")
    .timeBased()
    .everyDays(1)
    .atHour(21)
    .create();
  ScriptApp.newTrigger("backupSheet")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(6)
    .create();
}

function csvCell_(v) {
  const s =
    v instanceof Date
      ? Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
      : String(v);
  // Formula-leading values must survive re-import as literals, not become
  // executable formulas in whatever sheet the backup is restored into.
  const escaped = /^[=+\-@]/.test(s) ? "'" + s : s;
  return /[",\n]/.test(escaped) ? '"' + escaped.replace(/"/g, '""') + '"' : escaped;
}
