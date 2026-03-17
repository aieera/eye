import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, Copy, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    useCreateScreenMutation,
    useGetScreenByIdQuery,
    useUpdateScreenMutation
} from "../api/screens.api";
import { useGetPlaylistsQuery } from "@/modules/playlists/api/playlistApi";
import { useGetProductsQuery } from "@/modules/products/api/productApi";
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
        address: ""
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

    const { data: screenData } = useGetScreenByIdQuery(id as string, { skip: !id });

    const playlistProducts = expandedPlaylist
        ? expandedPlaylist.products
            .map((pid: string) => products.find((p: any) => p.id === pid))
            .filter(Boolean)
        : [];

    const togglePlaylist = (playlist: any) => {

        const exists = selectedPlaylists.find(p => p.id === playlist.id);

        if (exists) {
            setSelectedPlaylists(prev => prev.filter(p => p.id !== playlist.id));
            setExpandedPlaylist(null);
        }
        else {
            setSelectedPlaylists(prev => [...prev, playlist]);
            setExpandedPlaylist(playlist);
        }

    };

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(URL.createObjectURL(file));
    };

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);

        setCopiedId(id);

        toast({
            title: "Screen code copied",
            className: "border-green-200 bg-gray-50 shadow",
        });

        setTimeout(() => {
            setCopiedId(null);
        }, 1500);
    };

    const handleSubmit = async () => {
        try {
            if (id) {
                await updateScreen({ id, ...form });
                toast({ title: "Screen updated" });
            } else {
                const newScreen = {
                    ...form,
                    status: "sync",
                    createdAt: new Date().toLocaleString(),
                    lastSync: "Just now"
                };
                await createScreen(newScreen);
                toast({ title: "Screen created" });
            }
            navigate("/screens");
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong"
            });
        }
    };


    useEffect(() => {

        if (id && screenData) {

            setForm({
                screenName: screenData.screenName,
                screenCode: screenData.screenCode,
                location: screenData.location || "",
                locationId: screenData.locationId || "",
                latitude: screenData.latitude || "",
                longitude: screenData.longitude || "",
                address: screenData.address || ""
            });

            // load existing playlists
            if (screenData.playlists) {
                setAddedPlaylists(screenData.playlists);
            }

        } else if (!id) {

            setForm({
                screenName: generateScreenName(),
                screenCode: generateScreenCode(),
                location: "",
                locationId: "",
                latitude: "",
                longitude: "",
                address: ""
            });

        }

    }, [id, screenData]);

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

            {/* FORM CONTAINER */}
            <div className="bg-gray-200 rounded-xl p-6">

                <div className="grid grid-cols-3 gap-6">

                    {/* IMAGE UPLOAD */}
                    <div>

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-64 rounded-lg overflow-hidden bg-white border cursor-pointer flex items-center justify-center relative"
                        >

                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400 text-sm">
                                    <Upload size={20} />
                                    Upload Screen Image
                                </div>
                            )}

                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                    </div>

                    {/* FORM */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">

                        {/* Screen Name */}
                        <div>
                            <label className="text-xs text-gray-600">
                                Screen name
                            </label>

                            <input
                                value={form.screenName}
                                disabled
                                className="w-full h-9 border rounded-lg px-3 bg-gray-100 text-sm"
                            />
                        </div>

                        {/* Screen Code */}
                        <div>
                            <label className="text-xs text-gray-600">
                                Screen code
                            </label>

                            <div className="flex">

                                <input
                                    value={form.screenCode}
                                    disabled
                                    className="w-full h-9 border rounded-l-lg px-3 bg-gray-100 text-sm"
                                />

                                <button
                                    onClick={() => copyCode(form.screenCode, "code")}
                                    className="text-gray-400 px-3 shadow hover:text-black"
                                >
                                    {copiedId === "code" ? (
                                        <Check size={16} className="text-green-600" />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                </button>

                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="text-xs text-gray-600">
                                Location name
                            </label>

                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full h-9 border rounded-lg px-3 text-sm"
                            />
                        </div>

                        {/* Location ID */}
                        <div>
                            <label className="text-xs text-gray-600">
                                Location ID
                            </label>

                            <input
                                name="locationId"
                                value={form.locationId}
                                onChange={handleChange}
                                className="w-full h-9 border rounded-lg px-3 text-sm"
                            />
                        </div>

                        {/* Longitude */}
                        <div>
                            <label className="text-xs text-gray-600">
                                Longitude
                            </label>

                            <input
                                name="longitude"
                                value={form.longitude}
                                onChange={handleChange}
                                className="w-full h-9 border rounded-lg px-3 text-sm"
                            />
                        </div>

                        {/* Latitude */}
                        <div>
                            <label className="text-xs text-gray-600">
                                Latitude
                            </label>

                            <input
                                name="latitude"
                                value={form.latitude}
                                onChange={handleChange}
                                className="w-full h-9 border rounded-lg px-3 text-sm"
                            />
                        </div>

                        {/* Address */}
                        <div className="col-span-2">
                            <label className="text-xs text-gray-600">
                                Address
                            </label>

                            <input
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full h-9 border rounded-lg px-3 text-sm"
                            />
                        </div>

                    </div>

                </div>

            </div>

            {/* ASSIGN PLAYLIST */}
            <div className="bg-gray-200 rounded-xl p-6 space-y-5">

                <div>
                    <h2 className="font-semibold">Assign Playlist</h2>
                    <p className="text-xs text-gray-500">
                        Select a content playlist for this screen
                    </p>
                </div>

                {/* SELECT PLAYLIST BOX */}
                <div className="relative">

                    <label className="text-xs text-gray-600">Select Playlist</label>

                    <div
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="w-full h-9 border rounded-lg px-3 flex items-center justify-between bg-white cursor-pointer text-sm"
                    >
                        {selectedPlaylists.length > 0
                            ? selectedPlaylists.map((p: any) => p.name).join(", ")
                            : "Select Playlist"}
                    </div>

                </div>

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
                        {playlists.map((playlist: any) => {

                            const checked = selectedPlaylists.some(p => p.id === playlist.id)

                            return (

                                <div key={playlist.id} className="border-b pb-3">

                                    <div className="flex justify-between items-center">

                                        <div className="flex items-center gap-3">

                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => togglePlaylist(playlist)}
                                            />

                                            <div>
                                                <p className="text-sm">{playlist.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Products counts : {playlist.products.length}
                                                </p>
                                            </div>

                                        </div>

                                        <div className="flex items-center gap-2">

                                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                                                Online
                                            </span>

                                            <button
                                                onClick={() => setExpandedPlaylist(
                                                    expandedPlaylist?.id === playlist.id ? null : playlist
                                                )}
                                            >
                                                {expandedPlaylist?.id === playlist.id ? "▲" : "▼"}
                                            </button>

                                        </div>

                                    </div>

                                    {/* Expanded Playlist */}
                                    {expandedPlaylist?.id === playlist.id && (

                                        <div className="mt-4 space-y-4">

                                            {/* Schedule */}
                                            <div>
                                                 <p className="text-sm font-medium mb-2">Schedule Playlist</p>

                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={scheduleEnabled}
                                                        onChange={() => setScheduleEnabled(!scheduleEnabled)}
                                                    />
                                                    Set Date & Time
                                                </label>

                                                {scheduleEnabled && (
                                                    <div className="grid grid-cols-2 gap-4 mt-2">

                                                        <div className="flex gap-2">
                                                            <input
                                                                type="date"
                                                                value={startDate}
                                                                onChange={(e) => setStartDate(e.target.value)}
                                                                className="border rounded-lg px-2 h-9 text-sm w-full"
                                                            />

                                                            <input
                                                                type="time"
                                                                value={startTime}
                                                                onChange={(e) => setStartTime(e.target.value)}
                                                                className="border rounded-lg px-2 h-9 text-sm w-full"
                                                            />
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <input
                                                                type="date"
                                                                value={endDate}
                                                                onChange={(e) => setEndDate(e.target.value)}
                                                                className="border rounded-lg px-2 h-9 text-sm w-full"
                                                            />

                                                            <input
                                                                type="time"
                                                                value={endTime}
                                                                onChange={(e) => setEndTime(e.target.value)}
                                                                className="border rounded-lg px-2 h-9 text-sm w-full"
                                                            />
                                                        </div>

                                                    </div>
                                                )}

                                            </div>

                                            {/* Products */}
                                            <div>

                                                <p className="text-sm font-medium mb-2">Products</p>

                                                <div className="flex gap-3 overflow-x-auto">

                                                    {playlistProducts.map((product: any) => {

                                                        const image =
                                                            product?.variants?.[0]?.variant_media?.[0]?.media_url

                                                        return (

                                                            <div key={product.id} className="relative w-28">

                                                                <img
                                                                    src={image}
                                                                    className="w-28 h-20 object-cover rounded-lg"
                                                                />

                                                                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5">
                                                                    {product.name}
                                                                </span>

                                                            </div>

                                                        )

                                                    })}

                                                </div>

                                            </div>

                                            {/* Buttons */}
                                            <div className="flex justify-end gap-3">

                                                <button
                                                    onClick={() => setExpandedPlaylist(null)}
                                                    className="px-4 py-2 border rounded-lg text-sm"
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (!expandedPlaylist) return;

                                                        const newPlaylist = {
                                                            ...expandedPlaylist,
                                                            startDate,
                                                            startTime,
                                                            endDate,
                                                            endTime
                                                        };

                                                        setAddedPlaylists(prev => {
                                                            const exists = prev.find(p => p.id === expandedPlaylist.id);
                                                            if (exists) return prev;
                                                            return [...prev, newPlaylist];
                                                        });

                                                        setSelectedPlaylists(prev => {
                                                            const exists = prev.find(p => p.id === expandedPlaylist.id);
                                                            if (exists) return prev;
                                                            return [...prev, expandedPlaylist];
                                                        });
                                                        

                                                        setExpandedPlaylist(null);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                                                >
                                                    Add Playlist
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                </div>

                            )

                        })}

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