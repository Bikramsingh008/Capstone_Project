import { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

function MultiStepForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    gender: "",
    age: "",
    weight: "",
    height: "",
    bloodGroup: "",
    symptom: [],
    symptomDuration: "",
    symptomIntensity: "",
    medicines: "",
    dosage: "",
    purpose: "",
    happinessLevel: "",
    feeling: "",
    stressLevel: "",
    sleepQuality: "",
  });

  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const updateForm = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = () => {
    localStorage.setItem("patientData", JSON.stringify(formData));
    next();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {step === 1 && <Step1 formData={formData} updateForm={updateForm} next={next} />}
      {step === 2 && <Step2 formData={formData} updateForm={updateForm} next={next} back={back} />}
      {step === 3 && <Step3 formData={formData} updateForm={updateForm} next={next} back={back} />}
      {step === 4 && <Step4 formData={formData} updateForm={updateForm} submit={handleSubmit} back={back} />}
      {step === 5 && <Step5 />}
    </div>
  );
}

export default MultiStepForm;
