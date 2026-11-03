import type { OrderStatus } from "@prisma/client";

const MAP: Record<string, OrderStatus> = {
  pending: "PENDING_PAYMENT",
  pending_payment: "PENDING_PAYMENT",
  confirmed: "CONFIRMED",
  processing: "PROCESSING",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

/** Admin screens use lowercase names; the database enum is uppercase. */
export function toDbStatus(value: string): OrderStatus | null {
  return MAP[value.toLowerCase()] ?? null;
}
