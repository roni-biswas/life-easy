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

      // ADVANCED DAILY GROUPING LOGIC (Updated for Specific Type Check)
      const groups: any = {};

      data.forEach((t: any) => {
        // Date ke string format-e neya
        const date = new Date(t.date).toLocaleDateString("en-GB");

        if (!groups[date]) {
          groups[date] = { date, income: 0, cost: 0, withdraw: 0, savings: 0 };
        }

        const amt = Math.abs(Number(t.amount));

        // ১. Income calculation (Direct Category check)
        if (t.category === "income") {
          groups[date].income += amt;
        }
        // ২. Savings calculation (Category savings hote hobe ebong Type deposit hote hobe)
        else if (t.category === "savings" && t.type === "deposit") {
          groups[date].savings += amt;
        }
        // ৩. Withdraw calculation (Database-er type check)
        else if (t.type === "withdraw") {
          groups[date].withdraw += amt;
        }
        // ৪. Everything else is Cost (Personal, Medicine, etc. jader type deposit kintu category savings na)
        else {
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
    if (activeFilter === "all") {
      return toast.error("Please select 1 Month or 3 Months statement.");
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const userName = session?.user?.name || "User Name";
    const userEmail = session?.user?.email || "user@email.com";

    doc.setFontSize(20);
    doc.setTextColor(30, 41, 59);
    doc.text("Life Easy - Statement", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Name: ${userName}`, 14, 28);
    doc.text(`Email: ${userEmail}`, 14, 33);

    doc.text(
      `Period: ${dateRange.start} - ${dateRange.end}`,
      pageWidth - 14,
      28,
      { align: "right" },
    );
    doc.text(`Type: ${activeFilter}`, pageWidth - 14, 33, { align: "right" });

    doc.setDrawColor(200);
    doc.line(14, 38, pageWidth - 14, 38);

    // DATA CALCULATION
    let totalIncome = 0;
    let totalCost = 0;
    let totalWithdraw = 0;
    let totalSavings = 0;

    const tableRows = dailyData.map((day) => {
      totalIncome += day.income;
      totalCost += day.cost;
      totalWithdraw += day.withdraw;
      totalSavings += day.savings;

      // Net Balance = Income - (Khoroch + Savings e joma kora taka)
      const netBalance = day.income - (day.cost + day.savings);

      return [
        day.date,
        `${day.income.toLocaleString()}`,
        `${day.cost.toLocaleString()}`,
        `${day.savings.toLocaleString()}`,
        `${day.withdraw.toLocaleString()}`,
        `${netBalance.toLocaleString()}`,
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [
        ["Date", "Income", "Costs", "Savings", "Withdraws", "Net Balance"],
      ],
      body: tableRows,
      foot: [
        [
          "TOTAL",
          `${totalIncome.toLocaleString()}`,
          `${totalCost.toLocaleString()}`,
          `${totalSavings.toLocaleString()}`,
          `${totalWithdraw.toLocaleString()}`,
          `${(totalIncome - (totalCost + totalSavings)).toLocaleString()}`,
        ],
      ],
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [30, 41, 59], textColor: 255 },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontStyle: "bold",
      },
      theme: "grid",
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Generated by Roni Biswas | ${new Date().toLocaleDateString()}`,
          14,
          pageHeight - 10,
        );
        const str = "Page " + doc.getNumberOfPages();
        doc.text(str, pageWidth - 25, pageHeight - 10);
      },
    });

    doc.save(`Statement_${activeFilter.replace(/\s+/g, "_")}.pdf`);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Statement</h1>
        <div className="flex gap-2">
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
            className={`${activeFilter === "all" ? "bg-slate-300" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            <Download className="mr-2 h-4 w-4" /> PDF
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
                <TableHead>Savings</TableHead> {/* UI Table head */}
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
                    className="hover:bg-slate-50/50 dark:hover:bg-black/30 transition-colors"
                  >
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-green-600">
                      {day.income.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-red-500">
                      {day.cost.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-blue-500 font-medium">
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
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-900/20 text-sm shadow-sm">
          <AlertCircle className="h-4 w-4" />
          PDF download is disabled for 'All' data. Please select 1 or 3 months
          for full report.
        </div>
      )}
    </div>
  );
}
