import { useEffect, useState } from "react";
import { decryptField } from "./utils/decryptFields";

function App() {
  const [fields, setFields] = useState([]);
  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    async function getFields() {
      try {
        const res = await fetch("http://localhost:3000/api/form");

        const encFields = await res.json();
        const decryptedFields = encFields
          .map((field) => decryptField(field))
          .filter((field) => field !== null);
        console.log(decryptedFields);
        setFields(decryptedFields);
      } catch (error) {
        console.error("Fetch error:", error.message);
      }
    }

    getFields();
  }, []);

  async function handleBlur(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (index + 1 < fields.length) {
      setIndex((index) => index + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch("http://localhost:3000/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        await res.json();
      } catch (err) {
        console.log(err);
      } finally {
        setIsSubmitting(false);
        setSubmitted(true);
      }
    }
  }

  if (fields.length === 0 || index >= fields.length)
    return <p>No valid Fields were sent</p>;
  const { label, type } = fields[index];

  return (
    <div>
      {!isSubmitting && !submitted && (
        <>
          <label>{label.toUpperCase()}</label>
          <input
            key={label}
            name={label}
            type={type}
            onBlur={handleBlur}
            autoFocus
          />
        </>
      )}
      {isSubmitting && !submitted && <p>Form is submitting</p>}
      {!isSubmitting && submitted && <p>Form Submitted successfully</p>}
    </div>
  );
}

export default App;
