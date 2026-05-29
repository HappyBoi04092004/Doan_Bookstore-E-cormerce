import { Prisma } from "@prisma/client";
import { createSePayClient, getSePayConfig } from "../config/sepay";
import { paymentRepository } from "../repositories/payment.repository";

export interface CreateSePayPaymentInput {
  userId: number;
  orderId: string;
  amount: number;
  items: { variantId: number; quantity: number }[];
}

interface SePayIpnPayload {
  notification_type?: string;
  order?: {
    order_invoice_number?: string;
  };
  transaction?: {
    transaction_status?: string;
    transaction_id?: string;
    id?: string;
    amount?: number;
    transaction_amount?: number | string;
    currency?: string;
    transaction_currency?: string;
  };
}

function isPaidSePayStatus(status?: string) {
  return ["APPROVED", "CAPTURED", "PAID", "SUCCESS"].includes(String(status ?? "").toUpperCase());
}

function readSePayAmount(payload: SePayIpnPayload, fallbackAmount: number) {
  return Number(payload.transaction?.amount ?? payload.transaction?.transaction_amount ?? fallbackAmount);
}

function readSePayCurrency(payload: SePayIpnPayload, fallbackCurrency: string) {
  return payload.transaction?.currency ?? payload.transaction?.transaction_currency ?? fallbackCurrency;
}

function appendOrderId(url: string, orderId: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}orderId=${encodeURIComponent(orderId)}`;
}

function buildAutoSubmitHtml(paymentUrl: string, fields: Record<string, unknown>) {
  const inputs = Object.entries(fields)
    .map(([key, value]) => {
      const safeValue = String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      return `<input type="hidden" name="${key}" value="${safeValue}" />`;
    })
    .join("");

  return `<!doctype html><html><body><form id="sepay-checkout" action="${paymentUrl}" method="POST">${inputs}</form><script>document.getElementById("sepay-checkout").submit();</script></body></html>`;
}

export const paymentService = {
  async createSePayPayment(input: CreateSePayPaymentInput) {
    const currency = "VND";
    const invoiceNumber = input.orderId.trim().toUpperCase();

    const existingOrder = await paymentRepository.findOrderByInvoiceNumber(invoiceNumber);
    if (existingOrder && existingOrder.total !== input.amount) {
      throw new Error("ORDER_AMOUNT_MISMATCH");
    }

    const sepayConfig = getSePayConfig();
    const client = createSePayClient();
    const paymentUrl = client.checkout.initCheckoutUrl();
    const paymentFields = client.checkout.initOneTimePaymentFields({
      operation: "PURCHASE",
      payment_method: "BANK_TRANSFER",
      order_invoice_number: invoiceNumber,
      order_amount: input.amount,
      currency,
      order_description: `Thanh toan don hang ${invoiceNumber}`,
      success_url: appendOrderId(sepayConfig.successUrl, invoiceNumber),
      error_url: appendOrderId(sepayConfig.errorUrl, invoiceNumber),
      cancel_url: appendOrderId(sepayConfig.cancelUrl, invoiceNumber),
      custom_data: JSON.stringify({ invoiceNumber }),
    });

    const order = existingOrder ?? (await paymentRepository.createSePayOrder({
      userId: input.userId,
      invoiceNumber,
      amount: input.amount,
      currency,
      paymentUrl,
      items: input.items,
    }));

    if (existingOrder) {
      await paymentRepository.updatePaymentUrl({
        orderId: existingOrder.id,
        amount: input.amount,
        currency,
        paymentUrl,
      });
    }

    return {
      paymentUrl,
      paymentFields,
      autoSubmitHtml: buildAutoSubmitHtml(paymentUrl, paymentFields),
      orderId: invoiceNumber,
      internalOrderId: order.id,
    };
  },

  async getPaymentStatus(orderId: string) {
    const invoiceNumber = orderId.trim().toUpperCase();
    let order = await paymentRepository.findOrderByInvoiceNumber(invoiceNumber);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.paymentStatus !== "PAID") {
      await this.syncSePayOrderStatus(invoiceNumber);
      order = await paymentRepository.findOrderByInvoiceNumber(invoiceNumber);
      if (!order) throw new Error("ORDER_NOT_FOUND");
    }

    return {
      orderId: order.invoiceNumber,
      amount: order.total,
      currency: order.currency,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
    };
  },

  async handleSePayIpn(payload: SePayIpnPayload) {
    if (payload.notification_type !== "ORDER_PAID") {
      return { processed: false, reason: "UNSUPPORTED_NOTIFICATION_TYPE" };
    }

    if (!isPaidSePayStatus(payload.transaction?.transaction_status)) {
      return { processed: false, reason: "TRANSACTION_NOT_APPROVED" };
    }

    const invoiceNumber = payload.order?.order_invoice_number?.trim().toUpperCase();
    if (!invoiceNumber) {
      throw new Error("INVOICE_NUMBER_REQUIRED");
    }

    const existingOrder = await paymentRepository.findOrderByInvoiceNumber(invoiceNumber);
    if (!existingOrder) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const amount = readSePayAmount(payload, existingOrder.total);
    const currency = readSePayCurrency(payload, existingOrder.currency ?? "VND");

    const order = await paymentRepository.completeSePayPayment({
      invoiceNumber,
      transactionId: payload.transaction?.transaction_id ?? payload.transaction?.id,
      amount,
      currency,
      transactionStatus: String(payload.transaction?.transaction_status),
      notificationType: payload.notification_type,
      rawPayload: payload as Prisma.InputJsonValue,
    });

    return { processed: Boolean(order), order };
  },

  async syncSePayOrderStatus(invoiceNumber: string) {
    try {
      const client = createSePayClient();
      const response = await client.order.retrieve(invoiceNumber);
      const data = response.data;
      const orderData = data?.order ?? data?.data?.order ?? data?.data ?? data;
      const transactionData = data?.transaction ?? data?.data?.transaction ?? orderData?.transaction;
      const status = transactionData?.transaction_status ?? orderData?.order_status ?? orderData?.status;

      if (!isPaidSePayStatus(status)) {
        return { processed: false, reason: "REMOTE_ORDER_NOT_PAID", status };
      }

      const existingOrder = await paymentRepository.findOrderByInvoiceNumber(invoiceNumber);
      if (!existingOrder) throw new Error("ORDER_NOT_FOUND");

      const amount = Number(
        transactionData?.transaction_amount ??
        transactionData?.amount ??
        orderData?.order_amount ??
        existingOrder.total
      );
      const currency =
        transactionData?.transaction_currency ??
        transactionData?.currency ??
        orderData?.order_currency ??
        existingOrder.currency ??
        "VND";

      const order = await paymentRepository.completeSePayPayment({
        invoiceNumber,
        transactionId: transactionData?.transaction_id ?? transactionData?.id ?? orderData?.id,
        amount,
        currency,
        transactionStatus: String(status),
        notificationType: "ORDER_STATUS_SYNC",
        rawPayload: data as Prisma.InputJsonValue,
      });

      return { processed: Boolean(order), order };
    } catch (error) {
      console.error("[syncSePayOrderStatus]", {
        invoiceNumber,
        message: error instanceof Error ? error.message : String(error),
      });
      return { processed: false, reason: "REMOTE_SYNC_FAILED" };
    }
  },
};
