import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import authFetch from "../../lib/authFetch";

interface Template {
  id: number;
  template_name: string;
  template_for?: string;
  event_name?: string;
}

interface FormData {
  template_id: string;
  recipient_name: string;
  recipient_email: string;
  issue_reason: string;
  event_name: string;
  event_date: string;
  event_location: string;
  issuer_name: string;
  course_name: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  template_id: "",
  recipient_name: "",
  recipient_email: "",
  issue_reason: "",
  event_name: "",
  event_date: "",
  event_location: "",
  issuer_name: "",
  course_name: "",
  notes: "",
};

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

export default function IssueCertificatePage() {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [issuedId, setIssuedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const res = await authFetch(
          `${import.meta.env.VITE_PUBLIC_BACKEND_API}/admin/templates`,
        );
        if (!res.ok) throw new Error("Could not load templates");
        const data = (await res.json()) as Template[] | { data: Template[] };
        const list = Array.isArray(data)
          ? data
          : (data as { data: Template[] }).data ?? [];
        setTemplates(list);
      } catch {
        setTemplatesError(
          "Could not load templates - enter template ID manually.",
        );
      } finally {
        setTemplatesLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const set =
    (field: keyof FormData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.template_id || !form.recipient_name || !form.recipient_email)
      return;

    try {
      setSubmitting(true);
      setSubmitError("");
      setIssuedId(null);

      const payload: Record<string, unknown> = {
        template_id: Number(form.template_id),
        recipient_name: form.recipient_name.trim(),
        recipient_email: form.recipient_email.trim(),
      };

      (
        [
          "issue_reason",
          "event_name",
          "event_date",
          "event_location",
          "issuer_name",
          "course_name",
          "notes",
        ] as const
      ).forEach((key) => {
        if (form[key].trim()) payload[key] = form[key].trim();
      });

      const res = await authFetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_API}/admin/add/certificate`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(err.message ?? `Server error ${res.status}`);
      }

      const result = (await res.json()) as {
        certificate_id?: string;
        certificate?: { certificate_id?: string };
        data?: { certificate_id?: string };
      };
      const certId =
        result.certificate_id ??
        result.certificate?.certificate_id ??
        result.data?.certificate_id ??
        null;

      if (!certId) throw new Error("No certificate ID returned by the server.");

      setIssuedId(certId);
      setForm(EMPTY_FORM);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*  Success screen  */
  if (issuedId) {
    return (
      <div className="flex items-center justify-center bg-[rgba(236,234,231,0.19)] px-6 py-8 min-h-[calc(100vh-72px)]">
        <div className="bg-white border border-[#E8E8E8] rounded-[22px] p-10 max-w-[30rem] w-full text-center shadow-[0px_3px_9px_rgba(0,0,0,0.25)]">
          {/* Checkmark */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl bg-[rgba(244,118,36,0.1)] text-[#F47624]">
            ✓
          </div>

          <h2 className="m-0 mb-2 text-xl font-bold font-['Poppins',system-ui,sans-serif] text-black">
            Certificate Issued!
          </h2>
          <p className="text-[#6D6D6D] font-['Poppins',system-ui,sans-serif] text-sm mb-6">
            The certificate has been created successfully.
          </p>

          {/* ID chip */}
          <div className="bg-[#F7F7F7] rounded-[10px] py-3 px-4 mb-6">
            <p className="m-0 text-[0.72rem] text-[#1E1E1E] font-medium font-['Poppins',system-ui,sans-serif] uppercase tracking-[0.06em]">
              Certificate ID
            </p>
            <p className="mt-1 font-mono text-base font-bold text-black break-all">
              {issuedId}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-col">
            <Link
              id="view-certificate-link"
              to={`/certificates/${encodeURIComponent(issuedId)}`}
              className="block py-3 rounded-lg text-white font-bold no-underline text-[0.9rem] bg-[#F47624] font-['Poppins',system-ui,sans-serif] shadow-[0_4px_14px_rgba(244,118,36,0.2)]"
            >
              View Certificate →
            </Link>
            <button
              id="issue-another-button"
              onClick={() => setIssuedId(null)}
              className="py-3 rounded-lg border-none bg-transparent text-[#0F172A] font-semibold cursor-pointer text-[0.9rem] font-['Poppins',system-ui,sans-serif]"
            >
              Issue Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isDisabled =
    submitting ||
    !form.template_id ||
    !form.recipient_name ||
    !form.recipient_email;

  return (
    <div className="h-[calc(100vh-72px)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[rgba(236,234,231,0.19)] px-4 py-12 flex flex-col items-center flex-1">
      {/* Page header */}
      <h1 className="m-0 mb-8 font-['Poppins',system-ui,sans-serif] font-semibold text-[32px] sm:text-[50px] leading-[1.25] text-black text-center">
        Issue Certificate
      </h1>

      {/* Main card */}
      <div className="bg-white shadow-[0px_3px_9px_rgba(0,0,0,0.25)] rounded-[22px] w-full max-w-[820px] p-6 sm:p-10 mb-8">
        <h2 className="m-0 mb-8 font-['Poppins',system-ui,sans-serif] font-semibold text-[24px] text-[#0F172A]">
          Certificate Details
        </h2>

        <form
          id="issue-certificate-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-6"
        >
          {/* Template */}
          <Field label="Template" required>
            {templatesLoading ? (
              <div className={`${inputTailwind} flex items-center text-[#1E1E1E]/40`}>
                Loading templates…
              </div>
            ) : templates.length > 0 ? (
              <select
                id="template-select"
                required
                value={form.template_id}
                onChange={set("template_id")}
                className={`${inputTailwind} appearance-none cursor-pointer pr-10`}
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.41 0.589966L6 5.16997L10.59 0.589966L12 1.99997L6 7.99997L0 1.99997L1.41 0.589966Z' fill='%231E1E1E' opacity='0.4'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "calc(100% - 1rem) center",
                }}
              >
                <option value="" disabled hidden>Enter template ID</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id} className="text-black">
                    {t.template_name}
                    {t.template_for ? ` — ${t.template_for}` : ""}
                  </option>
                ))}
              </select>
            ) : (
              <>
                {templatesError && (
                  <p className="m-0 mb-2 text-[0.78rem] text-[#c0392b]">
                    ⚠ {templatesError}
                  </p>
                )}
                <input
                  id="template-id-input"
                  type="number"
                  min="1"
                  required
                  placeholder="Enter template ID"
                  value={form.template_id}
                  onChange={set("template_id")}
                  className={inputTailwind}
                />
              </>
            )}
          </Field>

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Full name" required>
              <input
                id="recipient-name-input"
                type="text"
                required
                placeholder="Name"
                value={form.recipient_name}
                onChange={set("recipient_name")}
                className={inputTailwind}
              />
            </Field>
            <Field label="Email" required>
              <input
                id="recipient-email-input"
                type="email"
                required
                placeholder="Email"
                value={form.recipient_email}
                onChange={set("recipient_email")}
                className={inputTailwind}
              />
            </Field>
          </div>

          {/* Spacer visually dividing sections if desired. We use a larger margin top for Event Details instead */}
          <div className="mt-4">
            <h3 className="m-0 mb-1 font-['Poppins',system-ui,sans-serif] font-bold text-[18px] text-[#0F172A] tracking-[0.03em] uppercase">
              Event Details
            </h3>
            <p className="m-0 text-[14px] text-[#8C8C8C] mb-6">
              All fields in this section are optional.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-6">
              {/* Row 1 */}
              <Field label="Issue Reason">
                <input
                  id="issue-reason-input"
                  type="text"
                  placeholder="e.g. participation"
                  value={form.issue_reason}
                  onChange={set("issue_reason")}
                  className={inputTailwind}
                />
              </Field>

              <Field label="Event Name">
                <input
                  id="event-name-input"
                  type="text"
                  placeholder="e.g. AI Workshop 2026"
                  value={form.event_name}
                  onChange={set("event_name")}
                  className={inputTailwind}
                />
              </Field>

              <Field label="Event Date">
                <input
                  id="event-date-input"
                  type="date"
                  value={form.event_date}
                  onChange={set("event_date")}
                  className={`${inputTailwind} uppercase`}
                />
              </Field>

              {/* Row 2 */}
              <Field label="Event Location">
                <input
                  id="event-location-input"
                  type="text"
                  placeholder="e.g. Colombo"
                  value={form.event_location}
                  onChange={set("event_location")}
                  className={inputTailwind}
                />
              </Field>

              <Field label="Issuer Name">
                <input
                  id="issuer-name-input"
                  type="text"
                  placeholder="e.g. SLIIT Mozilla Club"
                  value={form.issuer_name}
                  onChange={set("issuer_name")}
                  className={inputTailwind}
                />
              </Field>

              <Field label="Course Name">
                <input
                  id="course-name-input"
                  type="text"
                  placeholder="e.g. Prompt Engineering"
                  value={form.course_name}
                  onChange={set("course_name")}
                  className={inputTailwind}
                />
              </Field>
            </div>

            {/* Notes full width below */}
            <div className="mt-6">
              <Field label="Notes">
                <textarea
                  id="notes-input"
                  placeholder="Any additional notes..."
                  rows={3}
                  value={form.notes}
                  onChange={set("notes")}
                  className={`${inputTailwind} resize-y min-h-[5rem]`}
                />
              </Field>
            </div>
          </div>


          {/* Submit error */}
          {submitError && (
            <div className="bg-[#fdf0ef] border border-[#f5c6c2] text-[#c0392b] px-4 py-3 rounded-lg text-sm flex gap-2 items-center">
              <span>⚠</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-6 mt-6">
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              disabled={submitting}
              className="font-['Poppins',system-ui,sans-serif] font-semibold text-[18px] sm:text-[20px] text-[#0F172A] bg-transparent border-none cursor-pointer transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="submit-certificate-button"
              type="submit"
              disabled={isDisabled}
              className={`w-full sm:w-auto font-['Poppins',system-ui,sans-serif] font-normal text-[18px] sm:text-[20px] px-8 py-2 sm:py-[10px] rounded-[5px] border-none transition-all duration-200 ${isDisabled
                ? "bg-[#D9D9D9] text-[#8C8C8C] cursor-not-allowed"
                : "bg-[#F47624] text-white cursor-pointer hover:bg-[#E36614] active:scale-[0.98] shadow-[0_2px_10px_rgba(244,118,36,0.3)]"
                }`}
            >
              {submitting ? "Issuing…" : "Issue Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
