import { useRef, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Upload, X, FileText, Image } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { apiClient, endpoints } from "@/lib/api-client";

export const Route = createFileRoute("/admissions/apply")({
  head: () =>
    pageHead({
      title: "Admission Application",
      description:
        "Apply for admission to The Ali's Collegiate — personal details, academic record, program selection, documents and fee submission in one guided form.",
      path: "/admissions/apply",
    }),
  component: ApplyPage,
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_LABELS = "JPG, PNG or PDF";

const steps = [
  "Personal Information",
  "Academic Information",
  "Program Selection",
  "Contact Information",
  "Documents",
  "Payment",
  "Review",
  "Confirmation",
];

interface FormData {
  firstName: string;
  lastName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  cnicBform: string;
  previousSchool: string;
  lastClassPassed: string;
  board: string;
  marksObtained: string;
  passingYear: string;
  boardRollNumber: string;
  program: string;
  stream: string;
  batch: string;
  notes: string;
  phone: string;
  guardianPhone: string;
  email: string;
  city: string;
  address: string;
  paymentMethod: string;
  paymentReference: string;
}

interface UploadedDoc {
  name: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

const emptyForm: FormData = {
  firstName: "", lastName: "", fatherName: "", dateOfBirth: "", gender: "",
  cnicBform: "", previousSchool: "", lastClassPassed: "", board: "",
  marksObtained: "", passingYear: "", boardRollNumber: "", program: "",
  stream: "", batch: "", notes: "", phone: "", guardianPhone: "", email: "",
  city: "", address: "", paymentMethod: "", paymentReference: "",
};

const docTypes = ["Result Card", "CNIC / B-Form", "Guardian CNIC", "Photograph"];

function validateStep(step: number, form: FormData): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!form.firstName.trim()) errors.push("First name is required");
    if (!form.lastName.trim()) errors.push("Last name is required");
    if (!form.gender) errors.push("Gender is required");
  }
  if (step === 1) {
    if (!form.lastClassPassed.trim()) errors.push("Last class passed is required");
    if (!form.board.trim()) errors.push("Board is required");
  }
  if (step === 2) {
    if (!form.program) errors.push("Program is required");
    if (!form.stream) errors.push("Stream is required");
  }
  if (step === 3) {
    if (!form.phone.trim()) errors.push("Phone number is required");
    if (!form.email.trim()) errors.push("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push("Invalid email format");
    if (!form.city.trim()) errors.push("City is required");
  }
  if (step === 4) {
    // Documents are optional but validated on upload
  }
  if (step === 5) {
    if (!form.paymentMethod) errors.push("Payment method is required");
  }
  return errors;
}

function ApplyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [documents, setDocuments] = useState<Record<string, UploadedDoc>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [applicationNumber, setApplicationNumber] = useState("");

  // Handle returning from Stripe checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success" && params.get("ref")) {
      setApplicationNumber(params.get("ref") || "");
      setStep(7);
      // Clean URL
      window.history.replaceState({}, "", "/admissions/apply");
    }
  }, []);

  const update = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStepErrors([]);
  };

  const goNext = () => {
    const errors = validateStep(step, form);
    if (errors.length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors([]);
    setStep((s) => Math.min(7, s + 1));
  };

  const handleFileUpload = async (docName: string, file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setStepErrors([`File must be ${ALLOWED_LABELS}`]);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setStepErrors([`File size must be under 2MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`]);
      return;
    }

    setStepErrors([]);
    setUploading(docName);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env["VITE_API_BASE_URL"] ?? "/api"}/uploads?folder=admissions`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setDocuments((prev) => ({
        ...prev,
        [docName]: { name: file.name, ...json.data },
      }));
    } catch (err) {
      setStepErrors([err instanceof Error ? err.message : "Upload failed"]);
    } finally {
      setUploading(null);
    }
  };

  const removeDoc = (docName: string) => {
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        documents: Object.entries(documents).map(([name, doc]) => ({
          name,
          url: doc.url,
          filename: doc.filename,
        })),
      };
      const res = await apiClient.post<{ applicationNumber: string; status: string }>(
        endpoints.applications.submit,
        payload
      );
      setApplicationNumber(res.applicationNumber);

      // If "online" payment, create Stripe checkout session and redirect
      if (form.paymentMethod === "online") {
        try {
          const sessionRes = await apiClient.post<{ url: string; sessionId: string }>(
            endpoints.payments.createSession,
            {
              amount: 6500,
              applicationId: res.applicationNumber,
              description: "The Ali's Collegiate — Admission Fee",
              email: form.email,
              studentName: `${form.firstName} ${form.lastName}`,
            }
          );
          if (sessionRes?.url) {
            window.location.href = sessionRes.url;
            return; // don't advance step yet — redirecting to Stripe
          }
        } catch {
          // Payment session failed — still submitted, just no online payment
        }
      }

      setStep(7);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Admissions"
        title="Admission application"
        description="Complete each section and submit when ready."
      />

      <section className="py-14 sm:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="Application sections" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <ol className="space-y-1">
              {steps.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    aria-current={i === step ? "step" : undefined}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                      i === step
                        ? "bg-primary text-primary-foreground"
                        : i < step
                          ? "text-foreground/70 hover:bg-secondary cursor-pointer"
                          : "text-foreground/40",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        i < step ? "bg-gold text-gold-foreground" : i === step ? "bg-gold text-gold-foreground" : "bg-secondary text-navy-2",
                      )}
                    >
                      {i < step ? <Check className="size-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 truncate">{s}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <div className="card-surface min-w-0 p-6 sm:p-8">
            <h2 className="text-xl">{steps[step]}</h2>
            <span className="gold-rule mt-3" />

            <div className="mt-7">
              {(error || stepErrors.length > 0) && (
                <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  {stepErrors.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1">{stepErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                  ) : error}
                </div>
              )}

              {/* Step 0: Personal */}
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>First name *</Label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Ahmed" /></div>
                  <div className="grid gap-2"><Label>Last name *</Label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Raza" /></div>
                  <div className="grid gap-2"><Label>Father's name</Label><Input value={form.fatherName} onChange={(e) => update("fatherName", e.target.value)} placeholder="Muhammad Raza" /></div>
                  <div className="grid gap-2"><Label>Date of birth</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} /></div>
                  <div className="grid gap-2"><Label>CNIC / B-Form</Label><Input value={form.cnicBform} onChange={(e) => update("cnicBform", e.target.value)} placeholder="42101-XXXXXXX-X" /></div>
                  <div className="grid gap-2">
                    <Label>Gender *</Label>
                    <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 1: Academic */}
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>Previous school</Label><Input value={form.previousSchool} onChange={(e) => update("previousSchool", e.target.value)} placeholder="Name of institution" /></div>
                  <div className="grid gap-2"><Label>Last class passed *</Label><Input value={form.lastClassPassed} onChange={(e) => update("lastClassPassed", e.target.value)} placeholder="e.g. Class X" /></div>
                  <div className="grid gap-2"><Label>Board *</Label><Input value={form.board} onChange={(e) => update("board", e.target.value)} placeholder="BSEK / BIEK" /></div>
                  <div className="grid gap-2"><Label>Marks obtained</Label><Input value={form.marksObtained} onChange={(e) => update("marksObtained", e.target.value)} placeholder="e.g. 812 / 1100" /></div>
                  <div className="grid gap-2"><Label>Year of passing</Label><Input value={form.passingYear} onChange={(e) => update("passingYear", e.target.value)} placeholder="2026" /></div>
                  <div className="grid gap-2"><Label>Board roll number</Label><Input value={form.boardRollNumber} onChange={(e) => update("boardRollNumber", e.target.value)} placeholder="Optional" /></div>
                </div>
              )}

              {/* Step 2: Program */}
              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Program *</Label>
                    <Select value={form.program} onValueChange={(v) => update("program", v)}>
                      <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Class IX">Class IX</SelectItem>
                        <SelectItem value="Class X">Class X</SelectItem>
                        <SelectItem value="Class XI">Class XI</SelectItem>
                        <SelectItem value="Class XII">Class XII</SelectItem>
                        <SelectItem value="Computer Course">Computer Course</SelectItem>
                        <SelectItem value="English Language Course">English Language Course</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Stream *</Label>
                    <Select value={form.stream} onValueChange={(v) => update("stream", v)}>
                      <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Commerce">Commerce</SelectItem>
                        <SelectItem value="Arts">Arts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Preferred batch</Label>
                    <Select value={form.batch} onValueChange={(v) => update("batch", v)}>
                      <SelectTrigger><SelectValue placeholder="Select timing" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8 AM — 11 AM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (1 PM — 4 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5 PM — 8 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Notes</Label>
                    <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Subjects you need extra support with…" />
                  </div>
                </div>
              )}

              {/* Step 3: Contact */}
              {step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2"><Label>Student phone *</Label><Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="03XX-XXXXXXX" /></div>
                  <div className="grid gap-2"><Label>Guardian phone</Label><Input type="tel" value={form.guardianPhone} onChange={(e) => update("guardianPhone", e.target.value)} placeholder="03XX-XXXXXXX" /></div>
                  <div className="grid gap-2"><Label>Email address *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" /></div>
                  <div className="grid gap-2"><Label>City *</Label><Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Karachi" /></div>
                  <div className="grid gap-2 sm:col-span-2"><Label>Address</Label><Textarea rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="House / street / sector, area" /></div>
                </div>
              )}

              {/* Step 4: Documents */}
              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload scanned copies of your documents. Each file must be {ALLOWED_LABELS} and under 2MB.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {docTypes.map((docName) => {
                      const uploaded = documents[docName];
                      return (
                        <div key={docName} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-5 text-center">
                          {uploaded ? (
                            <>
                              {uploaded.mimetype.startsWith("image/") ? (
                                <img src={uploaded.url} alt={docName} className="mb-2 h-16 rounded object-cover" />
                              ) : (
                                <FileText className="mb-2 size-8 text-gold" />
                              )}
                              <p className="text-xs font-medium text-primary truncate max-w-full">{uploaded.name}</p>
                              <p className="text-xs text-muted-foreground">{(uploaded.size / 1024).toFixed(0)} KB</p>
                              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => removeDoc(docName)}>
                                <X className="size-3" /> Remove
                              </Button>
                            </>
                          ) : (
                            <>
                              <Upload className="size-5 text-gold" />
                              <p className="mt-2 text-sm font-bold text-primary">{docName}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground">{ALLOWED_LABELS} · max 2MB</p>
                              <DocUploadButton
                                docName={docName}
                                uploading={uploading === docName}
                                onUpload={handleFileUpload}
                              />
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Payment */}
              {step === 5 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-surface p-5">
                    <h3 className="text-sm font-bold">Fee summary</h3>
                    <dl className="mt-4 space-y-2.5 text-sm">
                      <div className="flex justify-between"><dt className="text-muted-foreground">Admission fee</dt><dd className="font-semibold">Rs. 2,000</dd></div>
                      <div className="flex justify-between"><dt className="text-muted-foreground">First month tuition</dt><dd className="font-semibold">Rs. 4,500</dd></div>
                      <div className="flex justify-between border-t border-border pt-2.5"><dt className="font-bold text-primary">Total payable</dt><dd className="font-extrabold text-gold">Rs. 6,500</dd></div>
                    </dl>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Payment method *</Label>
                      <Select value={form.paymentMethod} onValueChange={(v) => update("paymentMethod", v)}>
                        <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="online">Pay Online (Stripe — Card / Wallet)</SelectItem>
                          <SelectItem value="cash">Pay at campus office (Cash)</SelectItem>
                          <SelectItem value="bank-transfer">Bank transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.paymentMethod === "online" ? (
                      <p className="text-xs text-muted-foreground">You will be redirected to Stripe's secure checkout page after submitting. You can pay using any debit/credit card.</p>
                    ) : (
                      <div className="grid gap-2"><Label>Transaction reference</Label><Input value={form.paymentReference} onChange={(e) => update("paymentReference", e.target.value)} placeholder="Enter after payment" /></div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 6: Review */}
              {step === 6 && (
                <div className="space-y-4">
                  {[
                    { title: "Personal", value: `${form.firstName} ${form.lastName} · Father: ${form.fatherName || "N/A"} · ${form.gender || "N/A"}` },
                    { title: "Academic", value: `${form.lastClassPassed || "N/A"} · ${form.board || "N/A"} · ${form.marksObtained || "N/A"}` },
                    { title: "Program", value: `${form.program} · ${form.stream} · ${form.batch || "N/A"}` },
                    { title: "Contact", value: `${form.phone} · ${form.email} · ${form.city}` },
                    { title: "Documents", value: `${Object.keys(documents).length} file(s) uploaded` },
                    { title: "Payment", value: `${form.paymentMethod} · ${form.paymentReference || "Pending"}` },
                  ].map((r) => (
                    <div key={r.title} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-5 py-4">
                      <span className="text-sm font-bold text-primary">{r.title}</span>
                      <span className="text-sm text-muted-foreground text-right max-w-xs">{r.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 7: Confirmation */}
              {step === 7 && (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto size-14 text-gold" />
                  <h3 className="mt-5 text-xl">Application submitted</h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Your reference number is <strong className="text-primary">{applicationNumber}</strong>.
                    Visit the campus with your original documents to complete verification.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Button asChild variant="navy" size="xl">
                      <Link to="/admissions/status">View Application Status</Link>
                    </Button>
                    <Button asChild variant="outlineNavy" size="xl">
                      <Link to="/">Back to Home</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {step < 6 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <Button type="button" variant="outlineNavy" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                  <ChevronLeft className="size-4" /> Back
                </Button>
                {step < 5 ? (
                  <Button type="button" variant="navy" onClick={goNext}>
                    Save & Continue <ChevronRight className="size-4" />
                  </Button>
                ) : (
                  <Button type="button" variant="navy" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <><Loader2 className="size-4 animate-spin" /> Submitting...</> : <>Submit Application <ChevronRight className="size-4" /></>}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function DocUploadButton({ docName, uploading, onUpload }: { docName: string; uploading: boolean; onUpload: (name: string, file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(docName, file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <Button type="button" variant="outlineNavy" size="sm" className="mt-3" disabled={uploading} onClick={() => inputRef.current?.click()}>
        {uploading ? <><Loader2 className="size-3 animate-spin" /> Uploading...</> : <><Upload className="size-3" /> Choose file</>}
      </Button>
    </>
  );
}
