"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { transactionSchema } from "@/lib/validations";

export function AddTransactionForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      category: "personal",
    },
  });

  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage =
          typeof errorData === "string"
            ? errorData
            : errorData.message || "Something went wrong";

        toast.error(errorMessage);
        return;
      }

      toast.success("Transaction added successfully!");
      reset();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FieldGroup className="space-y-4">
        {/* Title Field */}
        <Field>
          <FieldLabel>Title / Purpose</FieldLabel>
          <Input
            {...register("title")}
            placeholder="e.g. Income or Cost"
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount Field */}
          <Field>
            <FieldLabel>Amount</FieldLabel>
            <Input
              type="number"
              {...register("amount")}
              placeholder="0.00"
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.amount.message}
              </p>
            )}
          </Field>

          {/* Category Select */}
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              onValueChange={(value: any) => setValue("category", value)}
              defaultValue="personal"
            >
              <SelectTrigger
                className={errors.category ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="personal">Personal Cost</SelectItem>
                <SelectItem value="medicine">Medicine</SelectItem>
                <SelectItem value="family">Family Cost</SelectItem>
                <SelectItem value="savings">Savings</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-500 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </Field>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {isSubmitting ? "Adding..." : "Add Transaction"}
        </Button>
      </FieldGroup>
    </form>
  );
}
