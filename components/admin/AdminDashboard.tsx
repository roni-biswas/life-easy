"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, UserCog, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

interface TransactionRow {
  userId: string;
  name: string;
  email: string;
  role: string;
  date: string;
  totalIncome: number;
  totalCost: number;
  totalSavings: number;
  totalWithdraw: number;
  netBalance: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (Array.isArray(json)) setData(json);
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!userId) {
      toast.error("User ID not found!");
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        toast.success("Role updated");
        // Instant UI update
        setData((prev) =>
          prev.map((item) =>
            item.userId === userId ? { ...item, role: newRole } : item,
          ),
        );
      } else {
        toast.error("Failed to update");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  // User Management Table for unique users list
  const uniqueUsers = useMemo(() => {
    const seen = new Set();
    return data.filter((item) => {
      const isDuplicate = seen.has(item.userId);
      seen.add(item.userId);
      return (
        !isDuplicate &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [data, searchTerm]);

  // Financial Table filtered history
  const filteredHistory = useMemo(() => {
    return data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data, searchTerm]);

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse text-slate-500">
        Loading Admin Data...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table 1: User Management */}
      <Card className="shadow-sm border-none bg-slate-50/20 dark:bg-slate-50/10">
        <CardHeader className="flex flex-row items-center space-x-2">
          <UserCog className="w-5 h-5 text-slate-600" />
          <CardTitle className="text-lg font-medium">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white dark:bg-black/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead>User Details</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead className="text-right">Change Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uniqueUsers.map((user) => (
                  <TableRow key={`user-${user.userId}`}>
                    <TableCell>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={user.role}
                        onValueChange={(val) =>
                          handleRoleChange(user.userId, val)
                        }
                      >
                        <SelectTrigger className="w-28 ml-auto h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table 2: Daily Transaction History */}
      <Card className="shadow-sm border-none bg-slate-50/20 dark:bg-slate-50/10">
        <CardHeader className="flex flex-row items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-slate-600" />
          <CardTitle className="text-lg font-medium">
            Daily Financial Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white dark:bg-black/40 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900">
                <TableRow>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Savings</TableHead>
                  <TableHead className="text-right">Withdrawals</TableHead>
                  <TableHead className="text-right font-bold border-l">
                    Remaining
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((row, index) => (
                    <TableRow key={`${row.userId}-${row.date}-${index}`}>
                      <TableCell className="font-medium text-slate-600 text-xs">
                        {row.date}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium font-mono">
                        {row.totalIncome}
                      </TableCell>
                      <TableCell className="text-right text-red-500 font-mono">
                        {row.totalCost}
                      </TableCell>
                      <TableCell className="text-right text-red-500 font-mono">
                        {row.totalSavings}
                      </TableCell>
                      <TableCell className="text-right text-blue-500 font-mono">
                        {Math.abs(row.totalWithdraw).toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-right font-bold border-l font-mono ${row.netBalance >= 0 ? "text-green-700 bg-green-50/30 dark:bg-black/20" : "text-red-700 bg-red-50/30 dark:bg-black/20"}`}
                      >
                        {row.netBalance}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-slate-500"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
