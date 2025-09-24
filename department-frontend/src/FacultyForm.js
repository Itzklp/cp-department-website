import { useState } from "react";

export default function FacultyForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    designation: "Prof.",
    researchArea: "",
    teaches: "",
    joiningDate: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/v1/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          researchArea: form.researchArea
            ? form.researchArea.split(",").map((a) => a.trim())
            : [],
          teaches: form.teaches
            ? form.teaches.split(",").map((a) => a.trim())
            : [],
        }),
      });

      if (res.ok) {
        alert("Faculty added successfully!");
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          department: "",
          designation: "Prof.",
          researchArea: "",
          teaches: "",
          joiningDate: "",
        });
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Error adding faculty");
      }
    } catch (err) {
      alert("Network error");
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md"
    >
      <h2 className="text-xl font-bold mb-4">Add Faculty</h2>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={form.firstName}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={form.lastName}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
        required
      />

      <input
        type="text"
        name="designation"
        placeholder="Designation (e.g. Prof.)"
        value={form.designation}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="text"
        name="researchArea"
        placeholder="Research Areas (comma separated)"
        value={form.researchArea}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="text"
        name="teaches"
        placeholder="Courses Teaches (comma separated)"
        value={form.teaches}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="date"
        name="joiningDate"
        value={form.joiningDate}
        onChange={handleChange}
        className="w-full mb-3 p-2 border rounded"
      />

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Submit
      </button>
    </form>
  );
}
