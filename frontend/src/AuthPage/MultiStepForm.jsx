import { useState, useEffect } from "react";
import axios from "axios";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";

function MultiStepForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    bloodGroup: "",
    bmi: "",
    username: "",
    password: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    systolic: "",
    diastolic: "",
    bmi: "",
    bloodGroup: "",
    symptom: "",
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

  // BMI AUTO CALCULATE
  useEffect(() => {
    if (formData.height && formData.weight) {
      const h = formData.height / 100;
      const bmiValue = formData.weight / (h * h);
      setFormData((prev) => ({
        ...prev,
        bmi: bmiValue.toFixed(1),
      }));
    }
  }, [formData.height, formData.weight]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:3000/api/users/signup", formData);
      
      const userData = { ...formData, id: res.data.userId };
      sessionStorage.setItem("currentUser", JSON.stringify(userData));
      next();
    } catch (err) {
      alert("Error during signup. Username or Email may already exist.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {step === 1 && (
        <Step1 formData={formData} updateForm={updateForm} next={next} />
      )}
      {step === 2 && (
        <Step2
          formData={formData}
          updateForm={updateForm}
          next={next}
          back={back}
        />
      )}
      {step === 3 && (
        <Step3
          formData={formData}
          updateForm={updateForm}
          next={next}
          back={back}
        />
      )}
      {step === 4 && (
        <Step4
          formData={formData}
          updateForm={updateForm}
          submit={handleSubmit}
          back={back}
        />
      )}
      {step === 5 && <Step5 />}
    </div>
  );
}

export default MultiStepForm;
