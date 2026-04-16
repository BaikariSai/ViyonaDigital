import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 Replace these
const supabase = createClient(
  "https://sowtktxjkrwratqgfgkc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvd3RrdHhqa3J3cmF0cWdmZ2tjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTI1MzQsImV4cCI6MjA5MTY4ODUzNH0.REY-XdgXAJjZXzHLt2T2qLILkCRkTcckj54DfJx3MN8"
);

window.onload = () => {
  const form = document.getElementById("contactForm");

  if (!form) {
    console.error("Form not found ❌");
    return;
  }

  console.log("Form connected ✅");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 🔥 Direct value extraction (NO FormData issues)
    const name = form.querySelector('[name="name"]').value.trim();
    const mobile = form.querySelector('[name="mobile"]').value.trim();
    const company = form.querySelector('[name="company"]').value.trim();
    const service = form.querySelector('[name="service"]').value;
    const contact = form.querySelector('[name="contact"]:checked')?.value || "";
    const message = form.querySelector('[name="message"]').value.trim();

    console.log({ name, mobile, company, service, contact, message });

    // 🚨 basic validation
    if (!name || !mobile || !service || !contact) {
      alert("Please fill all required fields ⚠️");
      return;
    }

    const { error } = await supabase.from("leads").insert([
      {
        name,
        mobile,
        company,
        service,
        preferred_contact: contact,
        message
      }
    ]);

    if (error) {
      console.error(error);
      alert("❌ Failed to submit");
    } else {
      alert("✅ Message sent!");
      form.reset();
    }
  });
};
