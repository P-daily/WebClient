"use client";

import { LargeNumberLike } from "crypto";
import React, { useState, useEffect, useRef } from "react";

type Car = {
  id: number;
  license_plate: string;
};

type ParkingArea = {
  id: number;
  parking_type: string;
  license_plate: string | null;
  bottom_right_x: number;
  bottom_right_y: number;
  top_left_x: number;
  top_left_y: number;
};

type Log = {
  id: number;
  log: string;
  timestamp: string;
  type: string;
};

type DataState = {
  timestamp: string;
  cars: Car[];
  parkingAreas: ParkingArea[];
  logs: Log[];
};



const ParkingConsoleApp: React.FC = () => {
  const [data, setData] = useState<DataState>({
    timestamp: "",
    cars: [],
    parkingAreas: [],
    logs: [],
  });

  const logsRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsResponse, areasResponse, logsResponse] = await Promise.all([
          fetch("http://127.0.0.1:8080/cars_on_parking_license_plates", { method: "GET", headers: { Accept: 'application/json' } }),
          fetch("http://127.0.0.1:8080/get_parking_data", { method: "GET", headers: { Accept: 'application/json' } }),
          fetch("http://127.0.0.1:8080/logs", { method: "GET", headers: { Accept: 'application/json' } })
        ]);

        if (!carsResponse.ok || !areasResponse.ok || !logsResponse.ok) {
          throw new Error("Failed to fetch data from the server.");
        }

        if (!carsResponse.ok) throw new Error("Failed to fetch cars data.");
        if (!areasResponse.ok) throw new Error("Failed to fetch areas data.");
        if (!logsResponse.ok) throw new Error("Failed to fetch logs data.");
      
        const [carsData, areasData, logsData] = await Promise.all([
          carsResponse.json(),
          
          areasResponse.json(),
          logsResponse.json()
        ]);
  
        setData((prevState) => {
          console.log("Updated Data:", {
            ...prevState,
            cars: carsData.cars || [],
            parkingAreas: areasData || [],
            logs: logsData || [],
            timestamp: new Date().toISOString(),
          });
          return {
            ...prevState,
            cars: carsData.cars || [],
            parkingAreas: areasData || [],
            logs: logsData || [],
            timestamp: new Date().toISOString(),
          };
        });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setData((prevState) => ({
          ...prevState,
          errors: ["Failed to fetch data from the server."],
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll effect for logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTo({ top: logsRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [data.logs]);


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 font-mono flex flex-col gap-8">
    <h1 className="font-mono text-center text-3xl flex justify-center items-center">
      Parking Monitoring System
    </h1>
    <div className="flex flex-row gap-8">
      <div className="w-1/3 flex flex-col gap-8">
        {/* Cars Section */}
        <div className="top-0 left-0 w-full h-full bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Cars</h2>
          {data.cars.length > 0 ? (
            data.cars.map((car, index) => (
              <div key={index} className="border-b border-gray-700 py-3">
                <p className="text-lg">License Plate: {car.license_plate}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No cars found.</p>
          )}
        </div>
  
        {/* Parking Spots Section */}
        <div className="left-0 bottom-0 w-full h-full bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-center">Parking Spots</h2>
          {data.parkingAreas.length > 0 ? (
            data.parkingAreas
              .filter(area => !["ROAD", "ENTRANCE", "EXIT", "EXITV2"].includes(area.parking_type)) // Exclude specific types
              .map((area) => (
                <div key={area.id} className="border-b border-gray-700 py-3">
                  <p className="text-sm">Type: {area.parking_type}</p>
                  <p
                    className={`text-sm ${!area.license_plate || area.license_plate === "UNKNOWN" ? "text-green-500" : "text-red-500"}`}
                  >
                    License Plate: {area.license_plate || ""}
                  </p>
                </div>
              ))
          ) : (
            <p className="text-gray-400">No parking areas found.</p>
          )}
        </div>
      </div>
      <div className="top-0 right-0 w-full h-full bg-gray-800 p-4 rounded-lg shadow-md ">
      <h2 className="text-2xl font-semibold mb-4 text-red-500 text-center">Logs</h2>
       {/* Logs Section */}
       <div ref={logsRef} className="top-0 right-0 w-full h-full bg-gray-800 p-4 rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
        {data.logs.length > 0 ? (
          data.logs.map((log, index) => (
            <div key={log.id} className="border-b border-gray-700 py-3">
              <p className="text-m">Timestamp: {log.timestamp}</p>
              <p className="text-m">Type: {log.type}</p>
              <p className="text-m">Message: {log.log}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No logs available at this time.</p>
        )}
      </div>
    </div>
      </div>
     
  </div>
  );
};

export default ParkingConsoleApp;
