import React, { useState } from "react";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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

      const { error } = await supabase.from("applicants").insert([submitData]);

      if (error) {
        console.error(error);
        setStatus("error");
      } else {
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
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
    const shouldBlock = buildersMatch || (Boolean(applicant) && !isRejectedApplicant);

    if (shouldBlock) {
      setErrors((prev) => ({
        ...prev,
        [field]: `This ${field} is already in our system.`,
      }));
    }
  };

  if (status === "success") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-6">
        <div className="w-24 h-24 bg-muted border border-foreground/10 rounded-full flex items-center justify-center mb-4 relative shadow-inner">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
          <CheckCircle2 className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h3 className="text-4xl font-headline font-bold text-foreground tracking-tight">
            Signal Received.
          </h3>
          <p className="text-muted-foreground font-mono text-sm max-w-sm mx-auto leading-relaxed">
            {`> DATA_UPLOAD_COMPLETE `}
            <br />
            We review applications weekly. Keep your comms open.
          </p>
        </div>
        <div className="font-mono text-xs font-bold text-primary mt-8 border border-primary/20 bg-primary/5 px-6 py-3 rounded tracking-widest uppercase shadow-sm">
          System Status: PENDING_REVIEW
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-3xl font-headline font-bold mb-2 text-foreground">
          Access Request
        </h2>
        <p className="text-sm font-mono text-muted-foreground opacity-70">
          Fill the parameters below.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block font-mono text-m font-bold uppercase tracking-wider text-muted-foreground"
          >
            01. Name <span className="text-destructive font-bold">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full bg-muted border-0 border-b-2 border-foreground/30 hover:border-b-primary focus:border-b-primary focus:outline-none px-4 py-3 font-sans transition-colors rounded-t text-foreground ${errors.name ? "border-b-destructive" : ""}`}
            placeholder=""
          />
          {errors.name && (
            <p className="text-destructive text-sm font-headline">
              {errors.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block font-mono text-m font-bold uppercase tracking-wider text-muted-foreground"
            >
              02. Email <span className="text-destructive font-bold">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full bg-muted border-0 border-b-2 border-foreground/30 hover:border-b-primary focus:border-b-primary focus:outline-none px-4 py-3 font-sans transition-colors rounded-t text-foreground ${errors.email ? "border-b-destructive" : ""}`}
              placeholder=""
              onBlur={() => checkDuplicate("email", formData.email)}
            />
            {errors.email && (
              <p className="text-destructive text-sm font-headline">
                {errors.email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="block font-mono text-m font-bold uppercase tracking-wider text-muted-foreground"
            >
              03. Phone <span className="text-destructive font-bold">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full bg-muted border-0 border-b-2 border-foreground/30 hover:border-b-primary focus:border-b-primary focus:outline-none px-4 py-3 font-sans transition-colors rounded-t text-foreground ${errors.phone ? "border-b-destructive" : ""}`}
              placeholder=""
              onBlur={() => {
                if (formData.phone.length === 10)
                  checkDuplicate("phone", formData.phone);
              }}
            />
            {errors.phone && (
              <p className="text-destructive text-sm font-headline">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="craft"
            className="block font-mono text-m font-bold uppercase tracking-wider text-muted-foreground"
          >
            04. Hobby / Obsession{" "}
            <span className="text-destructive font-bold">*</span>
          </label>
          <input
            type="text"
            id="craft"
            name="craft"
            value={formData.craft}
            onChange={handleChange}
            className={`w-full bg-muted border-0 border-b-2 border-foreground/30 hover:border-b-primary focus:border-b-primary focus:outline-none px-4 py-3 font-sans transition-colors rounded-t text-foreground ${errors.craft ? "border-b-destructive" : ""}`}
            placeholder=""
          />
          {errors.craft && (
            <p className="text-destructive text-sm font-headline">
              {errors.craft}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="links"
            className="block font-mono text-m font-bold uppercase tracking-wider text-muted-foreground"
          >
            05. Socials / Portfolio
          </label>
          <input
            id="links"
            name="links"
            value={formData.links}
            onChange={handleChange}
            className="w-full bg-muted border-0 border-b-2 border-foreground/30 hover:border-b-primary focus:border-b-primary focus:outline-none px-4 py-3 font-sans transition-colors rounded-t text-foreground resize-none"
          />
        </div>
      </div>

      <div className="pt-6 relative group inline-block w-full">
        <div className="absolute inset-0 bg-primary/20 scale-y-75 scale-x-95 translate-y-2 translate-x-1 blur-md -rotate-1 transition-all group-hover:blur-xl group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-1"></div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="relative w-full bg-primary border-2 border-primary text-primary-foreground py-5 font-mono font-bold text-lg tracking-widest uppercase transition-all duration-300 hover:bg-primary/90 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_currentColor] hover:shadow-[2px_2px_0px_0px_currentColor] hover:translate-y-0.5 hover:translate-x-0.5 group/btn"
        >
          <div className="absolute top-0 -left-full w-1/2 h-full bg-linear-to-r from-transparent via-primary-foreground/30 to-transparent group-hover/btn:left-[200%] transition-all duration-1000"></div>
          {status === "submitting" ? (
            <span className="flex items-center gap-2 animate-pulse text-primary-foreground">
              TRANSMITTING...
            </span>
          ) : (
            <>
              <span className="tracking-[0.2em] relative z-10">JOIN_US</span>
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300 relative z-10" />
            </>
          )}
        </button>
        {status === "error" && (
          <p className="text-destructive text-sm font-headline mt-4 text-center">
            Error transmitting signal.
          </p>
        )}
      </div>
    </form>
  );
}
