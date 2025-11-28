import React, { useEffect, useState } from "react";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { useParams, useNavigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";
import CommonHeader from "./common/CommonHeader";

const SubscriptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptions, createSubscription, updateSubscription } = useSubscription();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    subscriptionName: "",
    admissionFee: "",
    billingCycle: "",
    customFields: [],
  });

  const [authLoading, setAuthLoading] = useState(false);

  // Load existing data when editing
  useEffect(() => {
    if (isEdit && subscriptions.length > 0) {
      const existing = subscriptions.find((item) => item._id === id);
      if (existing) setForm(existing);
    }
  }, [isEdit, id, subscriptions]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCustomChange = (index, key, value) => {
    const updated = [...form.customFields];
    updated[index][key] = value;
    setForm({ ...form, customFields: updated });
  };

  const addCustomField = () => {
    setForm({
      ...form,
      customFields: [
        ...form.customFields,
        { label: "", value: "", isRecurring: false },
      ],
    });
  };

  const removeCustomField = (index) => {
    const updated = form.customFields.filter((_, i) => i !== index);
    setForm({ ...form, customFields: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    if (isEdit) {
      await updateSubscription(id, form);
    } else {
      await createSubscription(form);
    }

    navigate("/subscription");
  };

  return (
    <div className="mx-auto rounded-xl">
     
      <CommonHeader title={`${isEdit ? "Edit Subscription" : "Add Subscription"}`} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        <InputField
          label="Subscription Name"
          placeholder="Enter subscription name"
          name="subscriptionName"
          value={form.subscriptionName}
          onChange={handleChange}
        />

        <InputField
          label="Admission Fee"
          type="number"
          placeholder="Enter admission fee"
          name="admissionFee"
          value={form.admissionFee}
          onChange={handleChange}
        />

        {/* Billing Cycle */}
        <div>
          <label className="text-sm font-medium">Billing Cycle</label>
          <select
            name="billingCycle"
            value={form.billingCycle}
            onChange={handleChange}
            className="w-full border border-gray-300 focus:outline-none rounded px-3 py-2"
          >
            <option value="">Select Billing Cycle</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Custom Fields */}
        <div>
          <h3 className="font-medium text-lg mb-2">Custom Fields</h3>

          {form.customFields.map((field, index) => (
            <div key={index} className="rounded mb-3 space-y-2 ">
              <InputField
                label="Field Name"
                placeholder="e.g. Trainer Fee"
                value={field.label}
                onChange={(e) => handleCustomChange(index, "label", e.target.value)}
              />

              <InputField
                label="Value"
                placeholder="e.g. 500"
                value={field.value}
                onChange={(e) => handleCustomChange(index, "value", e.target.value)}
              />

              {/* Recurring Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.isRecurring || false}
                  onChange={(e) =>
                    handleCustomChange(index, "isRecurring", e.target.checked)
                  }
                />
                <label className="text-sm">Is Recurring?</label>
              </div>

              <button
                type="button"
                className="text-red-600 text-sm underline"
                onClick={() => removeCustomField(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="text-blue-600 text-sm underline"
            onClick={addCustomField}
          >
            + Add Custom Field
          </button>
        </div>

        <Button
          disabled={authLoading}
          text={isEdit ? "Update Subscription" : "Create Subscription"}
          variant="primary"
          size="lg"
          className="w-full"
        />
      </form>
    </div>
  );
};

export default SubscriptionForm;
