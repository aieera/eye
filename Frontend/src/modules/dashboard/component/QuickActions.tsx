import { ListPlus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="bg-white p-4 rounded-2xl shadow min-h-[110px] flex flex-col justify-between">

      <p className="font-medium text-center text-md">Quick Actions</p>

      <div className="space-y-2 mt-2">
        <button onClick={()=>navigate('/screens/new')} className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-800 text-white py-2 rounded-xl text-sm">
          <Plus className="w-4 h-4" />
          Add Screens
        </button>

        <button className="w-full flex items-center justify-center gap-2 bg-purple-900 hover:bg-purple-800 text-white py-2 rounded-xl text-sm">
          <ListPlus className="w-4 h-4" />
          Create playlist
        </button>
      </div>
    </div>
  );
}