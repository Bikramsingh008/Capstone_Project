import Progress from "./Progress";

export default function Step4({ formData, updateForm, submit, back }) {
  return (
    <div className="p-10 flex justify-center">
      <div className="container max-w-4xl space-y-8">

        <div className="text-center">
          <h2 className="text-2xl font-bold">Complete your profile</h2>
        </div>

        <Progress current={4} />

        {/* Happiness */}
        <div>
          <p className="mb-2 font-medium">How happy are you today?</p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[...Array(10)].map((_, i) => {
              const val = i + 1;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateForm({ happinessLevel: val })}
                  className={`p-2 rounded border ${
                    formData.happinessLevel === val
                      ? "bg-[#1FBCF9]"
                      : "border-gray-500"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mood */}
        <div>
          <p className="mb-2 font-medium">How do you feel today?</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {["Happy", "Sad", "Angry", "Anxious", "Stressed", "Neutral"].map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => updateForm({ feeling: mood })}
                className={`p-2 rounded border ${
                  formData.feeling === mood
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Stress */}
        <div>
          <p className="mb-2 font-medium">Stress Level</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {["Not Stressed", "Slightly", "Moderately", "Highly", "Extremely"].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => updateForm({ stressLevel: level })}
                className={`p-2 rounded border ${
                  formData.stressLevel === level
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep */}
        <div>
          <p className="mb-2 font-medium">Sleep Quality</p>
          <div className="grid grid-cols-3 gap-2">
            {["Good", "Average", "Bad"].map((quality) => (
              <button
                key={quality}
                type="button"
                onClick={() => updateForm({ sleepQuality: quality })}
                className={`p-2 rounded border ${
                  formData.sleepQuality === quality
                    ? "bg-[#1FBCF9]"
                    : "border-gray-500"
                }`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>

        <div className="flex">
          <button onClick={back} className="px-4 py-2 bg-gray-600 rounded">
            Back
          </button>
          <button onClick={submit} className="ml-auto px-4 py-2 bg-[#1FBCF9] rounded">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
