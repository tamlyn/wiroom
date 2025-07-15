import { CollapsibleSection } from "./CollapsibleSection";

export const ImportantNotes = () => {
  return (
    <CollapsibleSection title="Important Notes & Assumptions">
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          • This projection uses Monte Carlo simulation with 1,000 scenarios
        </p>
        <p>• Returns are assumed to follow a normal distribution</p>
        <p>• Real-world returns may have different distributions</p>
        <p>• Inflation is not factored into these calculations</p>
        <p>• Past performance does not guarantee future results</p>
        <p>• Consult a financial advisor for personalized planning</p>
      </div>
    </CollapsibleSection>
  );
};
