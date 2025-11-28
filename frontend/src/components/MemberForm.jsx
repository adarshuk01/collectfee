import React, { useEffect, useState } from "react";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
import { useParams, useNavigate } from "react-router-dom";
import { useMembers } from "../context/MemberContext";
import { useSubscription } from "../context/SubscriptionContext";
import CommonHeader from "./common/CommonHeader";

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { createMember, updateMember, fetchMemberById, singleMember } = useMembers();
  const { subscriptions } = useSubscription();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    fullName: "",
    contactNumber: "",
    email: "",
    address: "",
    startDate: "",
    subscriptionId: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) fetchMemberById(id);
  }, [isEdit, id]);

  useEffect(() => {
    if (singleMember && isEdit) {
      setForm({
        fullName: singleMember.fullName || "",
        contactNumber: singleMember.contactNumber || "",
        email: singleMember.email || "",
        address: singleMember.address || "",
        startDate: singleMember.startDate?.split("T")[0] || "",
        subscriptionId: singleMember.subscriptionId || "",
      });
    }
  }, [singleMember, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Clear error when typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ---------------------------
  // 🚨 Validation function
  // ---------------------------
  const validateForm = () => {
    let err = {};

    if (!form.fullName.trim()) err.fullName = "Full name is required";
    if (!form.contactNumber.trim()) err.contactNumber = "Contact number is required";
    if (!form.email.trim()) err.email = "Email is required";
    if (!form.address.trim()) err.address = "Address is required";
    if (!form.startDate) err.startDate = "Start date is required";
    if (!form.subscriptionId) err.subscriptionId = "Please select a subscription";

    setErrors(err);

    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return; // ❌ Stop submission if errors exist

    setLoading(true);

    try {
      if (isEdit) await updateMember(id, form);
      else await createMember(form);

      navigate("/members");
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto rounded-xl">
      <CommonHeader title={isEdit ? "Edit Member" : "Add Member"} />

      <form onSubmit={handleSubmit} className="space-y-4">

        <InputField
          label="Full Name"
          placeholder="Enter full name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <InputField
          label="Contact Number"
          placeholder="Enter contact number"
          name="contactNumber"
          value={form.contactNumber}
          onChange={handleChange}
          error={errors.contactNumber}
        />

        <InputField
          label="Email"
          placeholder="Enter email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <InputField
          label="Address"
          placeholder="Enter address"
          name="address"
          value={form.address}
          onChange={handleChange}
          error={errors.address}
        />

        <InputField
          label="Start Date"
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          error={errors.startDate}
        />

        <div>
          <label className="text-sm font-medium">Subscription</label>
          <select
            name="subscriptionId"
            value={form.subscriptionId}
            onChange={handleChange}
            className="w-full border border-gray-300 focus:outline-none rounded px-3 py-2"
          >
            <option value="">Select Subscription</option>
            {subscriptions.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.subscriptionName}
              </option>
            ))}
          </select>

          {errors.subscriptionId && (
            <p className="text-red-500 text-sm mt-1">{errors.subscriptionId}</p>
          )}
        </div>

        <Button
          disabled={loading}
          text={isEdit ? "Update Member" : "Create Member"}
          variant="primary"
          size="lg"
          className="w-full"
        />
      </form>
    </div>
  );
};

export default MemberForm;
