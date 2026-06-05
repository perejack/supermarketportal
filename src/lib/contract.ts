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

export async function downloadContract(opts: {
  employer: Employer;
  fullName: string;
  staffNumber: string;
  position: string;
  branch: string;
}) {
  const { employer, fullName, staffNumber, position, branch } = opts;
  const b = BRANDS[employer];
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Header band
  doc.setFillColor(b.primary);
  doc.rect(0, 0, W, 90, "F");
  doc.setFillColor(b.accent);
  doc.rect(0, 90, W, 6, "F");

  // Logo mark
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
  doc.text("EMPLOYMENT CONTRACT", W - 36, 48, { align: "right" });
  doc.text(`Ref: ${b.logoMark}${staffNumber || "—"}/${new Date().getFullYear()}`, W - 36, 64, { align: "right" });

  // Title
  let y = 140;
  doc.setTextColor(20, 20, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("CONTRACT OF EMPLOYMENT", W / 2, y, { align: "center" });

  y += 30;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  doc.text(
    `This Contract of Employment is made on ${today} between ${b.logoText} Supermarkets Ltd (\"the Employer\") and the Employee named below.`,
    36, y, { maxWidth: W - 72 }
  );

  // Party box
  y += 40;
  doc.setDrawColor(b.primary);
  doc.setLineWidth(1.2);
  doc.roundedRect(36, y, W - 72, 110, 8, 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(b.primary);
  doc.text("EMPLOYEE DETAILS", 50, y + 22);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const rows: [string, string][] = [
    ["Full Name", fullName || "—"],
    ["Staff Number", staffNumber || "—"],
    ["Position / Job Title", position || "—"],
    ["Assigned Branch", `${b.logoText} — ${branch || "—"}`],
  ];
  rows.forEach(([k, v], i) => {
    const ry = y + 42 + i * 16;
    doc.setTextColor(110, 110, 120);
    doc.text(k + ":", 50, ry);
    doc.setTextColor(20, 20, 30);
    doc.setFont("helvetica", "bold");
    doc.text(v, 180, ry);
    doc.setFont("helvetica", "normal");
  });

  // Terms
  y += 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(b.primary);
  doc.text("TERMS & CONDITIONS", 36, y);
  y += 16;
  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const terms = [
    `1. Position. The Employee is engaged as ${position || "—"} at ${b.logoText} ${branch || "—"} branch.`,
    "2. Probation. A probation period of three (3) months applies from the date of commencement.",
    "3. Working Hours. Standard 45 hours per week on rotational shifts as per branch schedule.",
    "4. Remuneration. Monthly salary as per the engagement letter, payable by the last working day of each month.",
    "5. Leave. 21 days paid annual leave after 12 months of continuous service, plus statutory holidays.",
    "6. Conduct. The Employee shall observe the Code of Conduct, uniform policy and customer service standards.",
    "7. Confidentiality. The Employee shall not disclose any confidential information of the Employer.",
    "8. Personal Items. Phones, bags and personal items are strictly prohibited on the active shop floor and must be stored in the assigned locker.",
    "9. Termination. Either party may terminate this contract by giving 30 days written notice, in accordance with the Employment Act.",
    "10. Governing Law. This contract is governed by the laws of the Republic of Kenya.",
  ];
  terms.forEach((t) => {
    const lines = doc.splitTextToSize(t, W - 72);
    doc.text(lines, 36, y);
    y += lines.length * 12 + 4;
  });

  // Signatures
  y = Math.max(y + 20, H - 150);
  doc.setDrawColor(180);
  doc.line(60, y, 240, y);
  doc.line(W - 240, y, W - 60, y);
  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.text("Employee Signature & Date", 60, y + 14);
  doc.text(`For ${b.logoText} Supermarkets Ltd`, W - 240, y + 14);

  // Footer
  doc.setFillColor(b.primary);
  doc.rect(0, H - 40, W, 40, "F");
  doc.setTextColor(255);
  doc.setFontSize(8);
  doc.text(
    `${b.logoText} Supermarkets Ltd  •  Human Resources  •  Bring this signed contract + a photocopy of your National ID to orientation.`,
    W / 2, H - 18, { align: "center" }
  );

  doc.save(`${b.logoText}-Contract-${(fullName || "Staff").replace(/\s+/g, "_")}.pdf`);
}
