import Progress from "./Progress";
import { Activity } from "lucide-react";

{/* Logo */ }
<div className="flex justify-center items-center gap-2">
  <Activity size={40} color="#1FBCF9" />
  <h1 className="text-3xl font-semibold">Arogya</h1>
</div>


{/* Header */ }
<div className="text-center space-y-2">
  <h2 className="text-2xl font-bold">Complete your profile</h2>
  <p className="text-sm text-gray-400">
    Please provide the following information
  </p>
</div>

const frequencyOptions = ["Daily", "Weekly", "Monthly", "Rarely"];
const adherenceOptions = ["Always", "Often", "Sometimes", "Rarely", "Never"];

export default function Step3({ formData, updateForm, next, back }) {
  return (
    <div className="p-10 flex justify-center">
      <div className="container max-w-4xl space-y-8">

        <div className="text-center">
          <h2 className="text-2xl font-bold">Complete your profile</h2>
        </div>

        <Progress current={3} />

        {/* Medicines */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Medicine Name"
            className="p-2 rounded bg-black border border-gray-600"
            onChange={(e) => updateForm({ medicines: e.target.value })}
          />
          <input
            type="text"
            placeholder="Dosage"
            className="p-2 rounded bg-black border border-gray-600"
            onChange={(e) => updateForm({ dosage: e.target.value })}
          />
        </div>

        <textarea
          placeholder="Purpose of medication"
          className="p-2 rounded bg-black border border-gray-600 w-full"
          onChange={(e) => updateForm({ purpose: e.target.value })}
        />

        {/* Frequency */}
        <div>
          <p className="mb-2 font-medium">How often do you take it?</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {frequencyOptions.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => updateForm({ intakeFrequency: freq })}
                className={`p-2 rounded border ${formData.intakeFrequency === freq
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                  }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        {/* Adherence */}
        <div>
          <p className="mb-2 font-medium">Do you follow prescription?</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {adherenceOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => updateForm({ prescriptionAdherence: opt })}
                className={`p-2 rounded border ${formData.prescriptionAdherence === opt
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                  }`}
              >
                {opt}
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
