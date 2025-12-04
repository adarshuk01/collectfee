import React, { useState } from "react";
import CommonHeader from "../common/CommonHeader";
import { useBatch } from "../../context/BatchContext";
import InputField from "../common/InputField";
import Button from "../common/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function GroupForm() {
  const { createBatch } = useBatch();

  const [name, setName] = useState("");
  const navigate =useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a group name");
      return;
    }

    try {
      await createBatch({ name });
      toast.success("Group Created Successfully!");
      navigate('/groups')
      setName("");
    } catch (error) {
      console.error(error);
      toast.error("Error creating group");
    }
  };

  return (
    <div>
      <CommonHeader title="Create Group" />
      <form onSubmit={handleSubmit}>
        <InputField
          label="Group Name"
          placeholder="Enter group/batch name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button className="mt-4" text="Create Group" type="submit"  size="md"/>
      </form>
    </div>
  );
}

export default GroupForm;
