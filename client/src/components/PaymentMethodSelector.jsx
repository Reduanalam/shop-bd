import { BKASH_NAGAD_NUMBER } from "../utils/constants.js";

const METHODS = [
  { id: "cod", label: "Cash on Delivery", sub: "Pay when you receive the product" },
  { id: "bkash", label: "bKash", sub: "Send money manually, then confirm below" },
  { id: "nagad", label: "Nagad", sub: "Send money manually, then confirm below" },
];

export default function PaymentMethodSelector({ paymentMethod, setPaymentMethod, manualPayment, setManualPayment }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Payment Method</label>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setPaymentMethod(m.id)}
            className={`border rounded-lg px-3 py-3 text-sm font-medium text-left ${
              paymentMethod === m.id ? "border-primary-600 bg-primary-50 text-primary-700" : ""
            }`}
          >
            {m.label}
            <span className="block text-xs font-normal text-gray-500 mt-0.5">{m.sub}</span>
          </button>
        ))}
      </div>

      {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
        <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
          <p className="text-sm">
            এই <span className="font-semibold capitalize">{paymentMethod}</span> নাম্বারে{" "}
            <span className="font-semibold">Send Money</span> করুন:
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-600 tracking-wide">{BKASH_NAGAD_NUMBER}</span>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(BKASH_NAGAD_NUMBER)}
              className="text-xs border rounded px-2 py-1"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-500">
            টাকা পাঠানোর পর নিচে আপনার নাম্বার আর Transaction ID টা দিন — admin verify করার পর order confirm হবে।
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="যে নাম্বার থেকে পাঠিয়েছেন"
              className="border rounded-lg px-3 py-2 text-sm"
              value={manualPayment.senderNumber}
              onChange={(e) => setManualPayment({ ...manualPayment, senderNumber: e.target.value })}
            />
            <input
              required
              placeholder="Transaction ID"
              className="border rounded-lg px-3 py-2 text-sm"
              value={manualPayment.transactionId}
              onChange={(e) => setManualPayment({ ...manualPayment, transactionId: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
