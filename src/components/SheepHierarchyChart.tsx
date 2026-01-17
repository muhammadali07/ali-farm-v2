import React from "react";
import { Sheep } from "@/types";
import { ChevronDown, Circle, User } from "lucide-react";

interface SheepHierarchyChartProps {
  sheep: Sheep[];
}

interface SheepNodeProps {
  sheep: Sheep;
  level?: number;
}

const SheepNode: React.FC<SheepNodeProps> = ({ sheep, level = 0 }) => {
  const hasChildren = sheep.children && sheep.children.length > 0;
  const genderColor = sheep.gender === "Male" ? "blue" : "pink";
  const statusColor =
    sheep.status === "Healthy"
      ? "green"
      : sheep.status === "Sick"
      ? "yellow"
      : sheep.status === "Sold"
      ? "blue"
      : "red";

  return (
    <div className="flex flex-col items-center">
      {/* Node */}
      <div
        className={`
          relative p-3 rounded-xl border-2 transition-all hover:shadow-lg
          ${sheep.gender === "Male"
            ? "bg-blue-50 border-blue-200 hover:border-blue-400"
            : "bg-pink-50 border-pink-200 hover:border-pink-400"
          }
          ${level === 0 ? "min-w-[160px]" : "min-w-[140px]"}
        `}
      >
        {/* Gender indicator */}
        <div
          className={`
            absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
            ${sheep.gender === "Male" ? "bg-blue-500" : "bg-pink-500"}
          `}
        >
          {sheep.gender === "Male" ? "M" : "F"}
        </div>

        {/* Birth type badge */}
        {sheep.birthType === "Born" && (
          <div className="absolute -top-2 -left-2 px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded-full">
            LAHIR
          </div>
        )}

        {/* Content */}
        <div className="text-center">
          <p className="font-mono font-bold text-slate-800 text-sm">
            {sheep.tagId}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{sheep.breed}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <span
              className={`
                w-2 h-2 rounded-full
                ${statusColor === "green"
                  ? "bg-green-500"
                  : statusColor === "yellow"
                  ? "bg-yellow-500"
                  : statusColor === "blue"
                  ? "bg-blue-500"
                  : "bg-red-500"
                }
              `}
            />
            <span className="text-[10px] text-slate-400">{sheep.status}</span>
          </div>
          {sheep.dob && (
            <p className="text-[10px] text-slate-400 mt-1">
              {new Date(sheep.dob).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
          {sheep.marketValue && (
            <p className="text-xs font-semibold text-green-600 mt-1">
              Rp {(sheep.marketValue / 1000000).toFixed(1)}Jt
            </p>
          )}
        </div>
      </div>

      {/* Connector line to children */}
      {hasChildren && (
        <>
          <div className="w-0.5 h-6 bg-slate-300" />
          <div className="flex items-center">
            <div className="h-0.5 bg-slate-300" style={{ width: `${(sheep.children!.length - 1) * 80}px` }} />
          </div>
        </>
      )}

      {/* Children */}
      {hasChildren && (
        <div className="flex gap-4 mt-0">
          {sheep.children!.map((child, index) => (
            <div key={child.id} className="flex flex-col items-center">
              {/* Vertical line from horizontal connector */}
              <div className="w-0.5 h-6 bg-slate-300" />
              <SheepNode sheep={child} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SheepHierarchyChart: React.FC<SheepHierarchyChartProps> = ({ sheep }) => {
  if (sheep.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Tidak ada data silsilah</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 justify-center min-w-max p-4">
        {sheep.map((parentSheep) => (
          <div key={parentSheep.id} className="flex flex-col items-center">
            {/* Label for parent */}
            <div className="mb-2 px-3 py-1 bg-slate-100 rounded-full">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Induk
              </span>
            </div>
            <SheepNode sheep={parentSheep} />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
            M
          </div>
          <span className="text-xs text-slate-500">Jantan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
            F
          </div>
          <span className="text-xs text-slate-500">Betina</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-1.5 py-0.5 bg-green-500 text-white text-[8px] font-bold rounded-full">
            LAHIR
          </div>
          <span className="text-xs text-slate-500">Lahir dari kontrak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-500">Sehat</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-xs text-slate-500">Sakit</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs text-slate-500">Terjual</span>
        </div>
      </div>
    </div>
  );
};

export default SheepHierarchyChart;
