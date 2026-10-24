
import { useState, useRef } from "react";
import {
  Landmark,
  ShieldCheck,
  Zap,
  Target,
  Heart,
  Wallet,
  Building2,
  House,
  Users,
  CalendarDays,
  Gauge,
  Gem,
  IndianRupee,
  GraduationCap,
  BriefcaseBusiness,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LoaderCircle,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import "./App.css";

const API_URL = "https://loan-approval-prediction-gcn5.onrender.com";

const initialValues = {
  bank_asset_value: "",
  commercial_assets_value: "",
  residential_assets_value: "",
  no_of_dependents: "",
  income_annum: "",
  loan_term: "",
  cibil_score: "",
  luxury_assets_value: "",
  loan_amount: "",
  self_employed: "",
  education: "",
};


const fields = [
  {
    name: "bank_asset_value",
    label: "Bank Assets",
    description:
      "Total money you have in your bank accounts, savings, and fixed deposits.",
    placeholder: "e.g. 500000",
    icon: Landmark,
    type: "number",
    min: 0,
    step: "any",
    hint: "Enter amount in rupees (₹)",
  },
  {
    name: "commercial_assets_value",
    label: "Commercial Assets",
    description:
      "Value of business properties, shops, offices, or other commercial real estate you own.",
    placeholder: "e.g. 300000",
    icon: Building2,
    type: "number",
    min: 0,
    step: "any",
    hint: "Enter amount in rupees (₹)",
  },
  {
    name: "residential_assets_value",
    label: "Residential Assets",
    description:
      "Estimated current value of your house, flat, or other residential property you own.",
    placeholder: "e.g. 1000000",
    icon: House,
    type: "number",
    min: 0,
    step: "any",
    hint: "Enter amount in rupees (₹)",
  },
  {
    name: "no_of_dependents",
    label: "No. of Dependents",
    description:
      "People financially dependent on your income, such as children or dependent parents.",
    placeholder: "e.g. 2",
    icon: Users,
    type: "number",
    min: 0,
    max: 20,
    step: 1,
    hint: "Enter a whole number from 0 to 20",
  },
  {
    name: "income_annum",
    label: "Annual Income",
    description:
      "Your total income earned in one year, before deductions.",
    placeholder: "e.g. 1200000",
    icon: Wallet,
    type: "number",
    min: 0,
    step: "any",
    hint: "Enter yearly income in rupees (₹)",
  },
  {
    name: "loan_term",
    label: "Loan Term (Years)",
    description:
      "The number of years over which you plan to repay the loan.",
    placeholder: "e.g. 5",
    icon: CalendarDays,
    type: "number",
    min: 1,
    step: 1,
    hint: "Enter a positive whole number",
  },
  {
    name: "cibil_score",
    label: "CIBIL Score",
    description:
      "Your credit score, usually available through your bank or credit report.",
    placeholder: "300 – 900",
    icon: Gauge,
    type: "number",
    min: 300,
    max: 900,
    step: 1,
    hint: "Must be between 300 and 900",
  },
  {
    name: "luxury_assets_value",
    label: "Luxury Assets",
    description:
      "Estimated value of luxury possessions, such as expensive jewellery or other high-value items.",
    placeholder: "e.g. 200000",
    icon: Gem,
    type: "number",
    min: 0,
    step: "any",
    hint: "Enter amount in rupees (₹)",
  },
  {
    name: "loan_amount",
    label: "Requested Loan Amount",
    description:
      "The total amount of money you want to borrow from the lender.",
    placeholder: "e.g. 1000000",
    icon: IndianRupee,
    type: "number",
    min: 0,
    step: "any",
    hint: "Enter requested amount in rupees (₹)",
  },
];


function validateField(name, rawValue) {
  const value = String(rawValue).trim();

  if (!value) return "This field is required.";

  const number = Number(value);

  if (
    ["bank_asset_value", "commercial_assets_value",
      "residential_assets_value", "luxury_assets_value"].includes(name) &&
    number < 0
  ) {
    return "Value cannot be negative.";
  }

  if (name === "no_of_dependents") {
    if (!Number.isInteger(number) || number < 0 || number > 20) {
      return "Enter a whole number between 0 and 20.";
    }
  }

  if (name === "income_annum" && number <= 0) {
    return "Annual income must be greater than 0.";
  }

  if (name === "loan_term" &&
      (!Number.isInteger(number) || number <= 0)) {
    return "Enter a positive whole number.";
  }

  if (name === "cibil_score" &&
      (!Number.isInteger(number) || number < 300 || number > 900)) {
    return "CIBIL score must be between 300 and 900.";
  }

  if (name === "loan_amount" && number <= 0) {
    return "Loan amount must be greater than 0.";
  }

  return "";
}

function validateAll(values) {
  const errors = {};

  for (const field of fields) {
    errors[field.name] = validateField(
      field.name,
      values[field.name]
    );
  }

  if (!values.self_employed) {
    errors.self_employed = "Please select an option.";
  } else if (!["Yes", "No"].includes(values.self_employed)) {
    errors.self_employed = "Please select a valid option.";
  }

  if (!values.education) {
    errors.education = "Please select your education.";
  } else if (
    !["Graduate", "Not Graduate"].includes(values.education)
  ) {
    errors.education = "Please select a valid education option.";
  }

  return errors;
}

function formatINR(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(number);
}

function App() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const cibil = Number(values.cibil_score);
  const validCibil =
    values.cibil_score !== "" &&
    Number.isInteger(cibil) &&
    cibil >= 300 &&
    cibil <= 900;

  const resultRef = useRef(null);

  const cibilLabel = !validCibil
    ? "Enter your CIBIL score"
    : cibil >= 750
      ? "Excellent score"
      : cibil >= 700
        ? "Good score"
        : cibil >= 650
          ? "Fair score"
          : "Needs improvement";

  const cibilPercent = validCibil
    ? ((cibil - 300) / 600) * 100
    : 0;

  function updateField(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({
      ...current,
      [name]: validateField(name, value),
    }));
    setApiError("");
    setResult(null);
  }

  function handleBlur(name) {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({
      ...current,
      [name]: validateField(name, values[name]),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateAll(values);
    setErrors(nextErrors);
    setTouched(
      Object.fromEntries(
        Object.keys(nextErrors).map((key) => [key, true])
      )
    );
    setResult(null);
    setApiError("");

    if (Object.values(nextErrors).some(Boolean)) {
      setApiError("Please fix the highlighted fields before continuing.");
      document
        .querySelector(".field-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const payload = {
      bank_asset_value: Number(values.bank_asset_value),
      commercial_assets_value: Number(values.commercial_assets_value),
      residential_assets_value: Number(values.residential_assets_value),
      no_of_dependents: Number(values.no_of_dependents),
      income_annum: Number(values.income_annum),
      loan_term: Number(values.loan_term),
      cibil_score: Number(values.cibil_score),
      luxury_assets_value: Number(values.luxury_assets_value),
      loan_amount: Number(values.loan_amount),
      self_employed: values.self_employed,
      education: values.education,
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const detail =
          typeof data === "object"
            ? data?.detail
            : data;

        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg || "Invalid input").join(" ")
          : typeof detail === "string"
            ? detail
            : `Request failed with status ${response.status}.`;

        throw new Error(message);
      }

      const message =
        typeof data === "string"
          ? data
          : typeof data === "object" && data !== null
            ? data.message || data.detail || JSON.stringify(data)
            : String(data);

      const approved = /approved/i.test(message) &&
        !/rejected|not approved|declined/i.test(message);

      const rejected = /rejected|declined|not approved/i.test(message);

      if (!approved && !rejected) {
        throw new Error(
          "The server returned an unexpected prediction. Please check your API response."
        );
      }
setResult({
  approved,
  message,
  loanAmount: payload.loan_amount,
});

// Scroll to the result only if it is not fully visible.
requestAnimationFrame(() => {
  const element = resultRef.current;

  if (!element) return;

  const rect = element.getBoundingClientRect();

  const isFullyVisible =
    rect.top >= 0 &&
    rect.bottom <= window.innerHeight;

  if (!isFullyVisible) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
});
    } catch (error) {
      setApiError(
        error instanceof TypeError
          ? "Cannot connect to the prediction server. Check that FastAPI is running and CORS is configured."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setResult(null);
    setApiError("");
    setLoading(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="LoanWise home">
          <span className="brand-icon"><Landmark size={25} /></span>
          <span>Loan<span className="brand-accent">Wise</span></span>
        </a>

        <div className="nav-right">
          <span className="secure-tag">
            <ShieldCheck size={15} /> Secure assessment
          </span>
          <a className="nav-link" href="#application">Apply now <ArrowRight size={15} /></a>
        </div>
      </header>

      <main id="home" className="main-content">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={15} /> SMART LOAN PREDICTOR
            </div>
            <h1>
              Your next chapter
              <br />
              starts with <span>clarity.</span>
            </h1>
            <p className="hero-description">
              A smarter way to check your loan eligibility.
              Share your details and let our prediction model
              assess your application in seconds.
            </p>

            <div className="hero-benefits">
              <div className="benefit">
                <span className="benefit-icon"><ShieldCheck /></span>
                <span><strong>Private & secure</strong><small>Your data stays yours</small></span>
              </div>
              <div className="benefit">
                <span className="benefit-icon"><Zap /></span>
                <span><strong>Instant results</strong><small>Fast AI assessment</small></span>
              </div>
              <div className="benefit">
                <span className="benefit-icon"><Target /></span>
                <span><strong>Simple process</strong><small>No guesswork</small></span>
              </div>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="floating-chip chip-top"><ShieldCheck size={17} /> Protected</div>
            <div className="document-card">
              <div className="document-top">
                <span className="document-logo"><Landmark size={20} /></span>
                <span className="document-label">LOAN PROFILE</span>
              </div>
              <div className="document-amount">₹ 8,50,000</div>
              <div className="document-subtitle">Personal loan request</div>
              <div className="document-line long" />
              <div className="document-line medium" />
              <div className="document-line short" />
              <div className="document-check"><CheckCircle2 size={19} /> Ready to assess</div>
            </div>
            <div className="floating-chip chip-bottom"><Zap size={17} /> Results in seconds</div>
            <div className="visual-spark spark-one">✳</div>
            <div className="visual-spark spark-two">✦</div>
          </div>
        </section>

        <section id="application" className="application-layout">
          <div className="form-card">
            <div className="form-heading">
              <div className="heading-icon"><BriefcaseBusiness size={21} /></div>
              <div>
                <h2>Loan application</h2>
                <p>Tell us a little about your financial profile.</p>
              </div>
              <span className="step-badge">11 DETAILS</span>
            </div>

            <div className="form-divider" />

            <form onSubmit={handleSubmit} noValidate>
              <div className="section-label">
                <span className="section-number">01</span>
                ASSETS & FINANCES
              </div>

              <div className="fields-grid">
                {fields.map((field) => {
                  const Icon = field.icon;
                  const hasError = Boolean(
                    touched[field.name] && errors[field.name]
                  );

                  return (
                    <div className="field-group" key={field.name}>
<label htmlFor={field.name}>
  <Icon size={16} />
  {field.label}
  <span className="required-mark">*</span>
  {[
    "bank_asset_value",
    "commercial_assets_value",
    "residential_assets_value",
    "income_annum",
    "luxury_assets_value",
    "loan_amount",
  ].includes(field.name) && (
    <span className="currency-tag">₹ INR</span>
  )}
</label>

<p className="field-description">{field.description}</p>

                      <div className={`input-wrap ${hasError ? "input-invalid" : ""} ${
                        touched[field.name] && !errors[field.name]
                          ? "input-valid"
                          : ""
                      }`}>
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          inputMode="decimal"
                          min={field.min}
                          max={field.max}
                          step={field.step}
                          placeholder={field.placeholder}
                          value={values[field.name]}
                          onChange={(e) => updateField(field.name, e.target.value)}
                          onBlur={() => handleBlur(field.name)}
                          aria-invalid={hasError}
                          aria-describedby={`${field.name}-hint`}
                          required
                        />
                        {hasError && <AlertCircle className="input-status error-icon" size={17} />}
                        {!hasError && touched[field.name] && values[field.name] !== "" &&
                          <CheckCircle2 className="input-status success-icon" size={17} />}
                      </div>

                      <small
                        id={`${field.name}-hint`}
                        className={hasError ? "field-hint field-error" : "field-hint"}
                        aria-live="polite"
                      >
                        {hasError ? errors[field.name] : field.hint}
                      </small>
                    </div>
                  );
                })}
              </div>

              <div className="cibil-card">
                <div className="cibil-heading">
                  <span className="cibil-icon"><Gauge size={19} /></span>
                  <div>
                    <strong>CIBIL score</strong>
                    <small>Your credit score at a glance</small>
                  </div>
                  <span className={`cibil-rating ${validCibil ? "rating-active" : ""}`}>
                    {validCibil ? cibil : "300–900"}
                  </span>
                </div>
                <div className="cibil-track">
                  <div
                    className="cibil-fill"
                    style={{ width: `${cibilPercent}%` }}
                  />
                    {validCibil && <span className="cibil-marker" style={{ left: `${cibilPercent}%` }} />}
                </div>
                <div className="cibil-footer">
                  <span>300 · Low</span>
                  <strong className={validCibil ? "cibil-message" : ""}>
                    {cibilLabel}
                  </strong>
                  <span>900 · High</span>
                </div>
              </div>

              <div className="section-label personal-label">
                <span className="section-number">02</span>
                PERSONAL DETAILS
              </div>

              <div className="fields-grid select-grid">
                <div className="field-group">
                  <label htmlFor="self_employed">
                    <BriefcaseBusiness size={16} />
                    Self employed
                    <span className="required-mark">*</span>
                  </label>
                  <div className={`select-wrap ${touched.self_employed && errors.self_employed ? "input-invalid" : ""}`}>
                    <select
                      id="self_employed"
                      name="self_employed"
                      value={values.self_employed}
                      onChange={(e) => updateField("self_employed", e.target.value)}
                      onBlur={() => handleBlur("self_employed")}
                      aria-invalid={Boolean(touched.self_employed && errors.self_employed)}
                      required
                    >
                      <option value="">Select employment status</option>
                      <option value="Yes">Yes, self-employed</option>
                      <option value="No">No, salaried / other</option>
                    </select>
                  </div>
                  <small className={touched.self_employed && errors.self_employed ? "field-hint field-error" : "field-hint"}>
                    {touched.self_employed && errors.self_employed
                      ? errors.self_employed
                      : "Choose the option that applies to you"}
                  </small>
                </div>

                <div className="field-group">
                  <label htmlFor="education">
                    <GraduationCap size={16} />
                    Education
                    <span className="required-mark">*</span>
                  </label>
                  <div className={`select-wrap ${touched.education && errors.education ? "input-invalid" : ""}`}>
                    <select
                      id="education"
                      name="education"
                      value={values.education}
                      onChange={(e) => updateField("education", e.target.value)}
                      onBlur={() => handleBlur("education")}
                      aria-invalid={Boolean(touched.education && errors.education)}
                      required
                    >
                      <option value="">Select education</option>
                      <option value="Graduate">Graduate</option>
                      <option value="Not Graduate">Not Graduate</option>
                    </select>
                  </div>
                  <small className={touched.education && errors.education ? "field-hint field-error" : "field-hint"}>
                    {touched.education && errors.education
                      ? errors.education
                      : "Choose your highest applicable category"}
                  </small>
                </div>
              </div>

              <div className="privacy-note">
                <ShieldCheck size={17} />
                <span>Your information is used to evaluate this prediction request.</span>
              </div>

              {apiError && (
                <div className="api-alert" role="alert">
                  <AlertCircle size={19} />
                  <span>{apiError}</span>
                </div>
              )}

              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="spin-icon" size={19} />
                    Assessing your profile...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Check loan eligibility
                    <ArrowRight size={18} className="button-arrow" />
                  </>
                )}
              </button>

              <p className="form-footnote">
                <ShieldCheck size={13} /> All 11 fields are required. No field is skipped.
              </p>
            </form>
          </div>

          <aside className="result-column">
<div
  ref={resultRef}
  className={`result-card ${
    result
      ? result.approved
        ? "result-approved"
        : "result-rejected"
      : ""
  }`}
>
              <div className="result-topline">
                <span className="result-label">YOUR ASSESSMENT</span>
                <span className="live-indicator"><span /> LIVE</span>
              </div>

              {result ? (
                <div className="result-content result-animate" aria-live="polite">
                  <div className={`result-symbol ${result.approved ? "symbol-approved" : "symbol-rejected"}`}>
                    {result.approved
                      ? <CheckCircle2 size={38} />
                      : <XCircle size={38} />}
                  </div>

                  <span className={`result-status ${
                    result.approved ? "status-approved" : "status-rejected"
                  }`}>
                    {result.approved ? "APPLICATION APPROVED" : "APPLICATION REJECTED"}
                  </span>

                  <h3>{result.approved ? "Great news!" : "Not this time."}</h3>
                  <p className="result-description">{result.message}</p>

                  <div className="result-detail">
                    <span>Requested loan amount</span>
                    <strong>{formatINR(result.loanAmount)}</strong>
                  </div>

                  <div className={`result-notice ${
                    result.approved ? "notice-approved" : "notice-rejected"
                  }`}>
                    {result.approved ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p>
                      {result.approved
                        ? "This is a model prediction, not a formal bank sanction. Confirm eligibility and terms with your lender."
                        : "A rejection prediction does not determine your future eligibility. Review your profile and consult your lender."}
                    </p>
                  </div>

                  <button className="reset-button" type="button" onClick={resetForm}>
                    <RotateCcw size={16} /> Start a new assessment
                  </button>
                </div>
              ) : (
                <div className="result-content empty-result">
                  <div className="empty-illustration">
                    <div className="illustration-glow" />
                    <div className="mini-document">
                      <span /><span /><span /><span />
                      <div className="mini-document-check"><CheckCircle2 size={25} /></div>
                    </div>
                    <div className="illustration-spark spark-left">✦</div>
                    <div className="illustration-spark spark-right">✧</div>
                  </div>

                  <span className="waiting-badge">READY WHEN YOU ARE</span>
                  <h3>Your result awaits.</h3>
                  <p className="result-description">
                    Complete the application to discover what your loan profile looks like.
                  </p>

                  <div className="result-steps">
                    <div className="result-step">
                      <span className="step-icon"><Wallet size={17} /></span>
                      <span><strong>Share your details</strong><small>Assets, income & loan request</small></span>
                      <CheckCircle2 size={16} className="step-check" />
                    </div>
                    <div className="result-step">
                      <span className="step-icon"><Target size={17} /></span>
                      <span><strong>Model assessment</strong><small>Your inputs are evaluated</small></span>
                      <CheckCircle2 size={16} className="step-check" />
                    </div>
                    <div className="result-step">
                      <span className="step-icon"><Zap size={17} /></span>
                      <span><strong>Get your result</strong><small>Approval or rejection prediction</small></span>
                      <CheckCircle2 size={16} className="step-check" />
                    </div>
                  </div>

                  <a className="aside-cta" href="#application">
                    Complete your application <ArrowRight size={17} />
                  </a>
                </div>
              )}
            </div>

            <div className="disclaimer-card">
              <span className="disclaimer-icon"><AlertCircle size={19} /></span>
              <div>
                <strong>A quick note</strong>
                <p>
                  This tool provides a machine-learning prediction only.
                  Actual loan approval is determined by the lender.
                </p>
              </div>
            </div>
          </aside>
        </section>

      </main>
    </div>
  );
}

export default App;
