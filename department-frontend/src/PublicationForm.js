import { useState, useEffect } from "react";
import Select from "react-select"; // <-- Import react-select

export default function PublicationForm() {
  const [form, setForm] = useState({
    title: "",
    authors: [], // <-- Authors will now be an array of selected options
    year: "",
    journal: "",
  });

  // New state to hold the list of all faculty members for the dropdown
  const [facultyOptions, setFacultyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // To handle loading state

  // useEffect hook to fetch all faculty when the component loads
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:8080/api/v1/faculty");
        const data = await res.json();

        if (data.success) {
          // Format the fetched data for react-select: { value: 'someId', label: 'Some Name' }
          const options = data.faculties.map((faculty) => ({
            value: faculty._id,
            label: `${faculty.firstName} ${faculty.lastName}`,
          }));
          setFacultyOptions(options);
        }
      } catch (err) {
        console.error("Failed to fetch faculty:", err);
        alert("Could not load faculty list. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculty();
  }, []); // The empty dependency array [] means this runs once on mount

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Special handler for the react-select component
  const handleAuthorChange = (selectedOptions) => {
    setForm({ ...form, authors: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if any author is selected
    if (form.authors.length === 0) {
      alert("Please select at least one author.");
      return;
    }

    // Extract just the IDs from the selected author objects
    const authorIds = form.authors.map(author => author.value);

    try {
      const pubRes = await fetch("http://localhost:8080/api/v1/publication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          authors: authorIds, // <-- Send the array of IDs
        }),
      });

      if (pubRes.ok) {
        alert("Publication added successfully!");
        setForm({ title: "", authors: [], year: "", journal: "" });
      } else {
        const errorData = await pubRes.json();
        alert(`Error: ${errorData.message || 'Failed to add publication'}`);
      }
    } catch (err) {
      console.error(err);
      alert("A network error occurred.");
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

      {/* --- This is the new Dropdown --- */}
      <Select
        isMulti // Allows selecting multiple authors
        name="authors"
        options={facultyOptions}
        className="w-full mb-3"
        classNamePrefix="select"
        placeholder="Select Authors..."
        onChange={handleAuthorChange}
        value={form.authors}
        isLoading={isLoading}
        required
      />
      {/* --- End of new Dropdown --- */}

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