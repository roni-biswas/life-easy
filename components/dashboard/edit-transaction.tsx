"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { transactionSchema } from "@/lib/validations";
import { Field, FieldGroup } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function EditTransactionForm({
  transaction,
  onSuccess,
}: {
  transaction: any;
  onSuccess: (data: any) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: transaction?.title || "",
      amount: transaction?.amount || 0,
      category: transaction?.category || "",
    },
  });

  // ২. Jodi component load hoyar por transaction data ashe, tahole reset use kora safe
  useEffect(() => {
    if (transaction) {
      reset({
        title: transaction.title,
        amount: transaction.amount,
        category: transaction.category,
      });
    }
  }, [transaction, reset]);

  const currentCategory = watch("category");

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const updatedData = await res.json();
        toast.success("Updated!");
        onSuccess(updatedData);
        router.refresh();
      }
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-2">
      <FieldGroup className="space-y-4">
        {/* Description */}
        <Field>
          <Label>Title</Label>
          <Input {...register("title")} placeholder="Ex: Office Rent" />
          {errors.title && (
            <p className="text-red-500 text-[11px]">{errors.title.message}</p>
          )}
        </Field>

        {/* Amount */}
        <Field>
          <Label>Amount</Label>
          <Input type="number" {...register("amount")} placeholder="0.00" />
          {errors.amount && (
            <p className="text-red-500 text-[11px]">{errors.amount.message}</p>
          )}
        </Field>

        {/* Category Selection */}
        <Field>
          <Label>Category</Label>
          <Select
            value={currentCategory}
            onValueChange={(val) => setValue("category", val as any)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="family">Family</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-red-500 text-[11px]">
              {errors.category.message}
            </p>
          )}
        </Field>
      </FieldGroup>

      <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
        {loading ? "Updating..." : "Save Changes"}
      </Button>
    </form>
  );
}
