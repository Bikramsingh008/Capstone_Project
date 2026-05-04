import Progress from "./Progress";
import { Activity } from "lucide-react"; 

{/* Logo */}
        <div className="flex justify-center items-center gap-2">
          <Activity size={40} color="#1FBCF9" />
          <h1 className="text-3xl font-semibold">Arogya</h1>
        </div>
        

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Complete your profile</h2>
          <p className="text-sm text-gray-400">
            Please provide the following information
          </p>
        </div>

const symptoms = [
  "Headache", "Nausea", "Vomiting", "Diarrhea",
  "Fatigue", "Insomnia", "Constipation",
  "Muscle Pain", "Joint Pain", "Other"
];

const frequencyOptions = ["Daily", "Weekly", "Monthly", "Rarely"];
const intensityLevels = Array.from({ length: 10 }, (_, i) => i + 1);

export default function Step2({ formData, updateForm, next, back }) {
  return (
    <div className="p-10 flex justify-center">
      <div className="container max-w-4xl space-y-8">

        <div className="text-center">
          <h2 className="text-2xl font-bold">Complete your profile</h2>
        </div>

        <Progress current={2} />

        {/* Symptom */}
        <div>
          <p className="mb-2 font-medium">What symptom are you experiencing?</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {symptoms.map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => {
                  const currentSymptoms = formData.symptoms || [];
                  const newSymptoms = currentSymptoms.includes(sym)
                    ? currentSymptoms.filter((s) => s !== sym)
                    : [...currentSymptoms, sym];
                  updateForm({ symptoms: newSymptoms });
                }}
                className={`p-2 rounded border ${
                  formData.symptoms?.includes(sym)
                    ? "bg-[#1FBCF9] text-white border-[#1FBCF9]"
                    : "border-gray-500 text-gray-300"
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <p className="mb-2 font-medium">How often?</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {frequencyOptions.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => updateForm({ symptomDuration: freq })}
                className={`p-2 rounded border ${
                  formData.symptomDuration === freq
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <p className="mb-2 font-medium">How intense?</p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {intensityLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateForm({ symptomIntensity: level })}
                className={`p-2 rounded border ${
                  formData.symptomIntensity === level
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex">
          <button onClick={back} className="px-4 py-2 bg-gray-600 rounded">
            Back
          </button>
          <button onClick={next} className="ml-auto px-4 py-2 bg-[#1FBCF9] rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
