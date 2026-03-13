import { useState, useEffect } from "react";
import { useGetScreensQuery } from "../api/screens.api";
import ScreenStats from "../components/ScreenStats";
import ScreenToolbar from "../components/ScreenToolbar";
import ScreenTable from "../components/ScreenTable";
import ScreenGrid from "../components/ScreenGrid";
import Pagination from "../components/Pagination";

export default function ScreensPage() {

  const { data: screens = [] } = useGetScreensQuery();

  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);

  const itemsPerPage = 5;

  const totalPages = Math.ceil(screens.length / itemsPerPage);

  const start = (page - 1) * itemsPerPage;

  const paginatedScreens = screens.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [screens]);

  return (
    <div className="p-1 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">Screens</h1>
        <p className="text-sm text-gray-500 mt-1">Screens</p>
      </div>

      <ScreenStats screens={screens} />

      <ScreenToolbar view={view} setView={setView} />

      {view === "list"
        ? <ScreenTable screens={paginatedScreens} />
        : <ScreenGrid screens={paginatedScreens} />
      }

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

    </div>
  );
}