import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// eslint-disable-next-line no-unused-vars
const ResponsePopup = ({ text, color }) => {
  let icon;

  if (text.includes("High")) {
    icon = <CheckCircle2 className="w-10 h-10 text-white" />;
  } else if (text.includes("Moderate")) {
    icon = <AlertTriangle className="w-10 h-10 text-white" />;
  } else if (text.includes("Low")) {
    icon = <XCircle className="w-10 h-10 text-white" />;
  } else {
    icon = <Info className="w-10 h-10 text-white" />;
  }

  return (
    <div className="flex justify-center mt-6">
      <div
        className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 rounded-3xl shadow-2xl text-white p-4 sm:p-6 animate-slideUp"
        style={{
          backgroundColor: color,
        }}
      >
        <div className="flex items-center gap-4">
          <div className="bg-black/20 p-3 rounded-full">{icon}</div>
          <h2 className="text-xl sm:text-2xl font-bold">{text}</h2>
        </div>
      </div>
    </div>
  );
};

const PatientPrediction = ({ hospitals = [], physicians = [] }) => {
  const [formData, setFormData] = useState({
    patient_name: "",
    physician: "",
    hospital: "",
    age: 20,
    indication: "Leukemia",
    status: "Refractory",
    blast_percentage: 0,
    ipi_score: 2,
    disease_burden: "Non Bulky",
    relapse_timing: null,
  });

  const [prediction, setPrediction] = useState(null);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setPrediction(data);
    } catch (error) {
      console.error("Error predicting response:", error);
    }
  };

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-0">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 mb-4">
          Patient Response Prediction
        </h2>

        <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
          Predict patient's response likelihood based on their baseline
          characteristics. Response is categorized as{" "}
          <strong>High, Moderate, Low</strong> or{" "}
          <strong>Future Indication</strong>.
        </p>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disease Indication
              </label>
              <select
                value={formData.indication}
                onChange={(e) => updateForm("indication", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Leukemia">Leukemia</option>
                <option value="Lymphoma">Lymphoma</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient's Name
              </label>
              <input
                type="text"
                value={formData.patient_name}
                onChange={(e) => updateForm("patient_name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treating Physician
              </label>
              <select
                value={formData.physician}
                onChange={(e) => updateForm("physician", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Physician</option>
                {physicians.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Name
              </label>
              <select
                value={formData.hospital}
                onChange={(e) => updateForm("hospital", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select Hospital</option>
                {hospitals.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) =>
                  updateForm("age", parseInt(e.target.value) || 0)
                }
                min="0"
                max="120"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => {
                  const val = e.target.value;
                  updateForm("status", val);

                  if (formData.indication === "Lymphoma") {
                    if (val === "Relapsed <12 months") {
                      updateForm("relapse_timing", "Less than 1 year");
                    } else if (val === "Relapsed >12 months") {
                      updateForm("relapse_timing", "Greater than 1 year");
                    }
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Refractory">Refractory</option>
                {formData.indication === "Leukemia" ? (
                  <option value="Relapsed">Relapsed</option>
                ) : (
                  <>
                    <option value="Relapsed <12 months">
                      Relapsed &lt;12 months
                    </option>
                    <option value="Relapsed >12 months">
                      Relapsed &gt;12 months
                    </option>
                  </>
                )}
              </select>
            </div>
          </div>
          {formData.indication === "Leukemia" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blast Percentage (%)
              </label>
              <input
                type="number"
                value={formData.blast_percentage}
                onChange={(e) =>
                  updateForm(
                    "blast_percentage",
                    parseInt(e.target.value) || 0
                  )
                }
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          {formData.indication === "Lymphoma" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IPI Score (0-5)
                </label>
                <input
                  type="number"
                  value={formData.ipi_score}
                  onChange={(e) =>
                    updateForm("ipi_score", parseInt(e.target.value) || 0)
                  }
                  min="0"
                  max="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disease Burden
                </label>
                <select
                  value={formData.disease_burden}
                  onChange={(e) =>
                    updateForm("disease_burden", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Non Bulky">Non Bulky</option>
                  <option value="Bulky">Bulky</option>
                </select>
              </div>
            </div>
          )}
          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
          >
            Predict Patient Response
          </button>
        </div>
        {prediction && (
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">

            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div
              className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md sm:max-w-lg lg:max-w-xl w-full animate-scaleIn"
            >
              <div className="flex justify-center mb-6">
                <div
                  className="h-20 w-20 rounded-full flex items-center justify-center text-white font-bold text-3xl animate-pulseGlow"
                  style={{ backgroundColor: prediction.response_color }}
                >
                  ✓
                </div>
              </div>

              {/*<h2 className="text-xl sm:text-2xl font-extrabold text-center mb-4">
        Patient Response Likelihood
      </h2>*/}
              <p
                className="text-center text-lg sm:text-xl font-semibold"
                style={{ color: prediction.response_color }}
              >
                {prediction.response_text}
              </p>
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPrediction(null)}
                  className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
          References
        </h3>
        <div className="text-sm text-gray-700 space-y-3">
          <p><strong>Response to First Line Therapy</strong></p>
          <p className="ml-4">1. Sehn, L.H., & Gascoyne, R.D. (2015). Diffuse large B-cell lymphoma: optimizing outcome in the context of clinical and biologic heterogeneity. Blood, 125(1), 22-32.
            <a href="https://doi.org/10.1182/blood-2014-05-577189"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1182/blood-2014-05-577189 </a></p>
          <p className="ml-4">2. Coiffier, B. et al. (2002). CHOP chemotherapy plus rituximab compared with CHOP alone in elderly patients with diffuse large-B-cell lymphoma. N Engl J Med.
            <a href="https://doi.org/10.1056/NEJMoa020771"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1056/NEJMoa020771 </a></p>
        </div> <br />
        <div className="text-sm text-gray-700 space-y-3">
          <p><strong>Primary Refractory Rate</strong></p>
          <p className="ml-4">1. Friedberg JW. (2011). Relapsed/refractory diffuse large B-cell lymphoma. Hematology Am Soc Hematol Educ Program.
            <a href="https://doi.org/10.1182/asheducation-2011.1.498"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1182/asheducation-2011.1.498 </a></p>
        </div> <br />
        <div className="text-sm text-gray-700 space-y-3">
          <p><strong>Relapse Rates</strong></p>
          <p className="ml-4">1. Crump, M. et al. (2017). Outcomes in refractory diffuse large B-cell lymphoma: results from the SCHOLAR-1 study. Blood, 130(16), 1800–1808
            <a href="https://doi.org/10.1182/blood-2017-03-769620"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1182/blood-2017-03-769620 </a></p>
          <p className="ml-4">2. Maurer, M.J. et al. (2014). Event-free survival at 24 months is a robust end point for disease-related outcome in DLBCL. J Clin Oncol.
            <a href="https://doi.org/10.1200/JCO.2014.55.5242"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1200/JCO.2014.55.5242 </a></p>
        </div> <br />
        <div className="text-sm text-gray-700 space-y-3">
          <p><strong>IPI Risk Score Distribution</strong></p>
          <p className="ml-4">1. The International Non-Hodgkin’s Lymphoma Prognostic Factors Project. (1993). A predictive model for aggressive non-Hodgkin’s lymphoma. N Engl J Med.
            <a href="https://doi.org/10.1056/NEJM199309303291402"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1056/NEJM199309303291402 </a></p>
          <p className="ml-4">2. Ziepert, M. et al. (2010). An updated IPI for DLBCL in the R-CHOP era. Blood.
            <a href="https://doi.org/10.1182/blood-2010-06-291641"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1182/blood-2010-06-291641 </a></p>
        </div> <br />
        <div className="text-sm text-gray-700 space-y-3">
          <p><strong>Bulky Disease Prevalance</strong></p>
          <p className="ml-4">1. Cheson, B.D. (2007). Revised response criteria for malignant lymphoma. J Clin Oncol.
            <a href="https://doi.org/10.1200/JCO.2006.09.2403"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1200/JCO.2006.09.2403 </a></p>
          <p className="ml-4">2. Hitz, F. et al. (2018). Role of bulky disease in modern DLBCL treatment. Hematol Oncol.
            <a href="https://doi.org/10.1002/hon.2502"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            > https://doi.org/10.1002/hon.2502 </a></p>
        </div> <br />

      </div>
    </div>
  );
};

export default PatientPrediction;
