import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import authFetch from "../../lib/authFetch";

function Field({
  label,
  required,
  children,
}: Readonly<{ label: string; required?: boolean; children: React.ReactNode }>) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-['Poppins',system-ui,sans-serif] font-bold text-[14px] tracking-[0.03em] text-[#1E1E1E]">
        {label}
        {required && <span className="text-[#F47624] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputTailwind =
  "w-full bg-[#F7F7F7] rounded-[10px] border-none px-5 py-3 font-['Poppins',system-ui,sans-serif] text-[15px] outline-none text-[#1E1E1E] placeholder:text-[#1E1E1E]/40 focus:ring-2 focus:ring-[#F47624] transition-all";

export default function TemplateUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fontSize, setFontSize] = useState("");
  const [fontColor, setFontColor] = useState("#161616");
  const [nameXPos, setNameXPos] = useState("");
  const [nameYPos, setNameYPos] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateFor, setTemplateFor] = useState("");
  const [eventName, setEventName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const resetForm = () => {
    setFile(null);
    setFontSize("");
    setFontColor("#161616");
    setNameXPos("");
    setNameYPos("");
    setTemplateName("");
    setTemplateFor("");
    setEventName("");
    setIssuerName("");
    setNotes("");
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!file || !fontSize || !fontColor || !nameXPos || !nameYPos) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("template", file);
    formData.append("font_size", fontSize);
    formData.append("font_color", fontColor);
    formData.append("name_x_pos", nameXPos);
    formData.append("name_y_pos", nameYPos);
    if (templateName) formData.append("template_name", templateName);
    if (templateFor) formData.append("template_for", templateFor);
    if (eventName) formData.append("event_name", eventName);
    if (issuerName) formData.append("issuer_name", issuerName);
    if (notes) formData.append("notes", notes);

    try {
      setSubmitting(true);
      const response = await authFetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_API}/admin/add/template`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        setError("Failed to upload template.");
        return;
      }

      setSuccess(true);
      resetForm();
    } catch {
      setError("Something went wrong while uploading the template.");
    } finally {
      setSubmitting(false);
    }
  };

  /* Success Screen handled inline instead of replacing view for easier 'upload another' if keeping original behavior? 
     Original behavior showed a banner. Let's redirect to success screen layout similar to the Issue page. */
  if (success) {
    return (
      <div className="flex items-center justify-center bg-[rgba(236,234,231,0.19)] px-6 py-8 min-h-[calc(100vh-72px)]">
        <div className="bg-white border border-[#E8E8E8] rounded-[22px] p-10 max-w-[30rem] w-full text-center shadow-[0px_3px_9px_rgba(0,0,0,0.25)]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl bg-[rgba(244,118,36,0.1)] text-[#F47624]">
            ✓
          </div>
          <h2 className="m-0 mb-2 text-xl font-bold font-['Poppins',system-ui,sans-serif] text-black">
            Template Uploaded!
          </h2>
          <p className="text-[#6D6D6D] font-['Poppins',system-ui,sans-serif] text-sm mb-6">
            The certificate template has been processed and saved successfully.
          </p>
          <div className="flex gap-3 flex-col">
            <button
              onClick={() => setSuccess(false)}
              className="py-3 rounded-lg border-[1.5px] border-[#F47624] bg-transparent text-[#F47624] font-semibold cursor-pointer text-[0.9rem] font-['Poppins',system-ui,sans-serif]"
            >
              Upload Another Template
            </button>
            <Link
              to="/"
              className="block py-3 rounded-lg border-none bg-transparent text-[#0F172A] font-semibold text-[0.9rem] font-['Poppins',system-ui,sans-serif] no-underline hover:opacity-75"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDisabled =
    submitting || !file || !fontSize || !fontColor || !nameXPos || !nameYPos;

  return (
    <div className="h-[calc(100vh-72px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[rgba(236,234,231,0.19)] px-4 py-12 flex flex-col items-center flex-1">
      {/* Page header */}
      <h1 className="m-0 mb-8 font-['Poppins',system-ui,sans-serif] font-semibold text-[32px] sm:text-[50px] leading-[1.25] text-black text-center">
        New Certificate Template
      </h1>

      {/* Main card */}
      <div className="bg-white shadow-[0px_3px_9px_rgba(0,0,0,0.25)] rounded-[22px] w-full max-w-[750px] p-6 sm:p-10 mb-8">
        <h2 className="m-0 mb-8 font-['Poppins',system-ui,sans-serif] font-semibold text-[24px] text-[#0F172A]">
          Template Details
        </h2>

        <form
          id="upload-template-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6"
        >
          {/* File upload */}
          <Field label="Template File" required>
            <label
              htmlFor="template-file-input"
              className="cursor-pointer border-none bg-[#F7F7F7] rounded-[10px] w-full flex flex-col items-center justify-center p-8 transition-colors hover:bg-[#EBEBEB]"
            >
              <Upload className="mb-2 text-[#060401] opacity-40 shrink-0" size={24} />
              <p className="m-0 text-[16px] font-bold font-['Poppins',system-ui,sans-serif] text-center tracking-[0.03em] text-[#060401] opacity-40 overflow-hidden text-ellipsis whitespace-nowrap w-full">
                {file ? file.name : "Click to choose a PDF or image"}
              </p>
              <input
                id="template-file-input"
                type="file"
                accept="application/pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </Field>

          {/* First grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Font Size" required>
              <input
                id="font-size-input"
                type="number"
                required
                placeholder="Name"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className={inputTailwind}
              />
            </Field>

            <Field label="Font Color" required>
              <div className="flex gap-2 w-full max-h-[48px]">
                <input
                  id="font-color-picker"
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="h-[48px] w-[54px] rounded-[5px] border-none p-0 cursor-pointer overflow-hidden shrink-0 bg-[#F7F7F7]"
                  style={{ padding: 0 }}
                />
                <input
                  id="font-color-input"
                  type="text"
                  required
                  placeholder="#F47624"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className={inputTailwind}
                />
              </div>
            </Field>

            <Field label="Name X Position" required>
              <input
                id="name-x-pos-input"
                type="number"
                required
                value={nameXPos}
                onChange={(e) => setNameXPos(e.target.value)}
                className={inputTailwind}
              />
            </Field>

            <Field label="Name Y Position" required>
              <input
                id="name-y-pos-input"
                type="number"
                required
                value={nameYPos}
                onChange={(e) => setNameYPos(e.target.value)}
                className={inputTailwind}
              />
            </Field>

            <Field label="Template Name">
              <input
                id="template-name-input"
                type="text"
                placeholder="Event"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className={inputTailwind}
              />
            </Field>

            <Field label="Template For">
              <input
                id="template-for-input"
                type="text"
                value={templateFor}
                onChange={(e) => setTemplateFor(e.target.value)}
                className={inputTailwind}
              />
            </Field>

            <Field label="Event Name">
              <input
                id="event-name-input"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className={inputTailwind}
              />
            </Field>

            <Field label="Issuer Name" required>
              <input
                id="issuer-name-input"
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                className={inputTailwind}
              />
            </Field>
          </div>

          <Field label="Notes">
            <textarea
              id="notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputTailwind} resize-y min-h-[5rem]`}
            />
          </Field>

          {/* Submit error */}
          {error && (
            <div className="bg-[#fdf0ef] border border-[#f5c6c2] text-[#c0392b] px-4 py-3 rounded-lg text-sm flex gap-2 items-center">
              <span>⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-6 mt-6">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="font-['Poppins',system-ui,sans-serif] font-semibold text-[18px] sm:text-[20px] text-[#0F172A] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="submit-template-button"
              type="submit"
              disabled={isDisabled}
              className={`w-full sm:w-auto font-['Poppins',system-ui,sans-serif] font-normal text-[18px] sm:text-[20px] px-8 py-2 sm:py-[10px] rounded-[5px] border-none transition-all duration-200 ${isDisabled
                ? "bg-[#D9D9D9] text-[#8C8C8C] cursor-not-allowed"
                : "bg-[#F47624] text-white cursor-pointer hover:bg-[#E36614] active:scale-[0.98] shadow-[0_2px_10px_rgba(244,118,36,0.3)]"
                }`}
            >
              {submitting ? "Uploading…" : "Upload Template"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
