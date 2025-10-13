import React from 'react';

/**
 * Props for the ProgressBar component.
 * @interface
 */
interface ProgressBarProps {
  /** The progress percentage, from 0 to 100. */
  progress: number;
}

/**
 * A simple, reusable component to display a visual progress bar.
 * It shows the completion percentage of the active roadmap and is accessible.
 * @param {ProgressBarProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered ProgressBar component.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const roundedProgress = Math.round(progress);

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-brand-text-primary">Roadmap Progress</span>
        <span className="text-sm font-bold text-brand-accent">{roundedProgress}%</span>
      </div>
      <div className="w-full bg-brand-primary border border-brand-border rounded-full h-2.5" role="progressbar" aria-valuenow={roundedProgress} aria-valuemin={0} aria-valuemax={100}>
        <div 
          className="bg-brand-accent h-2 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${roundedProgress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;