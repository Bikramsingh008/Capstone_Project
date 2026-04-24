export default function Progress({ current }) {
  return (
    <div className="flex justify-center space-x-4">
      {[1, 2, 3, 4, 5].map((num) => (
        <div
          key={num}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            num === current
              ? "bg-[#1FBCF9] text-white"
              : "bg-gray-300 text-gray-600"
          }`}
        >
          {num}
        </div>
      ))}
    </div>
  );
}
