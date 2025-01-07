"use client";
import { PlusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarIcon, Check, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

const Recurring = () => {
  const {
    payment,
    setPayment,
    payments,
    setPayments,
    updatingTag,
    setUpdatingTag,
    updatingTransaction,
    setUpdatingTransaction,
  } = useRecurringStore((state) => state);
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
  const removeTransactionFromPaymentAPI =
    api.recurring.removeTransactionFromPayment.useMutation({
      onSuccess: () => queryPaymentsAPI.refetch(),
    });
  const deletePaymentAPI = api.recurring.deletePayment.useMutation({
    onSuccess: () => queryPaymentsAPI.refetch(),
  });
  const updateTransactionAPI = api.recurring.updateTransaction.useMutation({
    onSuccess: () => queryPaymentsAPI.refetch(),
  });
  const deleteTransactionAPI = api.recurring.deleteTransaction.useMutation({
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
              transactionDate.getFullYear() === today.getFullYear() &&
              transactionDate.getMonth() === today.getMonth()
            );
          });
          const createdAt = new Date(p.createdAt); // Previously createdAt date
          const currentDate = new Date(); // Current date

          // Check if the createdAt month is less than the current month
          if (
            createdAt.getFullYear() < currentDate.getFullYear() ||
            createdAt.getMonth() < currentDate.getMonth()
          ) {
            // Add one month to the createdAt date
            createdAt.setMonth(createdAt.getMonth() + 1);
          }
          const dueDate = createdAt;

          // Local payment object
          return {
            ...p,
            amount: p.amount,
            tag: p.tag ?? "",
            dueDate,
            id: p.id,
            completedDate: p.transactions[0]?.createdAt
              ? new Date(p.transactions[0]?.createdAt)
              : undefined,
            paid,
            updated: createdAt !== dueDate,
            transactions: p.transactions.map((t) => ({
              ...t,
              amount: t.amount,
              createdAt: new Date(t.createdAt),
            })),
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

  const setPaidDatePayment = (
    id: string,
    amount: string,
    checked: boolean,
    transactionId?: string
  ) => {
    if (checked) {
      addTransactionToPaymentAPI.mutate({
        id,
        amount,
        createdAt: new Date(),
      });
    } else if (transactionId) {
      removeTransactionFromPaymentAPI.mutate({
        id,
        transactionId,
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
          return { ...payment, [e.target.name]: e.target.value, updated: true };
        }
        return payment;
      })
    );
  };

  const handleOnChangeUpdatingTagById = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value === "") {
      setUpdatingTag({
        id,
        tag: "",
      });
    }

    setUpdatingTag({ id, tag: e.target.value });
  };

  const handleUpdateTagById = (id: string, tag: string) => {
    setPayments(
      payments.map((payment) => {
        if (payment.id === id) {
          return { ...payment, tag };
        }
        return payment;
      })
    );
    setUpdatingTag({
      id: "",
      tag: "",
    });
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

  const handleTransactionAmountChange = (
    type: string,
    value: string | Date
  ) => {
    setUpdatingTransaction({
      ...updatingTransaction,
      [type]: value,
    });
  };

  const handleUpdateAmount = () => {
    const variables = {
      id: updatingTransaction.id,
      amount: updatingTransaction.amount,
      createdAt: updatingTransaction.createdAt,
    };
    updateTransactionAPI.mutate(variables);
    setUpdatingTransaction({
      id: "",
      amount: "",
      createdAt: new Date(),
    });
  };

  const handleRemoveTransaction = (id: string) => {
    const variables = {
      id,
    };
    deleteTransactionAPI.mutate(variables);
  };

  return (
    <div className="container grid grid-cols-1 place-items-center justify-center gap-4 p-4 md:flex md:place-items-start">
      <Card className="h-fit w-fit">
        <Calendar />
      </Card>
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>Payments</div>
          <Button variant={"destructive"} size={"sm"}>
            New month reset
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Checkbox id="transaction" />
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
                          updated,
                          transactions,
                        } = p;
                        console.log("t", transactions);
                        const diffDays = differenceInCalendarDays(
                          dueDate,
                          new Date()
                        );
                        return (
                          <div key={`${tag}-${id}`} className="">
                            <div
                              className={cn(
                                "flex items-center gap-4 md:gap-2",
                                {
                                  "opacity-50": paid,
                                }
                              )}
                            >
                              <Checkbox
                                id="transaction"
                                onCheckedChange={(checked: boolean) =>
                                  setPaidDatePayment(
                                    id,
                                    amount,
                                    checked,
                                    transactions[transactions.length - 1]?.id
                                  )
                                }
                                checked={paid}
                              />
                              <div className="grid grid-cols-2 gap-4 py-2 md:flex md:gap-2">
                                <div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "mb-2 w-full justify-start gap-x-1 text-left font-normal",
                                          !dueDate && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon
                                          className={cn("hidden w-4 sm:flex")}
                                        />
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
                                  placeholder="e.g. Updating Tag"
                                  name="updatingTag"
                                  onChange={(e) =>
                                    handleOnChangeUpdatingTagById(id, e)
                                  }
                                  onBlur={(e) =>
                                    handleUpdateTagById(id, updatingTag.tag)
                                  }
                                  value={
                                    updatingTag.id === id
                                      ? updatingTag.tag
                                      : tag
                                  }
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
                              </div>
                              <Button
                                size={"icon"}
                                variant={"link"}
                                onClick={() => {
                                  handleUpdatePayment(p);
                                }}
                              >
                                <Save
                                  className={cn(
                                    "w-4 text-green-50 opacity-50",
                                    (updated || id.length !== 24) &&
                                      "text-green-600"
                                  )}
                                />
                              </Button>
                              <Button
                                size={"icon"}
                                variant={"link"}
                                onClick={() => handleRemovePayment(id)}
                              >
                                <TrashIcon className="w-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="ml-8 text-xs md:ml-6">
                              {/* {paid &&
                                `Paid on ${format(
                                  completedDate ?? "",
                                  "MM-dd"
                                )}`}{" "}
                              <div className="text-red-700">
                                {!paid &&
                                  `${
                                    diffDays < 1 ? `Overdued for` : "Due in"
                                  } ${Math.abs(diffDays)} day${
                                    Math.abs(diffDays) > 1 ? `s` : ""
                                  }`}
                              </div> */}
                              <Accordion type="single" collapsible>
                                <AccordionItem
                                  value="item-1"
                                  className=" border-none"
                                >
                                  <AccordionTrigger className="max-w-fit gap-x-1 py-0 text-xs font-normal italic">
                                    {paid &&
                                      `Paid on ${format(
                                        completedDate ?? "",
                                        "MM-dd"
                                      )}`}{" "}
                                    <div className="text-red-700">
                                      {!paid &&
                                        `${
                                          diffDays < 1
                                            ? `Overdued for`
                                            : "Due in"
                                        } ${Math.abs(diffDays)} day${
                                          Math.abs(diffDays) > 1 ? `s` : ""
                                        }`}
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="text-xs">
                                    {transactions.map((t) => {
                                      return (
                                        <div
                                          key={t.id}
                                          className="flex items-center gap-x-2"
                                        >
                                          {updatingTransaction.id === t.id ? (
                                            <div className="flex">
                                              <div className="flex items-center gap-1 ">
                                                <Button
                                                  size="icon"
                                                  variant={"ghost"}
                                                  className="h-4 w-4 text-red-400"
                                                  onClick={() =>
                                                    handleRemoveTransaction(
                                                      t.id
                                                    )
                                                  }
                                                >
                                                  <TrashIcon />
                                                </Button>
                                                <div className="border-0 p-0 text-xs">
                                                  <Popover>
                                                    <PopoverTrigger asChild>
                                                      <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                          "w-full justify-start gap-x-1 border-0 text-left text-xs font-normal shadow-none"
                                                        )}
                                                      >
                                                        <CalendarIcon
                                                          className={cn(
                                                            "hidden w-4 sm:flex"
                                                          )}
                                                        />
                                                        {format(
                                                          updatingTransaction.createdAt ??
                                                            t.createdAt,
                                                          "MM-dd"
                                                        )}
                                                      </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                      <Calendar
                                                        mode="single"
                                                        selected={dueDate}
                                                        onSelect={(date) =>
                                                          handleTransactionAmountChange(
                                                            "createdAt",
                                                            date ?? new Date()
                                                          )
                                                        }
                                                        initialFocus
                                                      />
                                                    </PopoverContent>
                                                  </Popover>
                                                </div>
                                                <Input
                                                  className="m-0 h-fit max-w-fit border-none px-2 text-center text-xs text-gray-500 shadow-none"
                                                  value={
                                                    updatingTransaction.amount
                                                  }
                                                  onChange={(e) =>
                                                    handleTransactionAmountChange(
                                                      "amount",
                                                      e.target.value
                                                    )
                                                  }
                                                />
                                                <Button
                                                  size="icon"
                                                  variant={"ghost"}
                                                  className="h-4 w-4 text-green-400"
                                                  onClick={handleUpdateAmount}
                                                >
                                                  <Check />
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div
                                              className="mt-1 flex gap-x-2"
                                              onClick={() =>
                                                setUpdatingTransaction({
                                                  id: t.id,
                                                  amount: t.amount.toString(),
                                                  createdAt: t.createdAt,
                                                })
                                              }
                                            >
                                              <p>
                                                {format(t.createdAt, "MM-dd")}
                                              </p>
                                              <p>${t.amount}</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                              {/* {transactions.map((t) => {
                                return (
                                  <div
                                    key={t.id}
                                    className="flex items-center gap-x-2"
                                  >
                                    {updatingTransaction.id === t.id ? (
                                      <div className="flex">
                                        <div className="flex items-center gap-1 ">
                                          <Button
                                            size="icon"
                                            variant={"ghost"}
                                            className="h-4 w-4 text-red-400"
                                            onClick={() =>
                                              handleRemoveTransaction(t.id)
                                            }
                                          >
                                            <TrashIcon />
                                          </Button>
                                          <div className="border-0 p-0 text-xs">
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant={"outline"}
                                                  className={cn(
                                                    "w-full justify-start gap-x-1 border-0 text-left text-xs font-normal shadow-none"
                                                  )}
                                                >
                                                  <CalendarIcon
                                                    className={cn(
                                                      "hidden w-4 sm:flex"
                                                    )}
                                                  />
                                                  {format(
                                                    updatingTransaction.createdAt ??
                                                      t.createdAt,
                                                    "MM-dd"
                                                  )}
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                  mode="single"
                                                  selected={dueDate}
                                                  onSelect={(date) =>
                                                    handleTransactionAmountChange(
                                                      "createdAt",
                                                      date ?? new Date()
                                                    )
                                                  }
                                                  initialFocus
                                                />
                                              </PopoverContent>
                                            </Popover>
                                          </div>
                                          <Input
                                            className="m-0 h-fit max-w-fit border-none px-2 text-center text-xs text-gray-500 shadow-none"
                                            value={updatingTransaction.amount}
                                            onChange={(e) =>
                                              handleTransactionAmountChange(
                                                "amount",
                                                e.target.value
                                              )
                                            }
                                          />
                                          <Button
                                            size="icon"
                                            variant={"ghost"}
                                            className="h-4 w-4 text-green-400"
                                            onClick={handleUpdateAmount}
                                          >
                                            <Check />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        onClick={() =>
                                          setUpdatingTransaction({
                                            id: t.id,
                                            amount: t.amount.toString(),
                                            createdAt: t.createdAt,
                                          })
                                        }
                                      >
                                        {format(t.createdAt, "MM-dd")} $
                                        {t.amount}
                                      </div>
                                    )}
                                  </div>
                                );
                              })} */}
                            </div>
                          </div>
                        );
                      })}
                    <div className="flex justify-end">
                      Total $
                      {Math.round(
                        payments.reduce(
                          (acc, payment) => acc + Number(payment.amount),
                          0
                        )
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
