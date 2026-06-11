import { z } from "zod";
import { regions } from "@/lib/site";
import type { NewMessage } from "@/lib/data/types";

export type FieldType = "text" | "email" | "tel" | "textarea" | "select";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  help?: string;
  colSpan?: 1 | 2;
};

export type StepDef = {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
  schema: z.ZodObject<z.ZodRawShape>;
};

export type FormConfig = {
  id: string;
  title: string;
  intro: string;
  steps: StepDef[];
  submitLabel: string;
  successTitle: string;
  successText: string;
  /** Subject line used when emailing the submission. */
  subject: string;
  /**
   * Fields force-applied to the built message on submit (e.g. a fixed
   * `category` or `channel`). Used by scoped forms like an individual NDC's
   * enquiry form. Merged last, so it overrides values inferred from inputs.
   */
  fixed?: Partial<NewMessage>;
  /** Extra context appended to the message body (e.g. which NDC / region). */
  contextNote?: string;
};

const regionOptions = regions.map((r) => ({
  label: `Region ${r.id} — ${r.name}`,
  value: `Region ${r.id}`,
}));

const contactName = z.string().min(2, "Please enter your full name");
const email = z.string().email("Enter a valid email address");
const phoneOptional = z
  .string()
  .optional()
  .refine((v) => !v || v.replace(/\D/g, "").length >= 6, "Enter a valid phone number");

/* ───────────────────────── Report a Problem ───────────────────────── */
export const reportProblemConfig: FormConfig = {
  id: "report-problem",
  title: "Report a Local Problem",
  intro:
    "Tell us about a road, drainage, sanitation or other community issue. Your report is routed to the relevant local authority.",
  subject: "New local problem report",
  submitLabel: "Submit report",
  successTitle: "Report received",
  successText:
    "Thank you. Your report has been logged and will be directed to the relevant local authority. Keep your reference for follow-up.",
  steps: [
    {
      id: "issue",
      title: "The issue",
      description: "What is happening and how serious is it?",
      fields: [
        {
          name: "category",
          label: "Type of issue",
          type: "select",
          options: [
            "Roads & bridges",
            "Drainage & flooding",
            "Sanitation & solid waste",
            "Street lighting",
            "Water supply",
            "Markets & public spaces",
            "Other",
          ].map((v) => ({ label: v, value: v })),
        },
        {
          name: "urgency",
          label: "Urgency",
          type: "select",
          options: ["Low", "Medium", "High", "Emergency / safety risk"].map((v) => ({
            label: v,
            value: v,
          })),
        },
        {
          name: "description",
          label: "Describe the problem",
          type: "textarea",
          placeholder: "What is the issue, since when, and any safety risk to residents?",
          colSpan: 2,
        },
      ],
      schema: z.object({
        category: z.string().min(1, "Select a type of issue"),
        urgency: z.string().min(1, "Select an urgency level"),
        description: z.string().min(15, "Please describe the problem (at least 15 characters)"),
      }),
    },
    {
      id: "location",
      title: "Location",
      description: "Where is the problem? Be as specific as possible.",
      fields: [
        { name: "region", label: "Region", type: "select", options: regionOptions },
        { name: "community", label: "Community / village", type: "text", placeholder: "e.g. Buxton" },
        {
          name: "landmark",
          label: "Nearest landmark or address",
          type: "text",
          placeholder: "Street, lot number or nearby landmark",
          colSpan: 2,
        },
      ],
      schema: z.object({
        region: z.string().min(1, "Select a region"),
        community: z.string().min(2, "Enter the community or village"),
        landmark: z.string().optional(),
      }),
    },
    {
      id: "contact",
      title: "Your details",
      description: "So the authority can follow up if needed.",
      fields: [
        { name: "name", label: "Full name", type: "text" },
        { name: "phone", label: "Phone (optional)", type: "tel" },
        { name: "email", label: "Email", type: "email", colSpan: 2 },
      ],
      schema: z.object({
        name: contactName,
        phone: phoneOptional,
        email,
      }),
    },
  ],
};

/* ───────────────────────── Vendor & Supplier ───────────────────────── */
export const vendorEnquiryConfig: FormConfig = {
  id: "vendor-enquiry",
  title: "Vendor & Supplier Enquiry",
  intro:
    "For businesses interested in procurement opportunities, supplier registration or payment queries with the Ministry.",
  subject: "New vendor / supplier enquiry",
  submitLabel: "Send enquiry",
  successTitle: "Enquiry sent",
  successText:
    "Thank you. Your enquiry has been received by the Ministry's procurement team and will be reviewed shortly.",
  steps: [
    {
      id: "company",
      title: "Your company",
      fields: [
        { name: "company", label: "Company / business name", type: "text", colSpan: 2 },
        {
          name: "businessType",
          label: "Business type",
          type: "select",
          options: [
            "Goods supplier",
            "Service provider",
            "Contractor / construction",
            "Consultancy",
            "Other",
          ].map((v) => ({ label: v, value: v })),
        },
        {
          name: "registration",
          label: "Business registration no. (optional)",
          type: "text",
        },
      ],
      schema: z.object({
        company: z.string().min(2, "Enter your company name"),
        businessType: z.string().min(1, "Select a business type"),
        registration: z.string().optional(),
      }),
    },
    {
      id: "enquiry",
      title: "Your enquiry",
      fields: [
        {
          name: "interest",
          label: "I'm enquiring about",
          type: "select",
          options: [
            "Current tender opportunities",
            "Supplier registration",
            "Payment / invoice query",
            "General procurement information",
            "Other",
          ].map((v) => ({ label: v, value: v })),
          colSpan: 2,
        },
        {
          name: "message",
          label: "Details",
          type: "textarea",
          placeholder: "Tell us what you need.",
          colSpan: 2,
        },
      ],
      schema: z.object({
        interest: z.string().min(1, "Select what you're enquiring about"),
        message: z.string().min(15, "Please add a little more detail"),
      }),
    },
    {
      id: "contact",
      title: "Contact details",
      fields: [
        { name: "name", label: "Contact name", type: "text" },
        { name: "phone", label: "Phone", type: "tel" },
        { name: "email", label: "Email", type: "email", colSpan: 2 },
      ],
      schema: z.object({
        name: contactName,
        phone: phoneOptional,
        email,
      }),
    },
  ],
};

/* ───────────────────────── Helpdesk / Contact ───────────────────────── */
export const helpdeskConfig: FormConfig = {
  id: "helpdesk",
  title: "Contact the Ministry",
  intro: "Send us a message and the right team will get back to you.",
  subject: "New helpdesk / contact message",
  submitLabel: "Send message",
  successTitle: "Message sent",
  successText:
    "Thank you for contacting the Ministry. We have received your message and will respond as soon as possible.",
  steps: [
    {
      id: "topic",
      title: "Topic",
      fields: [
        {
          name: "topic",
          label: "What is this about?",
          type: "select",
          options: [
            "General enquiry",
            "A neighbourhood / local council",
            "A service (permits, licences, rates)",
            "Laws & policies",
            "Complaint / feedback",
            "Media / press",
            "Other",
          ].map((v) => ({ label: v, value: v })),
          colSpan: 2,
        },
        { name: "subject", label: "Subject", type: "text", colSpan: 2 },
      ],
      schema: z.object({
        topic: z.string().min(1, "Select a topic"),
        subject: z.string().min(3, "Enter a subject"),
      }),
    },
    {
      id: "message",
      title: "Message",
      fields: [
        {
          name: "message",
          label: "Your message",
          type: "textarea",
          placeholder: "How can we help?",
          colSpan: 2,
        },
      ],
      schema: z.object({
        message: z.string().min(15, "Please enter your message"),
      }),
    },
    {
      id: "contact",
      title: "Your details",
      fields: [
        { name: "name", label: "Full name", type: "text" },
        { name: "phone", label: "Phone (optional)", type: "tel" },
        { name: "email", label: "Email", type: "email", colSpan: 2 },
      ],
      schema: z.object({
        name: contactName,
        phone: phoneOptional,
        email,
      }),
    },
  ],
};

export const formConfigs = {
  "report-problem": reportProblemConfig,
  "vendor-enquiry": vendorEnquiryConfig,
  helpdesk: helpdeskConfig,
} as const;

/* ───────────────────────── NDC enquiry (scoped) ───────────────────────── */
/**
 * Build a wizard config for a single Neighbourhood Democratic Council. The
 * submission lands in the admin inbox tagged "NDC — <name> (<region>)" and is
 * routed centrally for now (per the client). Same engine/look as every other
 * public form, so an NDC enquiry never feels like a one-off.
 */
export function makeNdcConfig(
  ndcName: string,
  region: string,
  regionName: string,
): FormConfig {
  return {
    id: `ndc-${region}`,
    title: `Contact the ${ndcName} NDC`,
    intro: `Send an enquiry to the ${ndcName} Neighbourhood Democratic Council. It is routed to the Ministry, who will respond.`,
    subject: `NDC enquiry — ${ndcName} (${region})`,
    submitLabel: "Send enquiry",
    successTitle: "Enquiry sent",
    successText: `Thank you. Your enquiry for the ${ndcName} NDC has been received and routed to the Ministry. You'll get a reply by email.`,
    fixed: { channel: "contact", category: `NDC — ${ndcName} (${region})` },
    contextNote: `Sent via the ${ndcName} NDC contact form (${region}, ${regionName}).`,
    steps: [
      {
        id: "enquiry",
        title: "Your enquiry",
        fields: [
          { name: "subject", label: "Subject", type: "text", colSpan: 2 },
          {
            name: "message",
            label: "Your message",
            type: "textarea",
            placeholder: `How can the ${ndcName} NDC help?`,
            colSpan: 2,
          },
        ],
        schema: z.object({
          subject: z.string().min(3, "Please add a short subject"),
          message: z.string().min(10, "Please enter your message"),
        }),
      },
      {
        id: "contact",
        title: "Your details",
        fields: [
          { name: "name", label: "Full name", type: "text" },
          { name: "phone", label: "Phone (optional)", type: "tel" },
          { name: "email", label: "Email", type: "email", colSpan: 2 },
        ],
        schema: z.object({
          name: contactName,
          phone: phoneOptional,
          email,
        }),
      },
    ],
  };
}
