import { useGetDashboardQuery } from "../api/dashboardApi";
import ScreenCard from "../component/ScreenCard";
import ActivityItem from "../component/ActivityItem";
import OfferCard from "../component/OfferCard";
import QuickActions from "../component/QuickActions";
import ScreenStatus from "../component/ScreenStatus";
import StatCard from "../component/StatCard";
import { useGetScreensQuery } from "@/modules/screens/api/screens.api";
import { useGetOffersQuery } from "@/modules/offers/api/offerApi";
import { useGetProductsQuery } from "@/modules/products/api/productApi";
import { Activity, ArrowUpRight, BadgePercent, Monitor, } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate()

    const { data, isLoading } = useGetDashboardQuery();
    const { data: screens = [], isLoading: screensLoading } = useGetScreensQuery();
    const { data: offers = [] } = useGetOffersQuery();
    const { data: products = [] } = useGetProductsQuery();

    const activeScreens = screens.filter(s => s.status === "online").length;
    const totalOffers = offers.length;
    const totalProducts = products.length;

    if (isLoading) return <p>Loading...</p>;



    return (
        <div className="p-1 space-y-6">

            {/* HEADER */}
            <div>
                <h1 className="text-4xl font-semibold ">Dashboard</h1>
                <p className="text-sm text-gray-500">Last visited 12 min ago</p>
            </div>

            {/* TOP SECTION */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Active Screens"
                    value={activeScreens}
                    icon={<Monitor className="w-5 h-5 text-gray-600" />}
                />

                <StatCard
                    title="Total Offers"
                    value={totalOffers}
                    icon={<BadgePercent className="w-5 h-5 text-gray-600" />}
                />

                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    icon={<Activity className="w-5 h-5 text-gray-600" />}
                />

                <QuickActions />
            </div>

            {/* ACTIVE SCREENS */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h2 className="text-lg font-semibold">Active Screens</h2>
                        <p className="text-sm text-gray-500">Recently active</p>
                    </div>

                    <button onClick={() => navigate("/screens")} className="flex items-center gap-2 text-sm font-medium">
                        View all

                        <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full">
                            <ArrowUpRight className="w-4 h-4" />
                        </span>
                    </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {screens.slice(0, 4).map((screen) => (
                        <ScreenCard
                            key={screen.id}
                            image={screen.image || ""}
                            title={screen.screenName}
                            location={screen.location}
                            status={screen.status}
                        />
                    ))}
                </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="grid grid-cols-12 gap-3 items-stretch">

                {/* RECENT ACTIVITY */}
                <div className="col-span-5 bg-white p-4 rounded-2xl shadow h-full">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-semibold text-xl">Recent Activity</h3>
                            <p className="text-xs text-gray-500 font-medium">Today's updates</p>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-medium">
                            View all

                            <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full">
                                <ArrowUpRight className="w-4 h-4" />
                            </span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {data?.activities?.map((activity, index) => (
                            <ActivityItem
                                key={index}
                                status={activity.status}
                                title={activity.title}
                                subtitle={activity.subtitle}
                            />
                        ))}
                    </div>
                </div>

                {/* OFFERS */}
                <div className="col-span-4 bg-white p-4 rounded-2xl shadow h-full">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="font-semibold text-xl">Offers</h3>
                            <p className="text-xs text-gray-500 font-medium">Latest deals and discounts</p>
                        </div>
                        <button onClick={() => navigate("/offers")} className="flex items-center gap-2 text-sm font-medium">
                            View all
                            <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full">
                                <ArrowUpRight className="w-4 h-4" />
                            </span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {offers.slice(0, 2).map((offer) => (
                            <OfferCard
                                key={offer.id}
                                title={offer.name}
                                discount={
                                    offer.offerType === "percentage"
                                        ? `${offer.offerValue}% OFF`
                                        : `₹${offer.offerValue} OFF`
                                }
                                subtitle="Limited time offer"
                                status={offer.status === "active" ? "live" : "coming"}
                                endDate={offer.offerEndDate}
                            />
                        ))}
                    </div>
                </div>


                {/* SCREEN STATUS */}

                <div className="col-span-3 bg-white p-4 rounded-2xl shadow h-full">
                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-xl">Screens Status</h3>
                        <span className="w-8 h-8 flex items-center justify-center bg-black text-white rounded-full">
                            <Monitor className="w-4 h-4" />
                        </span>
                    </div>
                    <ScreenStatus />

                </div>


            </div>

        </div>
    );
}