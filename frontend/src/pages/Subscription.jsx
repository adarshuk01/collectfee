import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";
import Button from "../components/common/Button";
import { Pencil, Trash2 } from "lucide-react";

function Subscription() {
  const navigate = useNavigate();
  const { subscriptions, deleteSubscription, fetchSubscriptions } = useSubscription();
  useEffect(() => {
    fetchSubscriptions()
  }, [])

  return (
    <div className="">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Subscription Packages</h2>
        <Button
          text="Add Subscription"
          className="w-fit"
          variant="primary"
          size="md"
          onClick={() => navigate("/subscription/add")}
        />
      </div>

      {/* List of subscription cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.length > 0 ? (
          subscriptions.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white p-4 rounded-lg shadow border border-gray-300 hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold capitalize">{pkg.subscriptionName}</h3>
              <p className="text-sm text-gray-600 mt-1">
                Admission Fee: ₹{pkg.admissionFee}
              </p>
              <p className="text-sm text-gray-600">
                Billing Cycle: {pkg.billingCycle}
              </p>
              {
                pkg?.customFields?.map(items => (
                  <div>
                    <p className="text-sm text-gray-600">
                      {items.label}: {items.value}
                    </p>
                  </div>
                ))
              }
              <p className="text-sm text-gray-600">
                Recurring Amount :{pkg.recurringAmount}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  className="text-blue-600 flex items-center gap-1"
                  onClick={() => navigate(`/subscription/edit/${pkg._id}`)}
                >
                  <Pencil size={16} /> Edit
                </button>

                <button
                  className="text-red-600 flex items-center gap-1"
                  onClick={() => deleteSubscription(pkg._id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col justify-center items-center ">
            <img
              src="/nosub.png"
              alt="No Subscriptions"
              className=" opacity-50 mx-auto"
            />
            <p className="text-gray-500 mt-3 text-center">
              No subscriptions found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Subscription;
