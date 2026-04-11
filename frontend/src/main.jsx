import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";

import './index.css';
import HomePage from './landing_page/Home/Homepage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <HomePage />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(15, 23, 42, 0.85)",
            color: "#cbd5e1",
            border: "1px solid rgba(100, 116, 139, 0.25)",
            backdropFilter: "blur(12px)",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "13px",
          },
          success: {
            style: {
              background: "rgba(15, 23, 42, 0.85)",
              color: "#cbd5e1",
              border: "1px solid rgba(100, 116, 139, 0.25)",
            },
            iconTheme: {
              primary: "#FFE082",
              secondary: "#0a0e17",
            },
          },
          error: {
            style: {
              background: "rgba(15, 23, 42, 0.85)",
              color: "#f87171",
              border: "1px solid rgba(100, 116, 139, 0.25)",
            },
            iconTheme: {
              primary: "#f87171",
              secondary: "#0a0e17",
            },
          },
        }}
      />

      <SonnerToaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(100, 116, 139, 0.25)",
            backdropFilter: "blur(12px)",
            color: "#cbd5e1",
            fontSize: "13px",
            borderRadius: "12px",
            padding: "10px 14px",
          },
        }}
      />

    </BrowserRouter>
  </StrictMode>
);