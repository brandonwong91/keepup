"use client";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { CalendarIcon, CopyCheck, FileIcon, SaveAllIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";
import { initPayment, Payment, useRecurringStore } from "./state";

const Recurring = () => {
  const { payment, setPayment, payments, setPayments } = useRecurringStore(
    (state) => state
  );
  const { dueDate, tag, amount, title } = payment;

  const [progress, setProgress] = useState(13);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);
  const queryPaymentsAPI = api.recurring.getAllPayments.useQuery();
  const createPaymentAPI = api.recurring.createPayment.useMutation();
  const updatePaymentAPI = api.recurring.updatePayment.useMutation({
    onSuccess: () => queryPaymentsAPI.refetch(),
  });
  const addTransactionToPaymentAPI =
    api.recurring.addTransactionToPayment.useMutation({
      onSuccess: () => queryPaymentsAPI.refetch(),
    });
  const deletePaymentAPI = api.recurring.deletePayment.useMutation({
    onSuccess: () => queryPaymentsAPI.refetch(),
  });

  useEffect(() => {
    if (queryPaymentsAPI.data) {
      setPayments(
        queryPaymentsAPI.data.map((p) => {
          const today = new Date(new Date().setHours(0, 0, 0, 0));
          const paid = p.transactions.some((t) => {
            const transactionDate = new Date(t.createdAt);
            return (
              transactionDate < today &&
              transactionDate.getFullYear() === today.getFullYear() &&
              transactionDate.getMonth() === today.getMonth()
            );
          });
          return {
            ...p,
            amount: p.amount,
            tag: p.tag ?? "",
            dueDate: new Date(p.createdAt ?? Date.now()),
            id: p.id,
            completedDate: p.transactions[0]?.createdAt
              ? new Date(p.transactions[0]?.createdAt)
              : undefined,
            paid,
          };
        })
      );
    }
  }, [queryPaymentsAPI.data]);

  const handlePaymentDateOnSelect = (date?: Date) => {
    setPayment({
      ...payment,
      dueDate: date ?? new Date(),
    });
  };

  const handlePaymentOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddPayment = () => {
    setPayments([...payments, { ...payment, id: Date.now().toString() }]);
    setPayment({
      ...initPayment,
    });
  };

  const mapPaymentsByTag =
    payments &&
    payments.reduce(
      (acc: Record<string, (typeof payments)[number][]>, payment) => {
        const tag = payment.tag || "untagged";
        if (!acc[tag]) {
          acc[tag] = [];
        }
        acc[tag]?.push(payment);
        return acc;
      },
      {}
    );
  console.log(payments, "-", mapPaymentsByTag);

  const setPaidDatePayment = (id: string, value: boolean) => {
    if (value) {
      addTransactionToPaymentAPI.mutate({
        id,
        amount,
        createdAt: new Date(),
      });
    }
  };

  const handleDueDatePayment = (id: string, date: Date) => {
    setPayments(
      payments.map((payment) => {
        if (payment.id === id) {
          return { ...payment, dueDate: date };
        }
        return payment;
      })
    );
  };

  const handleOnChangePaymentsById = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPayments(
      payments.map((payment) => {
        if (payment.id === id) {
          return { ...payment, [e.target.name]: e.target.value };
        }
        return payment;
      })
    );
  };

  const handleUpdatePayment = async (p: Payment) => {
    const variables = {
      ...p,
    };
    if (p.id.length !== 24) {
      await createPaymentAPI.mutate(variables);
    } else {
      await updatePaymentAPI.mutate(variables);
    }
  };

  const handleRemovePayment = async (id: string) => {
    const variables = {
      id,
    };
    await deletePaymentAPI.mutate(variables);
  };

  return (
    <div className="container grid grid-cols-1 justify-center gap-4 p-4 md:grid-cols-3">
      <Card className="w-fit">
        <Calendar />
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>Payments</div>
          <Button variant={"destructive"} size={"sm"}>
            Uncheck all
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <div className="mt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "mb-2 w-full justify-start gap-x-1 text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4" />
                      <span>{`Due`}</span>

                      {dueDate ? (
                        `${format(dueDate, "MM-dd")}`
                      ) : (
                        <span>date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={handlePaymentDateOnSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                placeholder="e.g. Tag"
                value={tag}
                onChange={handlePaymentOnChange}
                name="tag"
              />
              <Input
                placeholder="e.g. Bank"
                value={title}
                onChange={handlePaymentOnChange}
                name="title"
              />
              <Input
                placeholder="e.g. 300"
                value={amount}
                onChange={handlePaymentOnChange}
                name="amount"
              />
              <Button size={"icon"} variant={"link"} onClick={handleAddPayment}>
                <PlusCircledIcon />
              </Button>
            </div>
            {/* <Progress value={progress} className="ml-6 w-[95%]" /> */}
          </div>
          {mapPaymentsByTag && <Separator className="my-4" />}
          {mapPaymentsByTag &&
            Object.entries(mapPaymentsByTag).map((paymentRecord) => {
              const [key, payments] = paymentRecord;
              return (
                <div key={key}>
                  <div className="flex flex-col">
                    <div>
                      <Badge>{key}</Badge>
                    </div>
                    {payments
                      .sort(
                        (a, b) =>
                          // use completedDate else use due date convert to int for comparison
                          Number(a.completedDate ?? a.dueDate) -
                          Number(b.completedDate ?? b.dueDate)
                      )
                      .map((p) => {
                        const {
                          amount,
                          id,
                          tag,
                          title,
                          dueDate,
                          completedDate,
                          paid,
                        } = p;
                        return (
                          <div key={`${tag}-${id}`}>
                            <div
                              className={cn("flex items-center gap-2", {
                                "opacity-50": completedDate,
                              })}
                            >
                              <Checkbox
                                id="transaction"
                                onCheckedChange={(value: boolean) =>
                                  setPaidDatePayment(id, value)
                                }
                                checked={paid}
                              />
                              <div className="mt-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "mb-2 w-full justify-start gap-x-1 text-left font-normal",
                                        !dueDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="w-4" />
                                      <span>{`Due`}</span>
                                      {dueDate ? (
                                        `${format(dueDate, "MM-dd")}`
                                      ) : (
                                        <span>date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <Calendar
                                      mode="single"
                                      selected={dueDate}
                                      onSelect={(date) =>
                                        handleDueDatePayment(
                                          id,
                                          date ?? new Date()
                                        )
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <Input
                                placeholder="e.g. Tag"
                                name="tag"
                                onChange={(e) =>
                                  handleOnChangePaymentsById(id, e)
                                }
                                value={tag}
                              />
                              <Input
                                placeholder="e.g. Bank"
                                value={title}
                                name="title"
                                onChange={(e) =>
                                  handleOnChangePaymentsById(id, e)
                                }
                              />
                              <Input
                                placeholder="e.g. 300"
                                value={amount}
                                name="amount"
                                onChange={(e) =>
                                  handleOnChangePaymentsById(id, e)
                                }
                              />
                              <Button
                                size={"icon"}
                                variant={"link"}
                                onClick={() => {
                                  handleUpdatePayment(p);
                                }}
                              >
                                <SaveAllIcon className="w-4 text-green-500" />
                              </Button>
                              <Button
                                size={"icon"}
                                variant={"link"}
                                onClick={() => handleRemovePayment(id)}
                              >
                                <TrashIcon className="w-4 text-red-500" />
                              </Button>
                            </div>
                            {paid && (
                              <div className="ml-6 text-xs">{`Paid on ${format(
                                completedDate ?? "",
                                "MM-dd"
                              )}`}</div>
                            )}
                          </div>
                        );
                      })}
                    <div className="flex justify-end">
                      Total $
                      {payments.reduce(
                        (acc, payment) => acc + Number(payment.amount),
                        0
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </CardContent>
        {/* <CardFooter className="justify-end">
          <Button onClick={handleUpdatePayment}>Save</Button>
        </CardFooter> */}
      </Card>
    </div>
  );
};

export default Recurring;
