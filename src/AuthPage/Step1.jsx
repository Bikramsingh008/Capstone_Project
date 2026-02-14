import Progress from "./Progress";
import { Activity } from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function Step1({ formData, updateForm, next }) {
  return (
    <div className="min-h-screen bg-black text-white flex justify-center pt-10">
      <div className="w-full max-w-5xl space-y-8">

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

        {/* Progress */}
        <Progress current={1} />

        {/* Gender */}
        <div>
          <p className="mb-3 font-medium">Specify your gender</p>
          <div className="grid grid-cols-3 gap-4">
            {["Male", "Female", "Other"].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => updateForm({ gender: g })}
                className={`py-3 rounded-md transition ${
                  formData.gender === g
                    ? "bg-[#ebf0f2] text-black"
                    : "bg-[#1FBCF9]/80 text-white hover:bg-[#1FBCF9]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Weight */}
          <div>
            <p className="mb-2 text-sm font-medium">Weight (kg)</p>
            <input
              type="number"
              placeholder="e.g. 45"
              value={formData.weight}
              onChange={(e) => updateForm({ weight: e.target.value })}
              className="w-full p-3 rounded-md bg-black border border-gray-600 focus:outline-none focus:border-[#1FBCF9]"
            />
          </div>

          {/* Height */}
          <div>
            <p className="mb-2 text-sm font-medium">Height (cm)</p>
            <input
              type="number"
              placeholder="e.g. 160"
              value={formData.height}
              onChange={(e) => updateForm({ height: e.target.value })}
              className="w-full p-3 rounded-md bg-black border border-gray-600 focus:outline-none focus:border-[#1FBCF9]"
            />
          </div>

          {/* Age */}
          <div>
            <p className="mb-2 text-sm font-medium">What is your age?</p>
            <input
              type="number"
              placeholder="e.g. 18"
              value={formData.age}
              onChange={(e) => updateForm({ age: e.target.value })}
              className="w-full p-3 rounded-md bg-black border border-gray-600 focus:outline-none focus:border-[#1FBCF9]"
            />
          </div>

          {/* Blood Group */}
          <div>
            <p className="mb-2 text-sm font-medium">Your blood group</p>
            <select
              value={formData.bloodGroup}
              onChange={(e) => updateForm({ bloodGroup: e.target.value })}
              className="w-full p-3 rounded-md bg-[#1FBCF9] text-white focus:outline-none"
            >
              <option value="">Select blood group</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={next}
            className="px-6 py-2 bg-[#1FBCF9] rounded-md hover:bg-[#19a7e0] transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
