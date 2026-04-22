import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export function SummaryCards({ income, cost, balance }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{income}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Cost</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{cost}</div>
        </CardContent>
      </Card>

      <Card
        className={
          balance < 0 ? "border-red-500 bg-red-50/50 dark:bg-red-50/20" : ""
        }
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Balance</CardTitle>
          <Wallet
            className={`h-4 w-4 ${balance < 0 ? "text-red-600" : "text-blue-600"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${balance < 0 ? "text-red-600" : "text-blue-600"}`}
          >
            {balance}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
