const MemberPayment = require("../models/MemberPayment");
const MemberTransaction = require("../models/MemberTransaction");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const Member = require("../models/Member");


// ➤ Get Payments of a Member (Filters + Sort + Pagination)
exports.getMemberPayments = async (req, res) => {
    try {
        const { memberId } = req.params;

        const {
            status,
            subscriptionId,
            fromDate,
            toDate,
            minAmount,
            maxAmount,
            sortBy = "dueDate",
            sortOrder = "asc",
            page = 1,
            limit = 10
        } = req.query;

        // =========================
        // Build Filters
        // =========================
        let filters = {
            memberId,
            clientId: req.user.id
        };


if (status) {
    if (status === "totaldue") {
        // Include both 'due' and 'partial' statuses
        filters.status = { $in: ["due", "partial"] };
    } else {
        filters.status = status;
    }
}
        if (subscriptionId) filters.subscriptionId = subscriptionId;

        if (fromDate || toDate) {
            filters.dueDate = {};
            if (fromDate) filters.dueDate.$gte = new Date(fromDate);
            if (toDate) filters.dueDate.$lte = new Date(toDate);
        }

        if (minAmount || maxAmount) {
            filters.amount = {};
            if (minAmount) filters.amount.$gte = Number(minAmount);
            if (maxAmount) filters.amount.$lte = Number(maxAmount);
        }

        // =========================
        // Sorting
        // =========================
        const sortQuery = {};
        sortQuery[sortBy] = sortOrder === "desc" ? -1 : 1;

        // =========================
        // Pagination
        // =========================
        const skip = (page - 1) * limit;

        // =========================
        // Fetch Data
        // =========================
        const payments = await MemberPayment.find(filters)
        .populate("memberId")
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit));

        const total = await MemberPayment.countDocuments(filters);

        return res.json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            payments
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// ➤ Get all partial + due payments for a single member
exports.getMemberPendingPayments = async (req, res) => {
    try {
        const { memberId } = req.params;

        if (!memberId) {
            return res.status(400).json({ message: "Member ID is required" });
        }

        const clientId = req.user.id;

        // Fetch all due + partial payments
        const payments = await MemberPayment.find({
            memberId,
            clientId,
            status: { $in: ["due", "partial"] }
        }).populate('memberSubscriptionId')
            .populate({
                path: "subscriptionId",
                select: "subscriptionName admissionFee billingCycle recurringAmount customFields"
            }).populate("memberId")
            .sort({ dueDate: 1 });

        if (!payments.length) {
            return res.status(200).json({
                message: "No pending payments for this member",
                pendingPayments: [],
                totalDueAmount: 0,
                totalPending: 0
            });
        }

        // Calculate totals
        let totalDueAmount = 0;
        let totalPending = 0;

        payments.forEach((p) => {
            const due = p.amount - p.paidAmount;
            totalDueAmount += due;
            if (p.status === "partial") totalPending += due;
        });

        return res.status(200).json({
            message: "Pending payments fetched successfully",
            pendingPayments: payments,
            totalDueAmount,
            totalPending
        });
    } catch (error) {
        console.error("Error fetching pending payments:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};



exports.quickPay = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { payments, mode } = req.body;

    const payment = await MemberPayment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    let totalPaidNow = 0;

    // 🔥 Update each fee individually
    for (const pay of payments) {
      const fee = payment.feeType.find(f => f.key === pay.feeKey);
      if (!fee) continue;

      const newPaid = fee.paidAmount + pay.amount;
      if (newPaid > fee.amount) {
        return res.status(400).json({
          success: false,
          message: `Overpayment for ${fee.label}`
        });
      }

      fee.paidAmount = newPaid;

      if (newPaid === fee.amount) fee.status = "paid";
      else if (newPaid > 0) fee.status = "partial";

      totalPaidNow += pay.amount;
    }

    // 🔥 Update global paidAmount
    payment.paidAmount += totalPaidNow;

    // 🔥 Update overall status
    if (payment.paidAmount === payment.amount) {
      payment.status = "paid";
    } else if (payment.paidAmount > 0) {
      payment.status = "partial";
    }

    await payment.save();

    // Member active if any payment done
    if (payment.paidAmount > 0) {
      await Member.findByIdAndUpdate(payment.memberId, { status: "active" });
    }

   const transaction = await MemberTransaction.create({
  paymentId,
  memberId: payment.memberId,
  clientId: payment.clientId,
  paidAmount: totalPaidNow,
  mode: mode || "cash",
  memberSubscriptionId: payment.memberSubscriptionId,
  subscriptionId: payment.subscriptionId,
  feeBreakdown: payments
});

    res.json({ success: true, payment ,transaction});

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





// Currency formatter
const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;


exports.generatePremiumReceipt = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const tx = await MemberTransaction.findById(transactionId)
            .populate({
                path: "paymentId",
                populate: { path: "subscriptionId" }
            })
            .populate("memberId")
            .populate("clientId")
            .populate("memberSubscriptionId")
            .populate("subscriptionId");

        if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });

        const payment = tx.paymentId || {};
        const subscription = tx.subscriptionId || {};
        const member = tx.memberId || {};
        const client = tx.clientId || {};
        const memSub = tx.memberSubscriptionId || {};

        const doc = new PDFDocument({ margin: 50, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=receipt_${transactionId}.pdf`);

        doc.pipe(res);

        // ----------------------------------------------------
        // HEADER
        // ----------------------------------------------------
        doc.image("public/logo/fees.png", 50, 40, { width: 50 });

        doc.fontSize(20)
            .fillColor("#333")
            .text(client.companyName || "Your Business", 110, 50);

        doc.fontSize(10)
            .fillColor("#555")
            .text(client.address || "Address Line 1", 350, 40, { align: "right" })
            .text(client.cityStateZip || "City, State ZIP", { align: "right" })
            .text(`Phone: ${client.phone || "N/A"}`, { align: "right" })
            .text(`Website: ${client.website || "www.example.com"}`, { align: "right" });

        // move down + force X reset
        doc.moveDown(3);
        doc.x = 50;

        // ----------------------------------------------------
        // GREETING
        // ----------------------------------------------------
        doc.fillColor("#555")
            .fontSize(12)
            .text(
                `Dear ${member.fullName || "Customer"},\nThank you for your payment. Your subscription details are listed below.`,
                {
                    align: "left",
                    lineGap: 4
                }
            );

        doc.moveDown(1);
        doc.x = 50;

        // ----------------------------------------------------
        // SUMMARY
        // ----------------------------------------------------
        doc.fillColor("#2853AF")
            .fontSize(14)
            .text("SUMMARY");

        doc.moveDown(0.3);

        const summaryY = doc.y;

        doc.fillColor("#555").fontSize(10);
        doc.text("DATE", 50, summaryY);
        doc.text("PAYMENT MODE", 200, summaryY);
        doc.text("PAID", 350, summaryY);

        doc.fillColor("#000");
        doc.text(new Date(tx.createdAt).toLocaleDateString(), 50, summaryY + 15);
        doc.text(tx.mode?.toUpperCase() || "N/A", 200, summaryY + 15);
        doc.text(tx.paidAmount || 0, 350, summaryY + 15);

        doc.moveTo(50, summaryY + 50);
        doc.y = summaryY + 70;
        doc.x = 50;

        // ----------------------------------------------------
        // SUBSCRIPTION DETAILS TABLE
        // ----------------------------------------------------
        doc.fillColor("#2853AF")
            .fontSize(14)
            .text("SUBSCRIPTION DETAILS");

        doc.moveDown(0.5);

        const tableX = 50;
        let tableY = doc.y;

        // Header Bar
        doc.rect(tableX, tableY, 420, 20).fill("#2853AF");
        doc.fillColor("#fff").fontSize(10);

        doc.text("FIELD", tableX + 5, tableY + 5);
        doc.text("VALUE", tableX + 105, tableY + 5);
        doc.text("FIELD", tableX + 215, tableY + 5);
        doc.text("VALUE", tableX + 315, tableY + 5);

        // BODY START
        tableY += 20;

        let rows = [
            ["Subscription Name", subscription.subscriptionName, "Billing Cycle", subscription.billingCycle],
            ["Admission Fee", `₹${subscription.admissionFee}`, "Recurring Amount", `₹${subscription.recurringAmount}`],
            [
                "Start Date",
                memSub.startDate ? new Date(memSub.startDate).toLocaleDateString() : "N/A",
                "Next Renewal",
                memSub.nextRenewalDate ? new Date(memSub.nextRenewalDate).toLocaleDateString() : "N/A"
            ],
            ["Status", memSub.status || "N/A", "Paid Amount", `₹${memSub.paidAmount || 0}`],
            ["Due Amount", `₹${memSub.dueAmount || 0}`, "", ""],
        ];

        // Table height
        const rowHeight = 22;
        const tableHeight = rows.length * rowHeight + 10;

        // Draw table body
        doc.rect(tableX, tableY, 420, tableHeight).fill("#f3f3f3");

        doc.fillColor("#000").fontSize(10);

        let rY = tableY + 8;

        rows.forEach((r) => {
            doc.text(r[0], tableX + 5, rY);
            doc.text(r[1], tableX + 105, rY);
            doc.text(r[2], tableX + 215, rY);
            doc.text(r[3], tableX + 315, rY);
            rY += rowHeight;
        });

        // Move below table
        doc.y = tableY + tableHeight + 30;


        // ----------------------------------------------------
        // CUSTOM FIELDS SECTION (SEPARATE TABLE)
        // ----------------------------------------------------
        if (subscription.customFields && subscription.customFields.length > 0) {

            // FIX: Reset X so heading starts from the left
            doc.x = 50;

            doc.fillColor("#2853AF")
                .fontSize(14)
                .text("CUSTOM FIELDS");


            doc.moveDown(0.5);

            let cfX = 50;
            let cfY = doc.y;

            // Header Row
            doc.rect(cfX, cfY, 420, 20).fill("#2853AF");

            doc.fillColor("#fff").fontSize(10);
            doc.text("FIELD", cfX + 5, cfY + 5);
            doc.text("VALUE", cfX + 160, cfY + 5);
            doc.text("RECURRING", cfX + 315, cfY + 5);

            // Body start
            cfY += 20;

            const cfRowHeight = 22;
            const cfTableHeight = subscription.customFields.length * cfRowHeight + 10;

            doc.rect(cfX, cfY, 420, cfTableHeight).fill("#f3f3f3");
            doc.fillColor("#000").fontSize(10);

            let cY = cfY + 8;

            subscription.customFields.forEach((cf) => {
                doc.text(cf.label, cfX + 5, cY);
                doc.text(cf.value !== undefined ? `₹${cf.value}` : "N/A", cfX + 160, cY);
                doc.text(cf.isRecurring ? "Yes" : "No", cfX + 315, cY);
                cY += cfRowHeight;
            });

            doc.y = cfY + cfTableHeight + 30;
        }


        doc.end();

    } catch (err) {
        console.error("PDF Generation Error:", err);
        res.status(500).json({ success: false, message: "PDF creation failed", error: err.message });
    }
};


const path = require("path");
const fs = require("fs");
const ReceiptSettings = require("../models/ReceiptSettings");


exports.generateReceiptPDF = async (req, res) => {
  try {
    const { transactionId } = req.params;

      // Fetch user receipt settings
    const settings = await ReceiptSettings.findOne({clientId: req.user.id}) || {
      businessName: "My Institute",
      address: "Your Address",
      phone: "",
      email: "",
      logoUrl: "",
      themeColor: "#0B57D0",
      textColor: "#000000",
      footerMessage: "Thank you for your payment!"
    };

    const tx = await MemberTransaction.findById(transactionId)
      .populate({
        path: "paymentId",
        select: "amount paidAmount feeType subscriptionId memberSubscriptionId",
        populate: { path: "subscriptionId" },
      })
      .populate("memberId");

    if (!tx) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    } 
    console.log("my data",tx.paymentId);
    

    // === Calculations ===
    const feeTypes = tx.paymentId.feeType || [];
    const totalAmount = feeTypes.reduce((acc, f) => acc + f.amount, 0);
    const paidNow = tx.paidAmount;
    const alreadyPaid = tx.paymentId.paidAmount - paidNow;
    const remainingAmount = totalAmount - (alreadyPaid + paidNow);

    // === PDF SETUP ===
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=receipt_${transactionId}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // === FONTS ===
    doc.registerFont("Roboto", path.join(__dirname, "../fonts/Roboto-Regular.ttf"));
    doc.registerFont("Roboto-Bold", path.join(__dirname, "../fonts/Roboto-Bold.ttf"));

   // === LOGO HANDLING (Cloudinary / URL support) ===
if (settings.logoUrl) {
  try {
    const axios = require("axios");

    const imgResponse = await axios.get(settings.logoUrl, {
      responseType: "arraybuffer",
    });

    const imgBuffer = Buffer.from(imgResponse.data, "binary");

    doc.image(imgBuffer, 40, 30, { width: 60 });

  } catch (err) {
    console.log("Logo load failed:", err.message);
    // Fallback: continue PDF without crashing
  }
}

    doc.font("Roboto-Bold").fontSize(20).fillColor("#0B57D0").text(`${settings?.businessName}`, 110, 35);
    doc.font("Roboto").fontSize(10).fillColor("#000")
      .text(`Address: ${settings.address}`, 110, 60)
      .text(`Phone: ${settings.phone}`, 110, 75)
      .text(`Email: ${settings.email}`, 110, 90);

    // Header underline
     doc.moveDown(1.5);
    

    // === RECEIPT TITLE ===
    doc.font("Roboto-Bold").fontSize(18).fillColor("#0B57D0").text("PAYMENT RECEIPT", {
      align: "center",
    });

    doc.fillColor("#000");

    doc.font("Roboto").fontSize(12)
      .text(`Receipt No: ${tx._id}`, { align: "center" })
      .text(`Date: ${new Date(tx.createdAt).toLocaleDateString()}`, { align: "center" });

    doc.moveDown(1.5);

    // === STUDENT DETAILS BOX ===
    // doc.rect(40, doc.y, 510, 110).stroke("#ccc");
    let yStart = doc.y + 10;

    doc.font("Roboto-Bold").fontSize(12).text("Student Information", 50, yStart);
    yStart += 20;

    doc.font("Roboto").fontSize(11);
    doc.text(`Name: ${tx.memberId.fullName}`, 50, yStart); yStart += 18;
    doc.text(`Email: ${tx.memberId.email}`, 50, yStart); yStart += 18;
    doc.text(`Contact: ${tx.memberId.contactNumber}`, 50, yStart); yStart += 18;
    doc.text(`Subscription: ${tx.paymentId.subscriptionId?.subscriptionName || "N/A"}`, 50, yStart);

    doc.moveDown(4);

    // === TABLE HEADER ===
    const tableTop = doc.y;
    doc.font("Roboto-Bold").fontSize(12);

    doc.rect(40, tableTop, 510, 25).fill("#0B57D0");
    doc.fillColor("#fff")
      .text("Date", 50, tableTop + 7)
      .text("Fee Type", 150, tableTop + 7)
      .text("Amount", 250, tableTop + 7)
      .text("Paid", 320, tableTop + 7)
      .text("Remaining", 400, tableTop + 7)
      .text("Type", 500, tableTop + 7);

    doc.fillColor("#000");

    // === TABLE ROWS ===
    let y = tableTop + 30;

    feeTypes.forEach((f) => {
      doc.rect(40, y, 510, 25).stroke("#ddd");

      doc.font("Roboto").fontSize(11)
        .text(new Date(tx.createdAt).toLocaleDateString(), 50, y + 7)
        .text(f.label, 150, y + 7)
        .text(`₹${f.amount}`, 250, y + 7)
        .text(`₹${f.paidAmount}`, 320, y + 7)
        .text(`₹${f.amount-f.paidAmount}`, 400, y + 7)
        .text(f.isRecurring ? "Recurring" : "One-Time", 500, y + 7);

      y += 25;
    });

    y += 10;
    // FIX: Reset X so heading starts from the left
            doc.x = 50;

    // === TOTALS BOX ===
    // doc.rect(300, y, 250, 100).stroke("#aaa");

    let tY = y + 10;

    doc.font("Roboto-Bold").text("Total Amount:", 310, tY);
    doc.font("Roboto").text(`₹${totalAmount}`, 450, tY); tY += 20;

    doc.font("Roboto-Bold").text("Paid Previously:", 310, tY);
    doc.font("Roboto").text(`₹${alreadyPaid}`, 450, tY); tY += 20;

    doc.font("Roboto-Bold").text("Paid Now:", 310, tY);
    doc.font("Roboto").text(`₹${paidNow}`, 450, tY); tY += 20;

    doc.font("Roboto-Bold").text("Remaining Amount:", 310, tY);
    doc.font("Roboto").text(`₹${remainingAmount < 0 ? 0 : remainingAmount}`, 450, tY);

    doc.moveDown(3);
    // FIX: Reset X so heading starts from the left
            doc.x = 50;

    // === SUCCESS MESSAGE ===
    doc.font("Roboto-Bold").fontSize(16).fillColor("green")
      .text("PAYMENT SUCCESSFUL", { align: "center" });

    doc.fillColor("#000").moveDown(0.5);

    // === FOOTER ===
    doc.font("Roboto").fontSize(11)
      .text("Thank you for your payment!", { align: "center" })
      .text("For any support, please contact support@collectfee.com", { align: "center" });

    doc.moveDown(1);
    doc.fontSize(10).text("This is a system-generated receipt and does not require a signature.", {
      align: "center",
      opacity: 0.6,
    });

    doc.end();

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ success: false, message: "PDF creation failed" });
  }
};


