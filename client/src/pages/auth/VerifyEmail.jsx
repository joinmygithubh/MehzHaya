import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

import AuthShell from "../../components/auth/AuthShell";
import SEO from "../../components/common/SEO";
import Loader from "../../components/common/Loader";
import api from "../../api/axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (mounted) {
          setStatus("success");
          setMessage(res.data.message);
        }
      } catch (err) {
        if (mounted) {
          setStatus("error");
          setMessage(err.message);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <AuthShell title="Email Verification">
      <SEO title="Verify Email" />
      <div className="py-6 text-center">
        {status === "loading" && <Loader />}
        {status === "success" && (
          <>
            <FiCheckCircle className="mx-auto text-6xl text-green-500" />
            <p className="mt-4 text-lg font-medium text-emerald-900 dark:text-gold">
              {message}
            </p>
            <Link to="/" className="btn-primary mt-6">
              Start Shopping
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <FiXCircle className="mx-auto text-6xl text-red-500" />
            <p className="mt-4 text-lg font-medium text-red-600">{message}</p>
            <Link to="/login" className="btn-outline mt-6">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
};

export default VerifyEmail;
