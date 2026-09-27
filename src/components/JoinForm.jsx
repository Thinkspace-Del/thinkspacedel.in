import React, { useState } from "react";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const joinSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .regex(/^[a-zA-Z\s\-']+$/, {
      message: "Name cannot contain numbers or special characters.",
    })
    .max(100),
  email: z.email({ message: "Invalid email address." }),
  phone: z
    .string()
    .regex(/^\d+$/, {
      message: "Phone number must contain digits only (0-9).",
    })
    .min(10, { message: "Valid phone number is required." })
    .max(10, { message: "Phone number should only contain 10 digits." }),
  craft: z
    .string()
    .min(3, { message: "Craft is required (min 3 characters)." }),
  links: z.string().optional(),
});

export default function JoinForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    craft: "",
    links: "",
  });
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [submittedName, setSubmittedName] = useState("");

  const normalizePhone = (value) =>
    String(value ?? "")
      .replace(/\D/g, "")
      .slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});

    try {
      const validationResult = joinSchema.safeParse(formData);

      if (!validationResult.success) {
        const fieldErrors = {};
        const issues = validationResult.error.issues || [];
        issues.forEach((err) => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
        setStatus("idle");
        return;
      }

      const submitData = { ...formData };
      if (!submitData.links) delete submitData.links;

      const res = await fetch("/.netlify/functions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok || payload?.ok === false) {
        console.error(payload);
        setStatus("error");
      } else {
        setSubmittedName(formData.name.trim().split(" ")[0]);
        setStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          craft: "",
          links: "",
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "phone" ? normalizePhone(value) : value;
    setFormData({ ...formData, [name]: nextValue });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const checkDuplicate = async (field, value) => {
    if (!value) return;

    let queryValue = value;
    if (field === "phone") {
      queryValue = Number(value.replace(/\D/g, ""));
    }

    const [applicantsRes, buildersRes] = await Promise.all([
      supabase
        .from("applicants")
        .select("id,status")
        .eq(field, queryValue)
        .maybeSingle(),
      supabase
        .from("builders")
        .select("id")
        .eq(field, queryValue)
        .maybeSingle(),
    ]);

    // If either table errors, don't block typing; validation will still happen on submit.
    const applicant = applicantsRes?.data ?? null;
    const isRejectedApplicant =
      applicant &&
      String(applicant.status ?? "")
        .trim()
        .toLowerCase() === "rejected";

    const buildersMatch = Boolean(buildersRes?.data);
    const shouldBlock =
      buildersMatch || (Boolean(applicant) && !isRejectedApplicant);

    if (shouldBlock) {
      setErrors((prev) => ({
        ...prev,
        [field]: `This ${field} is already in our system.`,
      }));
    }
  };

  if (status === "success") {
    return (
      <div className="ts-thanks" role="status">
        <p className="ts-p">{`Thanks${submittedName ? `, ${submittedName}` : ""}.`}</p>
        <p className="ts-p ts-mute">
          We read every application and we'll reply by email. Keep going in the
          meantime.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="ts-form">
      <div className="ts-row">
        <div className="ts-field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            aria-invalid={errors.name ? "true" : undefined}
            className="ts-input"
          />
          {errors.name && <p className="ts-error">{errors.name}</p>}
        </div>
        <div className="ts-field">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => checkDuplicate("email", formData.email)}
            aria-invalid={errors.email ? "true" : undefined}
            className="ts-input"
          />
          {errors.email && <p className="ts-error">{errors.email}</p>}
        </div>
      </div>
      <div className="ts-field">
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          inputMode="numeric"
          pattern="[0-9]*"
          onBlur={() => {
            if (formData.phone.length === 10)
              checkDuplicate("phone", formData.phone);
          }}
          aria-invalid={errors.phone ? "true" : undefined}
          className="ts-input"
        />
        {errors.phone && <p className="ts-error">{errors.phone}</p>}
      </div>
      <div className="ts-field">
        <label htmlFor="craft">What do you make?</label>
        <input
          type="text"
          id="craft"
          name="craft"
          value={formData.craft}
          onChange={handleChange}
          placeholder="Films, games, a company…"
          aria-invalid={errors.craft ? "true" : undefined}
          className="ts-input"
        />
        {errors.craft && <p className="ts-error">{errors.craft}</p>}
      </div>
      <div className="ts-field">
        <label htmlFor="links">
          Link to your work <span className="ts-opt">(optional)</span>
        </label>
        <input
          id="links"
          name="links"
          value={formData.links}
          onChange={handleChange}
          aria-invalid={errors.links ? "true" : undefined}
          className="ts-input"
        />
        {errors.links && <p className="ts-error">{errors.links}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="ts-btn"
      >
        {status === "submitting" ? "Sending…" : "Send application"}
      </button>
      {status === "error" && (
        <p className="ts-form-error" role="alert">
          Something went wrong sending that. Please try again.
        </p>
      )}
    </form>
  );
}
