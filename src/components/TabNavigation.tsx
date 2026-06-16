import { TabType } from "../types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "current", label: "Situation" },
  { id: "uncertainty", label: "Markets" },
  { id: "decisions", label: "Decisions" },
];

export const TabNavigation = ({
  activeTab,
  onTabChange,
}: TabNavigationProps) => {
  return (
    <div className="flex items-end gap-[30px] px-[40px] h-[54px] border-b border-line">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`text-[14.5px] pb-[15px] transition-colors ${
              active
                ? "font-bold text-ink border-b-2 border-ink mb-[-1px]"
                : "font-medium text-muted hover:text-inksoft"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
