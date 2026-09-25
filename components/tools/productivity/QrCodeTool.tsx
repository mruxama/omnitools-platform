"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Download, QrCode as QrIcon, Wifi, Globe, AlignLeft } from "lucide-react";

export function QrCodeTool() {
  const [type, setType] = useState<"url" | "text" | "wifi">("url");
  const [url, setUrl] = useState("https://omnitools.app");
  const [plainText, setPlainText] = useState("Hello from OmniTools!");
  const [ssid, setSsid] = useState("MyHomeWiFi");
  const [password, setPassword] = useState("SecretPassword123");
  const [encryption, setEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const getPayload = () => {
    if (type === "url") return url || "https://";
    if (type === "text") return plainText || " ";
    if (type === "wifi") {
      return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
    }
    return "";
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload.trim()) return;

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: "H",
    })
      .then((data) => setQrDataUrl(data))
      .catch((err) => console.error("QR generation error:", err));
  }, [type, url, plainText, ssid, password, encryption, fgColor, bgColor]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6 bg-card border border-border rounded-2xl shadow-sm">
      {/* Type Switcher */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setType("url")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
            type === "url"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> URL Link
        </button>
        <button
          onClick={() => setType("text")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
            type === "text"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" /> Plain Text
        </button>
        <button
          onClick={() => setType("wifi")}
          className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
            type === "wifi"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wifi className="w-3.5 h-3.5" /> WiFi Access
        </button>
      </div>

      {/* Input Configuration */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        {type === "url" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Website URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {type === "text" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Message / Text</label>
            <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="Type any message..."
              rows={3}
              className="w-full p-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {type === "wifi" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Network Name (SSID)</label>
              <input
                type="text"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Color controls */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => setFgColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-border"
            />
            <span className="text-xs font-medium text-foreground">QR Color</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-border"
            />
            <span className="text-xs font-medium text-foreground">Background Color</span>
          </div>
        </div>
      </div>

      {/* QR Preview & Download */}
      {qrDataUrl && (
        <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-border/80">
            <img src={qrDataUrl} alt="Generated QR code" className="w-52 h-52 object-contain" />
          </div>

          <button
            onClick={handleDownloadPng}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download High-Res PNG
          </button>
        </div>
      )}
    </div>
  );
}
