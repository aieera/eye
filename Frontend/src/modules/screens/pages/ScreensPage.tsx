import { useState, useEffect } from "react";
import { useGetScreensQuery } from "../api/screens.api";
import ScreenStats from "../components/ScreenStats";
import ScreenToolbar from "../components/ScreenToolbar";
import ScreenTable from "../components/ScreenTable";
import ScreenGrid from "../components/ScreenGrid";
import Pagination from "../../../shared/components/Pagination";

export default function ScreensPage() {

  const { data: screens = [] } = useGetScreensQuery();

  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("")

  const filteredScreens = screens.filter((screen) =>
    screen.screenName.toLowerCase().includes(search.toLowerCase())
  )

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredScreens.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const paginatedScreens = filteredScreens.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [filteredScreens]);

  return (
    <div className="p-1 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">Screens</h1>
        <p className="text-sm text-gray-500 mt-1">Screens</p>
      </div>

      <ScreenStats screens={screens} />

      <ScreenToolbar
        view={view}
        setView={setView}
        search={search}
        setSearch={setSearch}
      />

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