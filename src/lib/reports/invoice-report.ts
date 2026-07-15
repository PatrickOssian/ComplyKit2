// Printable invoice, ported from ComplyKit.dc.html's buildInvoiceHtml().
// Client-generated HTML opened via window.print() — no real payment/PDF
// pipeline in this mock phase.

function esc(x: unknown): string {
  return String(x ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface InvoiceReportInput {
  orgName: string;
  date: string;
  amount: string;
  plan: string;
}

const MONTH_NUM: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

export function buildInvoiceHtml(input: InvoiceReportInput): string {
  const num = parseFloat(String(input.amount).replace(/[^0-9.]/g, "")) || 0;
  const net = num / 1.25;
  const vat = num - net;
  const fmt = (x: number) => `€${x.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const parts = input.date.split(" ");
  const invNo = `CK-${parts[2] ?? ""}${MONTH_NUM[parts[1]] ?? ""}${parts[0] ?? ""}`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Invoice ${esc(invNo)} — ComplyKit</title>
<style>@page{size:A4;margin:18mm 16mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:#101828;font-size:12px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}.wrap{max-width:680px;margin:0 auto}.top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:34px}.brand{display:flex;align-items:center;gap:10px}.logo{width:32px;height:32px;border-radius:9px;background:#12b76a;color:#06281a;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:17px}.bn{font-weight:700;font-size:17px}.paid{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#067647;background:#ecfdf3;border:1px solid #d1fadf;padding:5px 12px;border-radius:20px}h1{font-size:24px;font-weight:700;margin:0 0 4px}.invmeta{text-align:right;font-size:11px;color:#667085;line-height:1.7}.invmeta b{color:#101828;font-weight:600}.cols{display:flex;gap:40px;margin-bottom:30px}.col{flex:1}.lbl{font-size:9px;text-transform:uppercase;letter-spacing:.6px;color:#98a2b3;font-weight:600;margin-bottom:6px}.nm{font-size:13px;font-weight:600;margin-bottom:2px}.ln{font-size:11.5px;color:#475467;line-height:1.6}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#98a2b3;font-weight:600;padding:0 0 8px;border-bottom:1px solid #eaecf0}th.r,td.r{text-align:right}td{padding:13px 0;border-bottom:1px solid #f2f4f7;font-size:12.5px;color:#344054}.desc{font-weight:600;color:#101828}.sub{font-size:11px;color:#98a2b3;margin-top:2px}.totals{margin-left:auto;width:260px}.trow{display:flex;justify-content:space-between;font-size:12px;color:#475467;padding:6px 0}.trow.grand{border-top:2px solid #101828;margin-top:6px;padding-top:12px;font-size:15px;font-weight:700;color:#101828}.note{margin-top:34px;padding-top:14px;border-top:1px solid #eaecf0;font-size:10px;color:#98a2b3;line-height:1.6}</style></head><body><div class="wrap">
<div class="top"><div><div class="brand"><div class="logo">C</div><div class="bn">ComplyKit</div></div><div style="margin-top:26px"><h1>Invoice</h1><div class="paid"><span style="width:6px;height:6px;border-radius:50%;background:#12b76a"></span>Paid</div></div></div>
<div class="invmeta">Invoice no. <b>${esc(invNo)}</b><br/>Invoice date <b>${esc(input.date)}</b><br/>Payment date <b>${esc(input.date)}</b><br/>Currency <b>EUR</b></div></div>
<div class="cols"><div class="col"><div class="lbl">From</div><div class="nm">ComplyKit ApS</div><div class="ln">Njalsgade 76, 4.<br/>2300 København S, Denmark<br/>VAT: DK 39 82 55 10<br/>billing@complykit.eu</div></div>
<div class="col"><div class="lbl">Billed to</div><div class="nm">${esc(input.orgName)}</div><div class="ln">Attn.: Finance<br/>finance@northpharma.dk<br/>VAT: DK 41 20 98 33</div></div></div>
<table><thead><tr><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead><tbody><tr><td><div class="desc">ComplyKit — ${esc(input.plan)}</div><div class="sub">ISMS subscription · ${esc(input.orgName)}</div></td><td class="r">1</td><td class="r">${fmt(net)}</td><td class="r">${fmt(net)}</td></tr></tbody></table>
<div class="totals"><div class="trow"><span>Subtotal</span><span>${fmt(net)}</span></div><div class="trow"><span>VAT (25%)</span><span>${fmt(vat)}</span></div><div class="trow grand"><span>Total paid</span><span>${fmt(num)}</span></div></div>
<div class="note">Paid via Visa ···· 4242. Thank you for your payment. This invoice was generated electronically and is valid without a signature. Billing questions: billing@complykit.eu.</div></div></body></html>`;
}
