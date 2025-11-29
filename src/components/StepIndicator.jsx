function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex justify-center gap-1 py-2 bg-gray-50">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`step-dot ${
            index === currentStep 
              ? 'active' 
              : index < currentStep 
                ? 'completed' 
                : 'pending'
          }`}
        />
      ))}
    </div>
  )
}

export default StepIndicator
