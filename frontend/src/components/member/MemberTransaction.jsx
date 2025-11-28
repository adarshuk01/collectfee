import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CommonHeader from "../common/CommonHeader";
import axiosInstance from "../../api/axiosInstance";
import { FaAmazonPay, FaCreditCard } from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import toast from "react-hot-toast";
import SkeletonTransaction from "../skeletonloading/SkeletonTransaction";

function MemberTransaction() {
  const { memberId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {

  try {
    const res = await axiosInstance.get(
      `/transaction/member/${memberId}/transactions`
    );
    setTransactions(res.data.transactions);

   
  } catch (error) {
    console.error("Error fetching transactions:", error);
    toast.error("Failed to load transactions!");
  } finally {
    setLoading(false);
  }
};


 useEffect(() => {
  let ignore = false;

  const load = async () => {
    if (!ignore) {
      fetchTransactions();
    }
  };

  load();

  return () => { ignore = true };
}, [memberId]);


  // Mode-based color
  const getIconColor = (mode) => {
    switch (mode?.toLowerCase()) {
      case "cash":
        return "bg-orange-100 text-orange-600";
      case "upi":
        return "bg-purple-100 text-purple-600";
      case "card":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Mode-based icon
  const getModeIcon = (mode) => {
    switch (mode?.toLowerCase()) {
      case "cash":
                return <GiMoneyStack />;

      case "upi":
                return <FaAmazonPay />;

      case "card":
        return <FaCreditCard />;
      default:
        return <FaAmazonPay />;
    }
  };

  return (
    <div className="">
      <CommonHeader title={"Transaction History"} />

      {loading ? (
         <div className="space-y-3 ">
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonTransaction key={i} />
    ))}
  </div>
      ) : transactions.length === 0 ? (
        <p className="p-4 text-gray-600">No transactions found.</p>
      ) : (
        <div className="space-y-3">

          {transactions.map((tx) => {
            const isCredit = tx.paidAmount > 0;

            return (
              <Link
                to={`/receipt/${tx?._id}`}
                key={tx._id}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full 
                    ${getIconColor(tx.mode)}`}
                  >
                    <span className="text-lg font-bold">
                      {getModeIcon(tx.mode)}
                    </span>
                  </div>

                  <div>
                    <p className="font-medium capitalize">
                      {tx?.mode || "Mode"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p
                  className={`font-semibold ${
                    isCredit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCredit ? "+" : "-"}₹{tx.paidAmount}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MemberTransaction;
