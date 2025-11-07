import React, { useState } from "react";
import Papa from "papaparse";
import { createProject, uploadCSV, startProject } from "../lib/api";

export default function AddProjectModal({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [timeGap, setTimeGap] = useState(60);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessSecret, setAccessSecret] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreate = async () => {
    setError("");
    setSuccess("");

    // ✅ Validation
    if (
      !name ||
      !timeGap ||
      !apiKey ||
      !apiSecret ||
      !accessToken ||
      !accessSecret ||
      !csvFile
    ) {
      setError("Please fill all fields and upload a CSV file.");
      return;
    }

    try {
      setLoading(true);
      const res = await createProject({
        name,
        timeGapMinutes: Number(timeGap),
        twitterApiKey: apiKey,
        twitterApiSecret: apiSecret,
        twitterAccessToken: accessToken,
        twitterAccessSecret: accessSecret,
      });

      const project = res.data;

      const fd = new FormData();
      fd.append("file", csvFile);
      const uploadRes = await uploadCSV(project._id, fd);

      const count = uploadRes.data.inserted || 0;
      await startProject(project._id);

      setSuccess(`✅ ${count} posts added for project '${project.name}'`);
      setTimeout(() => setOpen(false), 2000); // auto close after success
      onCreated();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="bg-sky-600 text-white px-4 py-2 rounded-lg"
        onClick={() => setOpen(true)}
      >
        + Add Project
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-[720px] shadow-lg">
            <h2 className="text-xl font-semibold">Create Project</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                className="p-2 border rounded"
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <select
                className="p-2 border rounded"
                value={timeGap}
                onChange={(e) => setTimeGap(e.target.value)}
              >
                <option value="">Select Time Gap</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 1 hour</option>
                <option value="120">Every 2 hours</option>
                <option value="240">Every 4 hours</option>
              </select>

              <input
                className="p-2 border rounded"
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <input
                className="p-2 border rounded"
                placeholder="API Secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
              <input
                className="p-2 border rounded"
                placeholder="Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <input
                className="p-2 border rounded"
                placeholder="Access Secret"
                value={accessSecret}
                onChange={(e) => setAccessSecret(e.target.value)}
              />
              <div className="col-span-2">
                <label className="block text-sm">
                  CSV (one column: content)
                </label>
                <input
                  type="file"
                  accept="text/csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                />
              </div>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-600 mt-2">{success}</p>}

            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button
                disabled={loading}
                className="px-4 py-2 bg-sky-600 text-white rounded flex items-center justify-center gap-2"
                onClick={handleCreate}
              >
                {loading ? "Creating..." : "Create & Start"}
              </button>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                <div className="animate-spin h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
