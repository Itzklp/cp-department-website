import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FacultyForm from "./FacultyForm";
import PublicationForm from "./PublicationForm";

function App() {
  return (
    <Router>
      <div className="max-w-2xl mx-auto p-6">
        {/* Navigation */}
        <nav className="mb-6 flex gap-4">
          <Link to="/faculty" className="text-blue-600 hover:underline">Add Faculty</Link>
          <Link to="/publication" className="text-blue-600 hover:underline">Add Publication</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/faculty" element={<FacultyForm />} />
          <Route path="/publication" element={<PublicationForm />} />
          <Route path="/" element={<FacultyForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
