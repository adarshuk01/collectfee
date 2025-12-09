import React, { useEffect } from "react";
import Button from "../components/common/Button";
import { useNavigate, Link } from "react-router-dom"; // ✅ Correct Link import
import { useBatch } from "../context/BatchContext";

function Groups() {
  const navigate = useNavigate();
  const { batches ,fetchBatches} = useBatch();

  useEffect(()=>{
fetchBatches()
  },[])

  console.log(batches);

  return (
    <div>
      <div className="flex justify-between flex-wrap items-center mb-6">
        <h2 className="text-xl font-semibold">Groups</h2>

        <Button
          text="Create Groups"
          className="w-fit"
          variant="primary"
          size="md"
          onClick={() => navigate("/groups/add")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <Link
            key={batch._id}
            to={`/groups/${batch._id}`}
            className="shadow-md p-4 rounded-lg hover:shadow-lg transition border border-gray-300"
          >
            <h3 className="text-lg capitalize">{batch.name}</h3>
            <hr className="my-2 border border-gray-200" />

            {/* If your API includes memberCount */}
            <p className="text-sm text-primary underline underline-offset-2">
              {batch.memberCount ?? "0"} members
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Groups;
