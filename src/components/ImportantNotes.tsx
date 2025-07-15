export const ImportantNotes = () => {
  return (
    <div className="mt-6 text-sm text-gray-600">
      <p className="font-semibold">Important Notes:</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>This projection uses Monte Carlo simulation with 1,000 scenarios to model market uncertainty</li>
        <li>Returns are assumed to follow a normal distribution with your specified mean and volatility</li>
        <li>Real-world returns may have different distributions (fat tails, correlation with economic cycles)</li>
        <li>Inflation is not factored into these calculations</li>
        <li>Past performance does not guarantee future results</li>
        <li>Consult a financial advisor for personalized retirement planning</li>
      </ul>
    </div>
  );
};