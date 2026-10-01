// app/components/ToastProvider.tsx
"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return <ToastContainer position="top-right" limit={5} autoClose={2000}/>;
}