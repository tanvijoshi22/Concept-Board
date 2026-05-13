'use client';

const STEPS = [
  { id: 1, label: 'Analysing your brief', sub: 'Understanding product, users, and market context' },
  { id: 2, label: 'Generating concept directions', sub: 'Coining names, keywords, and visual archetypes' },
  { id: 3, label: 'Building mood boards', sub: 'Finding atmospheric image references for each direction' },
  { id: 4, label: 'Deriving color & typography', sub: 'Translating concepts into buildable foundations' },
  { id: 5, label: 'Finalising directions', sub: 'Bundling both concept cards for you' },
];

interface LoadingScreenProps {
  currentStep?: number;
  completedSteps?: number[];
}

export default function LoadingScreen({ currentStep = 1, completedSteps = [] }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-12 px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 65%)',
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 space-y-10 max-w-sm w-full">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Multi-agent pipeline</p>
          <p
            className="text-xl text-zinc-200"
            style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic' }}
          >
            Building your concept directions
          </p>
        </div>

        <div className="space-y-3">
          {STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isActive = currentStep === step.id && !isDone;
            const isPending = !isDone && !isActive;

            return (
              <div
                key={step.id}
                className={`flex items-start gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-accent/8 border border-accent/20' :
                  isDone ? 'opacity-60' : 'opacity-30'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5 size-5 flex items-center justify-center">
                  {isDone ? (
                    <svg className="size-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <span className="size-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  ) : (
                    <span className="size-2 rounded-full bg-zinc-700" />
                  )}
                </div>

                {/* Text */}
                <div className="space-y-0.5 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${isActive ? 'text-zinc-100' : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {step.label}
                  </p>
                  {(isActive || isDone) && (
                    <p className={`text-xs leading-relaxed ${isActive ? 'text-zinc-500' : 'text-zinc-700'}`}>
                      {step.sub}
                    </p>
                  )}
                </div>

                {/* Step number */}
                {isPending && (
                  <span className="ml-auto text-xs text-zinc-700 flex-shrink-0">{step.id}</span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-zinc-700">
          4 specialist agents · ~10–15 seconds
        </p>
      </div>
    </div>
  );
}
