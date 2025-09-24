import { useState } from "react";

export default function PublicationForm() {
  const [form, setForm] = useState({
    title: "",
    authors: "",
    year: "",
    journal: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Split authors input (comma separated)
      const authorNames = form.authors.split(",").map((a) => a.trim());

      const authorIds = [];
      for (const fullName of authorNames) {
        // Support middle names: take last word as lastName, rest as firstName
        const parts = fullName.split(" ");
        const lastName = parts.pop();
        const firstName = parts.join(" ");

        const res = await fetch(
          `http://localhost:8080/api/v1/faculty/id/by-name?firstName=${encodeURIComponent(
            firstName
          )}&lastName=${encodeURIComponent(lastName)}`
        );

        if (!res.ok) {
          throw new Error(`Author lookup failed for ${fullName}`);
        }

        const data = await res.json();
        if (data?.success && data.facultyId) {
          authorIds.push(data.facultyId);
        } else {
          throw new Error(`No ID found for ${fullName}`);
        }
      }

      // Submit publication with faculty IDs
      const pubRes = await fetch("http://localhost:8080/api/v1/publication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          authors: authorIds,
        }),
      });

      if (pubRes.ok) {
        alert("Publication added successfully!");
        setForm({ title: "", authors: "", year: "", journal: "" });
      } else {
        alert("Error adding publication");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Add Publication</h2>

      <input
        type="text"
        name="title"
        placeholder="Title"
        value={form.title}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="authors"
        placeholder="Authors (comma separated: e.g. John Doe, Jane Smith)"
        value={form.authors}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="number"
        name="year"
        placeholder="Year"
        value={form.year}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="journal"
        placeholder="Journal"
        value={form.journal}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Submit
      </button>
    </form>
  );
}
