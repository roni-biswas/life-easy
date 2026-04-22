"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PiggyBank, ArrowDownCircle, History, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
export default function SavingsClient() {
  const [data, setData] = useState<any>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  if (!session) redirect("/auth");

  const fetchData = async () => {
    const res = await fetch("/api/savings");
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    // Safety Check: Total balance-er beshi withdraw kora jabe na
    if (Number(withdrawAmount) > data.stats.total) {
      return toast.error("Insufficient savings balance!");
    }

    setLoading(true);
    const res = await fetch("/api/savings/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: withdrawAmount, description: desc }),
    });

    if (res.ok) {
      toast.success("Balance withdrawn from savings");
      setWithdrawAmount("");
      setDesc("");
      fetchData();
    } else {
      toast.error("Withdrawal failed");
    }
    setLoading(false);
  };

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Savings</h1>
        <Badge
          variant="outline"
          className="light:bg-white px-4 py-1 text-sm font-medium shadow-sm"
        >
          Currency: BDT (৳)
        </Badge>
      </div>

      {/* --- 1. Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md light:bg-white">
          <CardHeader className="pb-2 text-muted-foreground text-sm font-medium flex flex-row items-center justify-between">
            Today&apos;s Savings{" "}
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-green-600">
            {data.stats.today.toLocaleString()}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md light:bg-white">
          <CardHeader className="pb-2 text-muted-foreground text-sm font-medium flex flex-row items-center justify-between">
            This Month <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="text-2xl font-bold text-blue-600">
            {data.stats.month.toLocaleString()}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-slate-900 text-white">
          <CardHeader className="pb-2 text-slate-400 text-sm font-medium flex flex-row items-center justify-between">
            Total Net Balance <PiggyBank className="h-4 w-4 text-pink-400" />
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {data.stats.total.toLocaleString()}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* --- 2. Withdraw Form --- */}
        <Card className="lg:col-span-1 border-none shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
              <ArrowDownCircle className="h-5 w-5" /> Withdraw
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Amount
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-slate-50 border-none focus-visible:ring-red-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Description
                </label>
                <Input
                  placeholder="Reason..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="bg-slate-50 border-none"
                />
              </div>
              <Button
                type="submit"
                variant="destructive"
                className="w-full shadow-lg shadow-red-200 dark:shadow-red-50/0"
                disabled={loading}
              >
                {loading ? "Processing..." : "Withdraw Now"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- 3. History Table --- */}
        <Card className="lg:col-span-3 border-none shadow-md overflow-hidden">
          <CardHeader className="light:bg-white border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5text-slate-500" /> Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-black/50">
                <TableRow>
                  <TableHead className="w-30">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.history.map((item: any) => (
                  <TableRow
                    key={item._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-black/30 transition-colors"
                  >
                    <TableCell className="text-xs text-muted-foreground font-medium">
                      {new Date(item.date).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell className="max-w-30 md:max-w-xs lg:max-w-none">
                      <div
                        className="font-medium text-slate-700 dark:text-slate-400 truncate"
                        title={item.title}
                      >
                        {item.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.amount < 0 ? (
                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-red-600 border-none"
                        >
                          Withdraw
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-green-50 text-green-600 border-none"
                        >
                          Deposit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${item.amount < 0 ? "text-red-500" : "text-green-600"}`}
                    >
                      {item.amount < 0
                        ? `-${Math.abs(item.amount)}`
                        : `+${item.amount}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.history.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm italic">
                No transactions yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
