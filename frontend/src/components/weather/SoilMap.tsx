"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface SoilMapProps {
    lat: number;
    lon: number;
    locationName: string;
    elevation?: number;
    onLocationSelect: (lat: number, lon: number) => void;
}

export default function SoilMap({ lat, lon, locationName, elevation, onLocationSelect }: SoilMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markerRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        let isMounted = true;

        const initMap = async () => {
            const L = (await import("leaflet")).default;

            // Fix default icon assets
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });

            if (!mapInstanceRef.current && mapContainerRef.current && isMounted) {
                const map = L.map(mapContainerRef.current, {
                    center: [lat, lon],
                    zoom: 9,
                    zoomControl: true,
                });

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19,
                }).addTo(map);

                const marker = L.marker([lat, lon]).addTo(map);
                marker.bindPopup(
                    `<div style="font-family: inherit; padding: 2px;">
                        <strong style="color: #15803d; font-size: 13px;">${locationName || "Selected Location"}</strong><br/>
                        <span style="font-size: 11px; color: #4b5563;">Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°</span>
                        ${elevation !== undefined ? `<br/><span style="font-size: 11px; color: #6b7280;">Elevation: ${elevation}m</span>` : ""}
                    </div>`
                );

                map.on("click", (e: any) => {
                    const clickLat = Number(e.latlng.lat.toFixed(4));
                    const clickLon = Number(e.latlng.lng.toFixed(4));
                    onLocationSelect(clickLat, clickLon);
                });

                mapInstanceRef.current = map;
                markerRef.current = marker;
            }
        };

        initMap();

        return () => {
            isMounted = false;
        };
    }, []);

    // Update center and marker on coordinate change
    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lon], mapInstanceRef.current.getZoom() || 9);
            markerRef.current.setLatLng([lat, lon]);
            markerRef.current.setPopupContent(
                `<div style="font-family: inherit; padding: 2px;">
                    <strong style="color: #15803d; font-size: 13px;">${locationName || "Selected Location"}</strong><br/>
                    <span style="font-size: 11px; color: #4b5563;">Lat: ${lat.toFixed(4)}°, Lon: ${lon.toFixed(4)}°</span>
                    ${elevation !== undefined ? `<br/><span style="font-size: 11px; color: #6b7280;">Elevation: ${elevation}m</span>` : ""}
                </div>`
            );
        }
    }, [lat, lon, locationName, elevation]);

    return (
        <div className="relative w-full h-full min-h-[320px] rounded-xl overflow-hidden border border-border bg-card">
            <div ref={mapContainerRef} className="w-full h-full min-h-[320px] z-10" />
            <div className="absolute bottom-2 left-2 z-20 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] text-muted-foreground border border-border shadow-xs pointer-events-none">
                💡 Click anywhere on map to analyze
            </div>
        </div>
    );
}
