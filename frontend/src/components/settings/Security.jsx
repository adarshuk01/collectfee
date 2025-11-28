import React, { useEffect, useState } from "react";
import CommonHeader from "../common/CommonHeader";
import InputField from "../common/InputField";
import Button from "../common/Button";
import ToggleSwitch from "../common/ToggleSwitch";
import { useAuth } from "../../context/AuthContext";

function Security() {
  const { user, toggle2FA } = useAuth();

  const [twofa, setTwofa] = useState(false);

  // Sync frontend toggle state with user.is2FA
  useEffect(() => {
    if (user) {
      setTwofa(user.is2FA); 
    }
  }, [user]);

  const handleToggle = async () => {
    try {
      const updated = await toggle2FA(); // call backend
      setTwofa(updated.is2FA); // update UI
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-4">
      <CommonHeader title="Security" />

      {/* Update Password Form */}
      <form className="space-y-2">
        <InputField label={"Current Password"} />
        <InputField label={"New Password"} />
        <InputField label={"Confirm Password"} />
        <Button disabled text={"Update Password"} />
      </form>

      {/* 2FA Toggle */}
      <div className="flex justify-between items-center">
        <p className="font-bold text-lg">Two-Step Verification</p>

        {/* Trigger backend toggle when user slides switch */}
        <ToggleSwitch
          enabled={twofa}
          setEnabled={handleToggle} 
        />
      </div>
    </div>
  );
}

export default Security;
