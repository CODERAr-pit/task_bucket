import React, { useState } from "react";
import './TaskForm.css';

const initialFormState = {
  title: "",
  domain: "",
  description: "",
  assignedTo: [],
  assignedBy: "",
  dueDate: "",
};

const domainOptions = [
  "Graphic Design",
  "Web Development",
  "Content Writing",
  "Video Editing",
  "All",
];

const juniorOptions = [
  "Junior A",
  "Junior B",
  "Junior C",
];

const CreateTaskForm = () => {
  const [form, setForm] = useState(initialFormState);
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      setForm((prev) => ({
        ...prev,
        [name]: Array.from(selectedOptions, (option) => option.value)
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // You can add validation here
    console.log("Form submitted:", form);
    setSubmitted(true);
    // setForm(initialFormState); // Uncomment to reset form on submit
  }

  return (
    <div className="create-task-container">
      <h2>CREATE TASK</h2>
      <form className="create-task-form" onSubmit={handleSubmit}>
        <label>
          TITLE
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          DOMAIN
          <select
            name="domain"
            value={form.domain}
            onChange={handleChange}
            required
          >
            <option value="">Select Domain</option>
            {domainOptions.map((domain) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </label>

        <label>
          DESCRIPTION
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            required
          />
        </label>

        <label>
          ASSIGNED TO (Hold Ctrl/Cmd to select multiple)
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            required
            multiple
          >
            {juniorOptions.map((junior) => (
              <option key={junior} value={junior}>{junior}</option>
            ))}
          </select>
        </label>

        <label>
          ASSIGNED BY
          <input
            name="assignedBy"
            value={form.assignedBy}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          DUE DATE
          <input
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            type="date"
            required
          />
        </label>

        <button type="submit">submit</button>
      </form>
      {submitted && (
        <p className="task-success-message">Task created!</p>
      )}
    </div>
  );
};

export { CreateTaskForm };
