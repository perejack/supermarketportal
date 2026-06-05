import jsPDF from "jspdf";
import { BRANDS, type Employer } from "./brands";

async function loadImageDataUrl(src: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" } | null> {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });

    const lower = src.toLowerCase();
    const format: "PNG" | "JPEG" =
      lower.endsWith(".png") || dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
    return { dataUrl, format };
  } catch {
    return null;
  }
}

export async function downloadReceipt(opts: {
  employer: Employer;
  fullName: string;
  staffNumber: string;
  position: string;
  branch: string;
  amount: number;
  paymentRef: string;
  paymentPhone: string;
  paidAt: string; // ISO
}) {
  const { employer, fullName, staffNumber, position, branch, amount, paymentRef, paymentPhone, paidAt } = opts;
  const b = BRANDS[employer];
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Header band (solid)
  doc.setFillColor(b.primary);
  doc.rect(0, 0, W, 90, "F");
  doc.setFillColor(b.accent);
  doc.rect(0, 90, W, 6, "F");

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(36, 22, 50, 50, 10, 10, "F");
  const logo = await loadImageDataUrl(b.logoImage);
  if (logo) {
    doc.addImage(logo.dataUrl, logo.format, 40, 26, 42, 42);
  } else {
    doc.setTextColor(b.primary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text(b.logoMark, 61, 56, { align: "center" });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(b.logoText.toUpperCase(), 100, 48);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(b.tagline, 100, 64);
  doc.setFontSize(9);
  doc.text("APPLICATION RECEIPT", W - 36, 48, { align: "right" });
  doc.text(`Ref: ${paymentRef}`, W - 36, 64, { align: "right" });

  // Title
  let y = 140;
  doc.setTextColor(20, 20, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("OFFICIAL APPLICATION RECEIPT", W / 2, y, { align: "center" });

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 100);
  doc.text(
    "This receipt confirms successful processing of your item purchase processing fee.",
    W / 2, y, { align: "center" }
  );

  // Amount block
  y += 30;
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(36, y, W - 72, 80, 10, 10, "F");
  doc.setTextColor(110, 110, 120);
  doc.setFontSize(10);
  doc.text("AMOUNT PAID", 56, y + 24);
  doc.setTextColor(b.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(`KES ${amount.toLocaleString()}.00`, 56, y + 56);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 140, 90);
  doc.text("✓ PAID", W - 56, y + 24, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text("via M-PESA", W - 56, y + 38, { align: "right" });

  // Details
  y += 110;
  doc.setDrawColor(b.primary);
  doc.setLineWidth(1.2);
  doc.roundedRect(36, y, W - 72, 170, 8, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(b.primary);
  doc.text("PAYMENT & APPLICANT DETAILS", 50, y + 22);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const paidDate = new Date(paidAt);
  const rows: [string, string][] = [
    ["M-Pesa Receipt", paymentRef],
    ["Paid From", paymentPhone],
    ["Date / Time", paidDate.toLocaleString("en-GB")],
    ["Applicant Name", fullName],
    ["Staff Number", staffNumber],
    ["Position Applied", position],
    ["Branch", `${b.logoText} — ${branch}`],
    ["Purpose", "Staff ID, Uniform, Locker, Training & Contract Processing"],
  ];
  rows.forEach(([k, v], i) => {
    const ry = y + 44 + i * 16;
    doc.setTextColor(110, 110, 120);
    doc.text(k + ":", 50, ry);
    doc.setTextColor(20, 20, 30);
    doc.setFont("helvetica", "bold");
    doc.text(v, 200, ry);
    doc.setFont("helvetica", "normal");
  });

  // Note
  y += 190;
  doc.setFillColor(255, 248, 230);
  doc.roundedRect(36, y, W - 72, 60, 8, 8, "F");
  doc.setTextColor(120, 90, 10);
  doc.setFontSize(9.5);
  doc.text(
    "Keep this receipt safe. Present it together with your signed employment contract and a",
    50, y + 22
  );
  doc.text(
    "photocopy of your National ID at orientation. No refund is processed after document issuance.",
    50, y + 38
  );

  // Footer
  doc.setFillColor(b.primary);
  doc.rect(0, H - 40, W, 40, "F");
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.text(
    `${b.logoText} Supermarkets Ltd  •  Human Resources  •  This is a system-generated receipt and does not require a signature.`,
    W / 2, H - 18, { align: "center" }
  );

  doc.save(`${b.logoText}-Receipt-${paymentRef}.pdf`);
}
