const MemberPayment = require("../models/MemberPayment");
const MemberTransaction = require("../models/MemberTransaction");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

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
            })
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
        const { amountPaid, mode } = req.body;

        if (!amountPaid || amountPaid <= 0) {
            return res.status(400).json({
                success: false,
                message: "Paid amount must be greater than zero"
            });
        }

        // 1️⃣ Fetch payment entry
        const payment = await MemberPayment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found"
            });
        }

        // 2️⃣ Calculate new total paid amount
        const newTotalPaid = payment.paidAmount + amountPaid;

        // Prevent overpayment
        if (newTotalPaid > payment.amount) {
            return res.status(400).json({
                success: false,
                message: "Amount exceeds the due amount"
            });
        }

        // 3️⃣ Set updated status
        let newStatus = "partial";
        if (newTotalPaid === payment.amount) {
            newStatus = "paid";
        } else if (newTotalPaid === 0) {
            newStatus = "due";
        }

        // 4️⃣ Update payment record
        payment.paidAmount = newTotalPaid;
        payment.status = newStatus;
        await payment.save();

        // 5️⃣ Save transaction history
        const transaction = await MemberTransaction.create({
            paymentId,
            memberId: payment.memberId,
            clientId: payment.clientId,
            paidAmount: amountPaid,
            mode: mode || "cash",
            memberSubscriptionId: payment.memberSubscriptionId,
            subscriptionId: payment.subscriptionId
        });

        return res.status(200).json({
            success: true,
            message: "Payment updated successfully",
            payment,
            transaction
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
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


exports.generateReceiptPDF = async (req, res) => {
  try {
    const { transactionId } = req.params;

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

    // --- CALCULATIONS ---
    const feeTypes = tx.paymentId.feeType || [];
    const totalAmount = feeTypes.reduce((acc, f) => acc + f.value, 0);
    const paidNow = tx.paidAmount;
    const alreadyPaid = tx.paymentId.paidAmount - paidNow;
    const remainingAmount = totalAmount - (alreadyPaid + paidNow);

    // --- PDF INIT ---
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=receipt_${transactionId}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // --- REGISTER ROBOTO FONT ---
    doc.registerFont("Roboto", path.join(__dirname, "../fonts/Roboto-Regular.ttf"));
    doc.registerFont("Roboto-Bold", path.join(__dirname, "../fonts/Roboto-Bold.ttf"));

    // --- HEADER BAR ---
    doc.rect(0, 0, doc.page.width, 60).fill("#0B57D0");
    doc.fillColor("#fff").font("Roboto-Bold").fontSize(18).text("Payment Receipt", 40, 20);
    doc.fillColor("#000").moveDown(2);

    // --- TITLE ---
    doc.font("Roboto-Bold").fontSize(18).text("Student Payment Receipt", { align: "center" });
    doc.moveDown(0.5);

    doc.font("Roboto").fontSize(12)
      .text(`Receipt No: ${tx._id}`, { align: "center" })
      .text(`Date: ${new Date(tx.createdAt).toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1.5);

    // --- STUDENT INFO ---
    doc.fontSize(12);
    doc.font("Roboto-Bold").text(`Student Name: `, { continued: true }).font("Roboto").text(tx.memberId.fullName).moveDown(0.5);
    doc.font("Roboto-Bold").text(`Student Email: `, { continued: true }).font("Roboto").text(tx.memberId.email).moveDown(0.5);
    doc.font("Roboto-Bold").text(`Contact: `, { continued: true }).font("Roboto").text(tx.memberId.contactNumber).moveDown(0.5);
    doc.font("Roboto-Bold").text(`Subscription: `, { continued: true }).font("Roboto").text(tx.paymentId.subscriptionId?.subscriptionName || "N/A").moveDown(1);

    // --- TABLE HEADER ---
    const tableTop = doc.y + 10;
    doc.font("Roboto-Bold").fontSize(12);
    doc.text("Date", 40, tableTop);
    doc.text("Description", 150, tableTop);
    doc.text("Amount", 350, tableTop);
    doc.text("Type", 450, tableTop);
    doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke('');

    // --- TABLE ROWS ---
    let y = tableTop + 30;
    doc.font("Roboto");
    feeTypes.forEach((f) => {
      doc.text(new Date(tx.createdAt).toLocaleDateString(), 40, y);
      doc.text(f.label, 150, y);
      doc.text(`₹${f.value}`, 350, y);
      doc.text(f.isRecurring ? "Recurring" : "One-Time", 450, y);
      y += 20;
    });

    doc.moveTo(40, y + 5).lineTo(550, y + 5).stroke();
    y += 25;

    // --- TOTALS SECTION ---
    doc.font("Roboto-Bold");
    doc.text("Total Amount:", 300, y);
    doc.font("Roboto").text(`₹${totalAmount}`, 450, y);
    y += 20;

    doc.font("Roboto-Bold").text("Paid Previously:", 300, y);
    doc.font("Roboto").text(`₹${alreadyPaid}`, 450, y);
    y += 20;

    doc.font("Roboto-Bold").text("Paid Now:", 300, y);
    doc.font("Roboto").text(`₹${paidNow}`, 450, y);
    y += 20;

    doc.font("Roboto-Bold").text("Remaining Amount:", 300, y);
    doc.font("Roboto").text(`₹${remainingAmount < 0 ? 0 : remainingAmount}`, 450, y);
    doc.moveDown(2);

    // FIX: Reset X so heading starts from the left 
    doc.x = 50;

    // --- SUCCESS MESSAGE ---
    doc.font("Roboto-Bold").fontSize(14).fillColor("green").text("PAYMENT SUCCESSFUL", { align: "center" });
    doc.fillColor("#000").moveDown(2);

    // --- FOOTER ---
    doc.font("Roboto").fontSize(12)
      .text("Thank you for your payment. If you have any questions, please contact us.", { align: "center" })
      .moveDown(1)
      .text("We appreciate your prompt payment and look forward to supporting your academic journey!", { align: "center" });

    doc.end();

  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ success: false, message: "PDF creation failed" });
  }
};


