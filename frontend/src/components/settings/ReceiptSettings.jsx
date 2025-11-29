import React, { useEffect, useState } from "react";
import InputField from "../common/InputField";
import Button from "../common/Button";
import CommonHeader from "../common/CommonHeader";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

function ReceiptSettings() {
  const [settings, setSettings] = useState({
    businessName: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
    themeColor: "",
    textColor: "",
    footerMessage: "",
  });

  const [logoFile, setLogoFile] = useState(null);

  // Load existing settings
  const fetchSettings = async () => {
    try {
      const res = await axiosInstance.get("settings/receipt-settings");
      setSettings(res.data.settings);
    } catch (err) {
      toast.error("Failed to load settings");
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  // Handle Save
 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    toast.loading("Updating...");

    const formData = new FormData();

    // Append all text fields
    Object.keys(settings).forEach((key) => {
      if (key !== "logoUrl") {
        formData.append(key, settings[key]);
      }
    });

    // If new logo selected
    if (logoFile) {
      formData.append("logo", logoFile);
    }

    // Send everything in ONE API request
    await axiosInstance.put("settings/receipt-settings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.dismiss();
    toast.success("Updated successfully!");
    fetchSettings();

  } catch (error) {
    console.log(error);
    toast.dismiss();
    toast.error("Update failed");
  }
};


  return (
    <div>
      <CommonHeader title="Receipt Settings" />

      <form className="space-y-4" onSubmit={handleSubmit}>
        
        {/* ---- Logo Upload ---- */}
        <div>
          <label className="font-medium text-sm">Company Logo</label>
          <input
            type="file"
            onChange={(e) => setLogoFile(e.target.files[0])}
            className="block mt-1"
          />

          {settings.logoUrl && (
            <img
              src={settings.logoUrl}
              alt="Logo Preview"
              className="w-24 h-24 mt-2 border rounded"
            />
          )}
        </div>

        <InputField
          label={"Business Name"}
          name="businessName"
          type="text"
          placeholder={"Enter your company name"}
          value={settings.businessName}
          onChange={handleChange}
        />

        <InputField
          label={"Company Email"}
          name="email"
          type="email"
          placeholder={"Enter email address"}
          value={settings.email}
          onChange={handleChange}
        />

        <InputField
          label={"Phone"}
          name="phone"
          type="text"
          placeholder={"Enter phone number"}
          value={settings.phone}
          onChange={handleChange}
        />

        <InputField
          label={"Address"}
          name="address"
          type="text"
          placeholder={"Enter address"}
          value={settings.address}
          onChange={handleChange}
        />

        
        {/* Footer */}
        <InputField
          label={"Footer Message"}
          name="footerMessage"
          type="text"
          placeholder="Thank you for your payment!"
          value={settings.footerMessage}
          onChange={handleChange}
        />

        <Button className="w-full" text={"Update Receipt"} />
      </form>
    </div>
  );
}

export default ReceiptSettings;
