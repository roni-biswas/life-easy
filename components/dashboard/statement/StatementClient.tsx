"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Loader2, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function StatementClient() {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const { data: session } = useSession();

  if (!session) redirect("/auth");

  useEffect(() => {
    setMounted(true);
    fetchStatement();
  }, []);

  const fetchStatement = async (days?: number) => {
    setLoading(true);
    try {
      let url = `/api/statement`;
      if (days) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        url += `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
        setDateRange({
          start: start.toLocaleDateString("en-GB"),
          end: end.toLocaleDateString("en-GB"),
        });
        setActiveFilter(days === 30 ? "1 Month" : "3 Months");
      } else {
        setActiveFilter("all");
        setDateRange({ start: "Beginning", end: "Today" });
      }

      const res = await fetch(url);
      const data = await res.json();

      const groups: any = {};
      data.forEach((t: any) => {
        const date = new Date(t.date).toLocaleDateString("en-GB");
        if (!groups[date]) {
          groups[date] = { date, income: 0, cost: 0, withdraw: 0, savings: 0 };
        }

        const amt = Math.abs(Number(t.amount));
        if (t.category === "income") {
          groups[date].income += amt;
        } else if (t.category === "savings" && t.type === "deposit") {
          groups[date].savings += amt;
        } else if (t.type === "withdraw") {
          groups[date].withdraw += amt;
        } else {
          groups[date].cost += amt;
        }
      });

      setDailyData(Object.values(groups));
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    try {
      if (activeFilter === "all") {
        return toast.error("Please select 1 Month or 3 Months statement.");
      }
      if (dailyData.length === 0) {
        return toast.error("No data available to download.");
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- Calculations ---
      let totalIncome = 0;
      let totalCost = 0;
      let totalSavingsDep = 0;
      let totalWithdraw = 0;

      const tableRows = dailyData.map((day) => {
        totalIncome += day.income;
        totalCost += day.cost;
        totalSavingsDep += day.savings;
        totalWithdraw += day.withdraw;
        const netBalance = day.income - (day.cost + day.savings);

        return [
          day.date,
          day.income.toLocaleString(),
          day.cost.toLocaleString(),
          day.savings.toLocaleString(),
          day.withdraw.toLocaleString(),
          netBalance.toLocaleString(),
        ];
      });

      // --- Table Logic ---
      autoTable(doc, {
        startY: 45,
        head: [
          ["Date", "Income", "Costs", "Savings", "Withdrawals", "Net Balance"],
        ],
        body: tableRows,
        // --- Total Row Calculation ---
        foot: [
          [
            "TOTAL",
            totalIncome.toLocaleString(),
            totalCost.toLocaleString(),
            totalSavingsDep.toLocaleString(),
            totalWithdraw.toLocaleString(),
            (totalIncome - (totalCost + totalSavingsDep)).toLocaleString(),
          ],
        ],
        showFoot: "lastPage",
        theme: "grid",
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        footStyles: {
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: "bold",
        },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { top: 45, bottom: 25 },

        didDrawPage: (data) => {
          // --- Sticky Header --
          doc.setFontSize(22);
          doc.setTextColor(30, 41, 59);
          doc.setFont("helvetica", "bold");
          doc.text("LIFE EASY", 14, 20);

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100);
          doc.text("FINANCIAL STATEMENT", 14, 26);

          doc.setFontSize(9);
          doc.text(`Name: ${session?.user?.name || "User"}`, 14, 34);
          doc.text(`Period: ${dateRange.start} - ${dateRange.end}`, 14, 39);

          doc.text(`Filter: ${activeFilter}`, pageWidth - 14, 34, {
            align: "right",
          });
          doc.text(
            `Date: ${new Date().toLocaleDateString()}`,
            pageWidth - 14,
            39,
            { align: "right" },
          );

          doc.setDrawColor(200);
          doc.line(14, 42, pageWidth - 14, 42);

          // --- Sticky Footer (Proti Page-e thakbe) ---
          const footerY = pageHeight - 10;
          doc.setFontSize(9);
          doc.setTextColor(150);
          doc.setFont("helvetica", "normal");
          doc.text("Generated by ", 14, footerY);

          // Blue Link
          doc.setTextColor(37, 99, 235);
          doc.setFont("helvetica", "bold");
          doc.text("Roni Biswas", 34, footerY);
          doc.link(34, footerY - 3, 20, 5, {
            url: "https://github.com/roni-biswas",
          });

          // Page Number
          doc.setFont("helvetica", "normal");
          doc.setTextColor(150);
          doc.text(` | Page ${data.pageNumber}`, 53, footerY);
        },
      });

      // --- Summary Section (Deposit - Withdraw) ---
      let finalY = (doc as any).lastAutoTable.finalY + 12;

      if (finalY > pageHeight - 40) {
        doc.addPage();
        finalY = 50;
      }

      const netSavingsBalance = totalSavingsDep - totalWithdraw;

      doc.setFillColor(248, 250, 252);
      doc.rect(14, finalY - 5, pageWidth - 28, 25, "F");

      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("Savings Summary (Net):", 20, finalY + 5);

      doc.setFontSize(13);
      if (netSavingsBalance >= 0) {
        doc.setTextColor(5, 150, 105); // Green
      } else {
        doc.setTextColor(220, 38, 38); // Red
      }
      doc.text(
        `Balance: ${netSavingsBalance.toLocaleString()} BDT`,
        20,
        finalY + 13,
      );

      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.text(
        `(Total Deposits: ${totalSavingsDep.toLocaleString()} | Total Withdrawals: ${totalWithdraw.toLocaleString()})`,
        20,
        finalY + 19,
      );

      doc.save(`Statement_${activeFilter.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF Downloaded!");
    } catch (error) {
      console.error(error);
      toast.error("Could not generate PDF");
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Statement</h1>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => fetchStatement()}
          >
            All
          </Button>
          <Button
            variant={activeFilter === "1 Month" ? "default" : "outline"}
            onClick={() => fetchStatement(30)}
          >
            1 Month
          </Button>
          <Button
            variant={activeFilter === "3 Months" ? "default" : "outline"}
            onClick={() => fetchStatement(90)}
          >
            3 Months
          </Button>

          <Button
            onClick={downloadPDF}
            disabled={activeFilter === "all"}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Income</TableHead>
                <TableHead>Costs</TableHead>
                <TableHead>Savings (Dep)</TableHead>
                <TableHead>Withdrawals</TableHead>
                <TableHead className="text-right">Net Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <Loader2 className="animate-spin mx-auto text-blue-600" />
                  </TableCell>
                </TableRow>
              ) : (
                dailyData.map((day, i) => (
                  <TableRow
                    key={i}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <TableCell className="font-medium text-xs">
                      {day.date}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      {day.income.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-500">
                      {day.cost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-blue-500">
                      {day.savings.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-orange-500">
                      {day.withdraw.toLocaleString()}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${day.income - (day.cost + day.savings) >= 0 ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {(day.income - (day.cost + day.savings)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {activeFilter === "all" && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm shadow-sm">
          <AlertCircle className="h-4 w-4" />
          PDF download is disabled for &apos;All&apos; data. Please select 1 or
          3 months.
        </div>
      )}
    </div>
  );
}
