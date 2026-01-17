import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cageService } from "@/services/cage.service";
import { Camera, Lock, Loader2 } from "lucide-react";
import { Role, Cage } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_auth/cctv")({
  component: CCTV,
});

function CCTV() {
  const { role } = useAuth();
  const hasAccess = role === Role.OWNER || role === Role.INVESTOR;
  const [cages, setCages] = useState<Cage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCages = async () => {
      try {
        const data = await cageService.findAll();
        setCages(data);
      } catch (error) {
        console.error("Error loading cages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasAccess) {
      loadCages();
    } else {
      setLoading(false);
    }
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="text-slate-400 w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Access Restricted
        </h2>
        <p className="text-slate-500 max-w-md">
          CCTV monitoring is available only for Investors and Farm Owners.
          Please contact support if you believe this is an error.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat data kandang...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Monitoring</h1>
        <p className="text-slate-500 text-sm">
          Real-time surveillance of livestock cages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cages.map((cage) => (
          <div
            key={cage.id}
            className="bg-black rounded-xl overflow-hidden shadow-lg relative group"
          >
            {/* Simulated Video Feed */}
            <div className="aspect-video bg-slate-900 relative">
              <img
                src={
                  cage.cctvUrl ||
                  "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=800"
                }
                alt={`CCTV ${cage.name}`}
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full"></div> LIVE
              </div>
              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                {new Date().toLocaleTimeString()}
              </div>

              {/* Play Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 cursor-pointer">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-slate-800">{cage.name}</h3>
                <p className="text-xs text-slate-500">
                  Capacity: {cage.occupied}/{cage.capacity} Sheep
                </p>
              </div>
              <Camera className="text-slate-400 w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {cages.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <Camera size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400">
            Tidak ada kandang dengan CCTV tersedia
          </p>
        </div>
      )}
    </div>
  );
}
