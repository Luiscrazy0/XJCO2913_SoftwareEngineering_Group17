import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { stationsApi } from "../api/stations";
import { scootersApi } from "../api/scooters";
import PageLayout from "../components/PageLayout";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorState from "../components/ErrorState";
import AmapMap from "../components/map/AmapMap";
import BookingModal from "../components/BookingModal";
import { useToast } from "../components/ToastProvider";
import { Station, Scooter } from "../types";
import { MarkerConfig } from "../types/amap";
import { scooterKeys, stationKeys } from "../utils/queryKeys";

const MapPage: React.FC = () => {
  const { showToast } = useToast();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [bookingScooter, setBookingScooter] = useState<Scooter | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  }, []);

  // Fetch with pagination - get first 100 items
  const {
    data: stationsData,
    isLoading: isLoadingStations,
    isError: isStationsError,
    error: stationsError,
  } = useQuery({
    queryKey: stationKeys.list("public"),
    queryFn: () => stationsApi.getAll(1, 100),
    staleTime: 30000,
  });

  const {
    data: scootersData,
    isLoading: isLoadingScooters,
    isError: isScootersError,
    error: scootersError,
  } = useQuery({
    queryKey: scooterKeys.list("public"),
    queryFn: () => scootersApi.getAll(1, 100),
    staleTime: 30000,
  });

  const stations = stationsData?.items ?? [];
  const scooters = scootersData?.items ?? [];

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  const handleMarkerClick = (marker: MarkerConfig) => {
    const stationId = marker.extData?.stationId;
    if (stationId) {
      const station = stations.find((s) => s.id === stationId);
      if (station) setSelectedStation(station);
    }
  };

  const handleGoToMyLocation = () => {
    if (userLocation && mapRef.current) {
      try {
        mapRef.current.setCenter([
          userLocation.longitude,
          userLocation.latitude,
        ]);
        mapRef.current.setZoom(15);
        showToast("已回到您的位置", "info");
      } catch {
        showToast("无法移动地图到您的位置", "warning");
      }
    } else {
      showToast("无法获取您的位置", "warning");
    }
  };

  const getAvailableScootersCount = (stationId: string) => {
    return scooters.filter(
      (scooter) =>
        scooter.stationId === stationId && scooter.status === "AVAILABLE",
    ).length;
  };

  // Get marker color based on count
  const getStationColor = (count: number) => {
    if (count >= 3) return "#22c55e"; // green
    if (count >= 1) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const mapMarkers = useMemo(() => {
    return stations.map((station): MarkerConfig => {
      const availableCount = getAvailableScootersCount(station.id);
      return {
        position: [station.longitude, station.latitude] as [number, number],
        title: station.name,
        content: `
          <div class="p-3 bg-white rounded-lg shadow-lg max-w-xs">
            <h4 class="font-bold text-gray-900 mb-2">${station.name}</h4>
            <p class="text-sm text-gray-600 mb-2">${station.address}</p>
            <div class="flex items-center justify-between">
              <span class="text-sm" style="color:${getStationColor(availableCount)}">
                ${availableCount} 辆可用
              </span>
              <button class="text-xs bg-gray-600 text-white px-2 py-1 rounded">查看</button>
            </div>
          </div>
        `,
        extData: {
          stationId: station.id,
          availableCount,
        },
      };
    });
  }, [stations, scooters]);

  const selectedMarker = useMemo(() => {
    if (!selectedStation) return null;
    return (
      mapMarkers.find((m) => m.extData?.stationId === selectedStation.id) ||
      null
    );
  }, [selectedStation, mapMarkers]);

  const mapConfig = useMemo(() => {
    if (userLocation) {
      return {
        center: [userLocation.longitude, userLocation.latitude] as [
          number,
          number,
        ],
        zoom: 14,
      };
    }
    return {
      center: [103.989265, 30.763613] as [number, number],
      zoom: 15,
    };
  }, [userLocation]);

  const isLoading = isLoadingStations || isLoadingScooters;
  const isError = isStationsError || isScootersError;

  if (isLoading) {
    return (
      <PageLayout
        title="滑板车站点地图"
        subtitle="查看附近的滑板车站点及可用车辆信息"
        showBottomNav={false}
      >
        <LoadingSpinner size="large" showText text="正在加载地图数据…" />
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout
        title="滑板车站点地图"
        subtitle="数据加载失败"
        showBottomNav={false}
      >
        <ErrorState
          title="加载失败"
          message={
            stationsError?.message ||
            scootersError?.message ||
            "无法加载地图数据"
          }
          onRetry={() => window.location.reload()}
        />
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        title="滑板车站点地图"
        subtitle="查看附近的滑板车站点及可用车辆信息"
        showBottomNav={false}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Station list */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-line)] p-6">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                站点列表
              </h2>

              {userLocation && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📍 {userLocation.latitude.toFixed(4)},{" "}
                    {userLocation.longitude.toFixed(4)}
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {stations.map((station) => {
                  const availableCount = getAvailableScootersCount(station.id);
                  const isSelected = selectedStation?.id === station.id;
                  return (
                    <div
                      key={station.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[var(--mclaren-orange)] bg-[rgba(255,106,0,0.16)]"
                          : "border-[var(--border-line)] bg-[var(--bg-card)] hover:border-gray-500"
                      }`}
                      onClick={() => handleStationClick(station)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[var(--text-main)]">
                            {station.name}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {station.address}
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor:
                              getStationColor(availableCount) + "20",
                            color: getStationColor(availableCount),
                          }}
                        >
                          {availableCount} 辆
                        </span>
                      </div>
                      {userLocation && (
                        <p className="mt-2 text-xs text-[var(--text-secondary)]">
                          📏{" "}
                          {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            station.latitude,
                            station.longitude,
                          ).toFixed(2)}{" "}
                          km
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Map + Station details */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-line)] p-6">
              <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
                {selectedStation ? selectedStation.name : "选择站点查看详情"}
              </h2>

              <div className="relative">
                <AmapMap
                  config={mapConfig}
                  markers={mapMarkers}
                  selectedMarker={selectedMarker}
                  userLocation={userLocation}
                  onMarkerClick={handleMarkerClick}
                  onMapClick={() => setSelectedStation(null)}
                  className="h-[400px] rounded-lg overflow-hidden border border-gray-300"
                  loading={false}
                  onError={(error) => {
                    console.error("Map load error:", error);
                    showToast("地图加载失败", "error");
                  }}
                />

                {userLocation && (
                  <button
                    onClick={handleGoToMyLocation}
                    className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-md hover:shadow-lg active:scale-95"
                    title="回到我的位置"
                    aria-label="回到我的位置"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Station details with scooters */}
              {selectedStation && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-[var(--text-main)] mb-3">
                        站点信息
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex">
                          <span className="w-16 text-[var(--text-secondary)]">
                            名称:
                          </span>
                          <span className="text-[var(--text-main)]">
                            {selectedStation.name}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-16 text-[var(--text-secondary)]">
                            地址:
                          </span>
                          <span className="text-[var(--text-main)]">
                            {selectedStation.address}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-16 text-[var(--text-secondary)]">
                            坐标:
                          </span>
                          <span className="text-[var(--text-main)]">
                            {selectedStation.latitude.toFixed(4)},{" "}
                            {selectedStation.longitude.toFixed(4)}
                          </span>
                        </div>
                        {userLocation && (
                          <div className="flex">
                            <span className="w-16 text-[var(--text-secondary)]">
                              距离:
                            </span>
                            <span className="text-[var(--text-main)]">
                              {calculateDistance(
                                userLocation.latitude,
                                userLocation.longitude,
                                selectedStation.latitude,
                                selectedStation.longitude,
                              ).toFixed(2)}{" "}
                              km
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-[var(--text-main)] mb-3">
                        可用车辆
                      </h3>
                      {getAvailableScootersCount(selectedStation.id) > 0 ? (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {scooters
                            .filter(
                              (s) =>
                                s.stationId === selectedStation.id &&
                                s.status === "AVAILABLE",
                            )
                            .map((scooter) => (
                              <div
                                key={scooter.id}
                                className="flex items-center justify-between p-3 bg-[var(--bg-input)] border border-[var(--border-line)] rounded-lg"
                              >
                                <div>
                                  <span className="font-medium text-[var(--text-main)] text-sm">
                                    🛴 #{scooter.id.substring(0, 8)}...
                                  </span>
                                  <p className="text-xs text-[var(--text-secondary)]">
                                    {scooter.location}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    // Use BookingModal directly - no page jump
                                    setBookingScooter({
                                      ...scooter,
                                      station: selectedStation,
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-[var(--mclaren-orange)] text-white text-xs font-medium rounded-lg hover:brightness-110"
                                >
                                  预订
                                </button>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">
                            当前站点暂无可用车辆
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageLayout>

      {/* BookingModal inline - no page jump */}
      {bookingScooter && (
        <BookingModal
          isOpen={!!bookingScooter}
          scooter={bookingScooter}
          onClose={() => setBookingScooter(null)}
        />
      )}
    </>
  );
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default MapPage;
