import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
    useCreateScreenMutation,
    useGetScreenByIdQuery,
    useUpdateScreenMutation,
} from "../api/screens.api";
import { useGetPlaylistsQuery } from "@/modules/playlists/api/playlistApi";
import { useGetProductsQuery } from "@/modules/products/api/productApi";
import ImageUpload from "../components/ImageUpload";
import ScreenForm from "../components/ScreenForm";
import PlaylistDropdown from "../components/PlaylistDropdown";
import PlaylistItem from "../components/PlaylistItem";
import PlaylistExpanded from "../components/PlaylistExpanded";
import AddedPlaylists from "../components/AddedPlaylists";

export default function ManageScreens() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();

    const [copiedId, setCopiedId] = useState(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [createScreen] = useCreateScreenMutation();
    const [updateScreen] = useUpdateScreenMutation();
    const { data: playlists = [] } = useGetPlaylistsQuery();
    const { data: products = [] } = useGetProductsQuery();

    const generateScreenName = () => {
        const num = Math.floor(Math.random() * 9999)
            .toString()
            .padStart(4, "0");
        return `Screen ${num}`;
    };

    const generateScreenCode = () => {
        return "dvc_tok_" + Math.random().toString(36).substring(2, 18);
    };

    const [form, setForm] = useState({
        screenName: "",
        screenCode: "",
        location: "",
        locationId: "",
        latitude: "",
        longitude: "",
        address: "",
    });

    const [imagePreview, setImagePreview] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedPlaylists, setSelectedPlaylists] = useState<any[]>([]);
    const [expandedPlaylist, setExpandedPlaylist] = useState<any>(null);
    const [scheduleEnabled, setScheduleEnabled] = useState(true);
    const [addedPlaylists, setAddedPlaylists] = useState<any[]>([]);

    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");

    const { data: screenData } = useGetScreenByIdQuery(id as string, {
        skip: !id,
    });

    const playlistProducts = expandedPlaylist
        ? expandedPlaylist.products
            .map((pid: string) =>
                products.find((p: any) => p.id === pid)
            )
            .filter(Boolean)
        : [];

    const togglePlaylist = (playlist: any) => {
        const exists = selectedPlaylists.find((p) => p.id === playlist.id);

        if (exists) {
            setSelectedPlaylists((prev) =>
                prev.filter((p) => p.id !== playlist.id)
            );
            setExpandedPlaylist(null);
        } else {
            setSelectedPlaylists((prev) => [...prev, playlist]);
            setExpandedPlaylist(playlist);
        }
    };

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
    };

    const copyCode = (code: string, id: any) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);

        toast({
            title: "Screen code copied",
            className: "border-green-200 bg-gray-50 shadow",
        });

        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                ...form,
                playlistAssignments: addedPlaylists.map((p: any) => ({
                    playlistId: p.playlistId,
                    playlistName: p.name,
                    startDate: p.startDate,
                    startTime: p.startTime,
                    endDate: p.endDate,
                    endTime: p.endTime,
                })),
            };

            if (id && screenData) {

                const updatedScreen = {
                    ...screenData,    
                    ...payload,        

                    lastSync: "Just now", 
                };

                await updateScreen({ id, ...updatedScreen });

                toast({ title: "Screen updated" });
                navigate("/screens");
            } else {
                const newScreen = {
                    ...payload,
                    status: "sync",
                    createdAt: new Date().toLocaleString(),
                    lastSync: "Just now",
                };

                await createScreen(newScreen);
                toast({ title: "Screen created" });
                navigate("/screens");
            }
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong",
            });
        }
    };


    useEffect(() => {
        if (id && screenData) {

            // FORM
            setForm({
                screenName: screenData.screenName,
                screenCode: screenData.screenCode,
                location: screenData.location || "",
                locationId: screenData.locationId || "",
                latitude: screenData.latitude || "",
                longitude: screenData.longitude || "",
                address: screenData.address || "",
            });

            if (screenData?.playlistAssignments && playlists.length > 0) {

                const fullPlaylists = screenData.playlistAssignments
                    .map((pa: any) => {
                        const full = playlists.find(
                            (p: any) => p.playlistId === pa.playlistId
                        );

                        if (!full) return null;

                        return {
                            ...full,
                            startDate: pa.startDate,
                            startTime: pa.startTime,
                            endDate: pa.endDate,
                            endTime: pa.endTime,
                        };
                    })
                    .filter(Boolean);

                setAddedPlaylists(fullPlaylists);
                setSelectedPlaylists(fullPlaylists);
                setExpandedPlaylist(fullPlaylists[0] || null);

                const first = fullPlaylists[0];
                if (first) {
                    setStartDate(first.startDate || "");
                    setStartTime(first.startTime || "");
                    setEndDate(first.endDate || "");
                    setEndTime(first.endTime || "");
                }
            }

        } else if (!id) {

            setForm({
                screenName: generateScreenName(),
                screenCode: generateScreenCode(),
                location: "",
                locationId: "",
                latitude: "",
                longitude: "",
                address: "",
            })
        }
    }, [id, screenData, playlists]);




    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-2xl font-semibold">
                    {id ? "Edit Screen" : "Add Screen"}
                </h1>
                <p className="text-sm text-gray-500">
                    Screens / {id ? "Edit Screen" : "Add Screens"}
                </p>
            </div>

            {/* FORM */}
            <div className="bg-gray-200 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-6">

                    <ImageUpload
                        imagePreview={imagePreview}
                        fileInputRef={fileInputRef}
                        handleImageUpload={handleImageUpload}
                    />

                    <ScreenForm
                        form={form}
                        handleChange={handleChange}
                        copyCode={copyCode}
                        copiedId={copiedId}
                    />

                </div>
            </div>

            {/* PLAYLIST SECTION */}
            <div className="bg-gray-200 rounded-xl p-6 space-y-5">

                <div>
                    <h2 className="font-semibold">Assign Playlist</h2>
                    <p className="text-xs text-gray-500">
                        Select a content playlist for this screen
                    </p>
                </div>

                <PlaylistDropdown
                    selectedPlaylists={selectedPlaylists}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                />

                {showDropdown && (
                    <div className="bg-white border rounded-xl mt-2 p-4 space-y-4 shadow">

                        {/* Search */}
                        <div className="flex items-center border rounded-lg px-3 h-9">
                            <input
                                placeholder="Search Playlist"
                                className="flex-1 outline-none text-sm"
                            />
                        </div>

                        {/* Playlist list */}
                        {playlists.map((playlist: any) => (
                            <div key={playlist.id} className="border-b pb-3">

                                <PlaylistItem
                                    playlist={playlist}
                                    selectedPlaylists={selectedPlaylists}
                                    togglePlaylist={togglePlaylist}
                                    expandedPlaylist={expandedPlaylist}
                                    setExpandedPlaylist={setExpandedPlaylist}
                                />

                                {expandedPlaylist?.id === playlist.id && (
                                    <PlaylistExpanded
                                        expandedPlaylist={expandedPlaylist}
                                        playlistProducts={playlistProducts}
                                        scheduleEnabled={scheduleEnabled}
                                        setScheduleEnabled={setScheduleEnabled}
                                        startDate={startDate}
                                        setStartDate={setStartDate}
                                        startTime={startTime}
                                        setStartTime={setStartTime}
                                        endDate={endDate}
                                        setEndDate={setEndDate}
                                        endTime={endTime}
                                        setEndTime={setEndTime}
                                        setAddedPlaylists={setAddedPlaylists}
                                        setSelectedPlaylists={setSelectedPlaylists}
                                        setExpandedPlaylist={setExpandedPlaylist}
                                        setShowDropdown={setShowDropdown}
                                    />
                                )}

                            </div>
                        ))}

                    </div>
                )}

                <AddedPlaylists
                    playlists={addedPlaylists}
                    products={products}
                />

            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
                <button
                    onClick={() => navigate("/screens")}
                    className="px-5 py-2 border rounded-lg text-sm"
                >
                    Cancel
                </button>

                <button
                    onClick={handleSubmit}
                    className="px-5 py-2 bg-black text-white rounded-lg text-sm"
                >
                    Save
                </button>
            </div>

        </div>
    );
}