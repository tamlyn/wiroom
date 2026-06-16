import { TabType } from "../types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  const tabs = [
    { id: "current" as TabType, label: "Current Situation" },
    { id: "uncertainty" as TabType, label: "Market Assumptions" },
    { id: "decisions" as TabType, label: "Your Decisions" },
  ];

  return (
    <div className="flex border-b border-gray-200 bg-gray-50/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? "text-blue-600 border-b-2 border-blue-600 bg-white"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
