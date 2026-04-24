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

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Create Your Account</h2>
        </div>

        <Progress current={1} />

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => updateForm({ username: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email || ""}
          onChange={(e) => updateForm({ email: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone || ""}
          onChange={(e) => updateForm({ phone: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => updateForm({ password: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Age */}
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(e) => updateForm({ age: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Weight */}
        <input
          type="number"
          placeholder="Weight (kg)"
          value={formData.weight}
          onChange={(e) => updateForm({ weight: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Height */}
        <input
          type="number"
          placeholder="Height (cm)"
          value={formData.height}
          onChange={(e) => updateForm({ height: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        />

        {/* Blood Group */}
        <select
          value={formData.bloodGroup}
          onChange={(e) => updateForm({ bloodGroup: e.target.value })}
          className="w-full p-3 rounded-md bg-black border border-gray-600"
        >
          <option value="">Select Blood Group</option>
          {bloodGroups.map((bg) => (
            <option key={bg} value={bg}>
              {bg}
            </option>
          ))}
        </select>

        {/* Gender */}
        <div className="grid grid-cols-3 gap-4">
          {["Male", "Female", "Other"].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => updateForm({ gender: g })}
              className={`py-3 rounded-md ${
                formData.gender === g
                  ? "bg-white text-black"
                  : "bg-[#1FBCF9]/80"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Blood Pressure */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Systolic (120)"
            value={formData.systolic}
            onChange={(e) => updateForm({ systolic: e.target.value })}
            className="p-3 rounded-md bg-black border border-gray-600"
          />
          <input
            type="number"
            placeholder="Diastolic (80)"
            value={formData.diastolic}
            onChange={(e) => updateForm({ diastolic: e.target.value })}
            className="p-3 rounded-md bg-black border border-gray-600"
          />
        </div>

        {/* Show BMI */}
        {formData.bmi && (
          <p className="text-sm text-gray-400">
            Calculated BMI: {formData.bmi}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={next}
            className="px-6 py-2 bg-[#1FBCF9] rounded-md"
          >
            Next
          </button>
        </div>

      </div>
    </div>
  );
}