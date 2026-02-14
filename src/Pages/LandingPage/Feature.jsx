export default function Feature() {
    const features = [
      {
        icon: "👤",
        title: "Personalized Profiles",
        description: "Create and manage your personal health profile with ease.",
      },
      {
        icon: "🩺",
        title: "Symptom Tracking",
        description: "Easily track and log your symptoms for accurate analysis.",
      },
      {
        icon: "💊",
        title: "Medication Management",
        description: "Keep track of your prescriptions and receive timely reminders.",
      },
      {
        icon: "📊",
        title: "Health Analytics",
        description: "Get detailed insights into your health trends over time.",
      },
      {
        icon: "✨",
        title: "AI Recommendations",
        description: "Receive personalized recommendations for your health concerns.",
      },
      {
        icon: "❤️",
        title: "Wellness Tips",
        description: "Receive expert tips and advice to maintain your health.",
      },
    ];
  
    return (
      <section id="features" className=" py-15 md:py-20 px-10 md:px-20">
        <div className=" container flex flex-col justify-center items-center mt-10">
            <div className="md:text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white">Features that will amaze you</h2>
        <p className="text-grey-500 mt-2 mb-8">
          Arogya is packed with features that help you get the right medications for your symptoms.
        </p>

            </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-4xl mx-auto mt-5">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start justify-center space-x-4 rounded-xl border-2 border-white/15 p-2">
              <span className="text-[#1FBCF9] text-2xl">{feature.icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-[#1FBCF9]">{feature.title}</h3>
                <p className="text-white">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        </div>
      </section>
    );
  }
  