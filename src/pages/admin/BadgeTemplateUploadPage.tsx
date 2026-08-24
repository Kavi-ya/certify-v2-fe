import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Upload,
} from "lucide-react";
import authFetch from "../../lib/authFetch";

function BadgeTemplateUploadPage() {
  const [file, setFile] = useState<File | null>(null);
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

    if (!file || !templateName) {
      setError("Please fill in all required fields (File and Template Name).");
      return;
    }

    const formData = new FormData();
    formData.append("template", file);
    formData.append("template_name", templateName);
    if (templateFor) formData.append("template_for", templateFor);
    if (eventName) formData.append("event_name", eventName);
    if (issuerName) formData.append("issuer_name", issuerName);
    if (notes) formData.append("notes", notes);

    try {
      setSubmitting(true);
      const response = await authFetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_API}/admin/add/badge-template`,
        { method: "POST", body: formData },
      );

      if (!response.ok) {
        setError("Failed to upload badge template.");
        return;
      }

      setSuccess(true);
      resetForm();
    } catch {
      setError("Something went wrong while uploading the badge template.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="m-0 font-bold text-moz-black tracking-[-0.02em] text-[clamp(1.1rem,3vw,1.5rem)]"
          >
            New Badge Template
          </h1>
        </div>
        <Link id="back-to-home-link" to="/" className="btn-ghost">
          ← Back
        </Link>
      </div>

      {/* Success banner */}
      {success && (
        <div className="max-w-3xl mx-auto w-full">
          <p className="form-banner form-banner-success">
            <CheckCircle2 size={18} /> Badge template uploaded successfully.
          </p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="max-w-3xl mx-auto w-full">
          <p className="form-banner form-banner-error">
            <AlertCircle size={18} /> {error}
          </p>
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto w-full bg-white border border-moz-gray-light rounded-2xl p-7 flex flex-col gap-6"
      >
        {/* File upload */}
        <div>
          <label htmlFor="badge-template-file-input" className="form-label">
            Template File{" "}
            <span className="text-moz-orange">*</span>
          </label>
          <label htmlFor="badge-template-file-input" className="dropzone">
            {file ? (
              <FileText size={22} color="var(--color-moz-orange)" />
            ) : (
              <Upload size={22} color="var(--color-moz-gray-mid)" />
            )}
            <div className="min-w-0">
              <p className="m-0 text-[0.85rem] font-semibold text-moz-black overflow-hidden text-ellipsis whitespace-nowrap">
                {file ? file.name : "Click to choose a PDF or image"}
              </p>
              <p className="m-0 text-[0.7rem] text-moz-gray-mid">
                PDF, PNG or JPG (Recommended: Square aspect ratio like 512x512)
              </p>
            </div>
            <input
              id="badge-template-file-input"
              type="file"
              accept="application/pdf,image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Required fields */}
        <div>
          <label htmlFor="template-name-input" className="form-label">
            Template Name <span className="text-moz-orange">*</span>
          </label>
          <input
            id="template-name-input"
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="form-input"
            placeholder="e.g. Winner Badge 2026"
          />
        </div>

        {/* Optional metadata */}
        <div>
          <p className="form-section-title mt-2">Optional Metadata</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="template-for-input" className="form-label">
                Template For
              </label>
              <input
                id="template-for-input"
                type="text"
                value={templateFor}
                onChange={(e) => setTemplateFor(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="event-name-input" className="form-label">
                Event Name
              </label>
              <input
                id="event-name-input"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="issuer-name-input" className="form-label">
                Issuer Name
              </label>
              <input
                id="issuer-name-input"
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes-input" className="form-label">
              Notes
            </label>
            <textarea
              id="notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="form-input textarea-input"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          id="submit-template-button"
          type="submit"
          disabled={submitting}
          className={`submit-btn rounded-lg border-none text-[0.9rem] font-bold cursor-pointer font-sans tracking-[0.02em] flex items-center justify-center gap-2 py-[0.7rem] transition-[transform,opacity] duration-150 ${submitting
            ? "bg-moz-gray-light text-moz-gray cursor-not-allowed"
            : "text-white bg-gradient-to-br from-[var(--color-moz-orange)] to-[var(--color-moz-orange-mid)]"
            }`}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading…
            </>
          ) : (
            "Upload Badge Template"
          )}
        </button>
      </form>
    </div>
  );
}

export default BadgeTemplateUploadPage;
