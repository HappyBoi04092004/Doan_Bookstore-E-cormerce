import { Request, Response } from "express";
import { z } from "zod";
import { getSePayConfig } from "../config/sepay";
import { paymentService } from "../services/payment.service";

const createSePayPaymentSchema = z.object({
  orderId: z.string().min(1, "orderId is required").max(64),
  amount: z.number().int().positive("amount must be a positive integer"),
  items: z.array(z.object({
    variantId: z.number().int().positive("variantId must be a positive integer"),
    quantity: z.number().int().positive("quantity must be a positive integer").max(100),
  })).min(1, "items must be a non-empty array"),
});

const htmlResultPage = (title: string, message: string, status: "success" | "error" | "cancel") => {
  const color = status === "success" ? "#16a34a" : status === "cancel" ? "#ca8a04" : "#dc2626";

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f8fafc; color: #111827; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      section { max-width: 480px; width: 100%; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
      h1 { color: ${color}; margin: 0 0 12px; font-size: 24px; }
      p { margin: 0 0 20px; line-height: 1.6; color: #4b5563; }
      a { display: inline-block; background: #4f46e5; color: white; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="/myorders">Xem don hang</a>
      </section>
    </main>
  </body>
</html>`;
};

export const createSePayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const body = createSePayPaymentSchema.parse(req.body);
    const result = await paymentService.createSePayPayment({ userId, ...body });

    res.status(201).json({
      paymentUrl: result.paymentUrl,
      paymentFields: result.paymentFields,
      autoSubmitHtml: result.autoSubmitHtml,
      orderId: result.orderId,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Invalid payment request", errors: error.issues });
      return;
    }

    if (error.message === "ORDER_AMOUNT_MISMATCH") {
      res.status(409).json({ message: "Order amount does not match existing invoice" });
      return;
    }

    if (error.message === "VARIANT_NOT_FOUND") {
      res.status(404).json({ message: "Product variant not found" });
      return;
    }

    if (error.message === "INSUFFICIENT_STOCK") {
      res.status(409).json({ message: "Not enough stock for one or more products" });
      return;
    }

    console.error("[createSePayPayment]", error);
    res.status(500).json({ message: "Could not create SePay payment" });
  }
};

export const getSePayPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await paymentService.getPaymentStatus(String(req.params.orderId));
    res.json({ data: status });
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    console.error("[getSePayPaymentStatus]", error);
    res.status(500).json({ message: "Could not get payment status" });
  }
};

export const receiveSePayIpn = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = getSePayConfig();
    const secretHeader = req.header("X-Secret-Key") ?? req.header("x-secret-key");

    if (secretHeader !== config.secretKey) {
      console.warn("[receiveSePayIpn] invalid secret header", {
        hasSecretHeader: Boolean(secretHeader),
        invoiceNumber: req.body?.order?.order_invoice_number,
      });
      res.status(401).json({ success: false, message: "Invalid IPN secret" });
      return;
    }

    const result = await paymentService.handleSePayIpn(req.body);
    console.log("[receiveSePayIpn] processed", {
      invoiceNumber: req.body?.order?.order_invoice_number,
      notificationType: req.body?.notification_type,
      transactionStatus: req.body?.transaction?.transaction_status,
      processed: result.processed,
      reason: "reason" in result ? result.reason : undefined,
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    if (error.message === "ORDER_NOT_FOUND") {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    if (error.message === "INVOICE_NUMBER_REQUIRED") {
      res.status(400).json({ success: false, message: "Invoice number is required" });
      return;
    }

    console.error("[receiveSePayIpn]", error);
    res.status(500).json({ success: false, message: "IPN processing failed" });
  }
};

export const paymentSuccess = (req: Request, res: Response): void => {
  if (req.accepts("html")) {
    res.type("html").send(htmlResultPage("Thanh toan thanh cong", "SePay da chuyen huong ve website. Trang don hang se cap nhat sau khi IPN duoc xu ly.", "success"));
    return;
  }

  res.json({ status: "success", orderId: req.query.orderId });
};

export const paymentError = (req: Request, res: Response): void => {
  if (req.accepts("html")) {
    res.status(400).type("html").send(htmlResultPage("Thanh toan that bai", "Giao dich khong hoan tat. Vui long thu lai hoac chon phuong thuc khac.", "error"));
    return;
  }

  res.status(400).json({ status: "error", orderId: req.query.orderId });
};

export const paymentCancel = (req: Request, res: Response): void => {
  if (req.accepts("html")) {
    res.status(200).type("html").send(htmlResultPage("Da huy thanh toan", "Ban da huy giao dich tren SePay. Don hang van dang cho thanh toan.", "cancel"));
    return;
  }

  res.json({ status: "cancel", orderId: req.query.orderId });
};
